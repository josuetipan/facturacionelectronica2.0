import { InvoiceInput, buildAndSign, sendReception, getAuthorization } from '../sri/openFacturaService';
import { buildRideHtml } from '../ride/rideHtml';
import { sendInvoiceEmail } from '../services/emailService';
import { invoiceRepo } from '../repositories';

export type CreateInvoiceRequest = InvoiceInput & { emailCliente?: string };

export type CreateInvoiceResponse = {
  claveAcceso: string;
  estado: 'AUTORIZADO' | 'NO AUTORIZADO' | 'DEVUELTA';
  numeroAutorizacion?: string;
  fechaAutorizacion?: string;
  mensajes?: string[];
};

/**
 * Crea y autoriza una factura electrónica completa
 */
export async function crearYAutorizarFactura(payload: CreateInvoiceRequest): Promise<CreateInvoiceResponse> {
  try {
    console.info('Iniciando proceso de facturación electrónica');
    
    // 1. Construir y firmar la factura
    const { invoice, accessKey, xml, signedXml } = await buildAndSign(payload);
    console.info(`Factura construida y firmada con clave: ${accessKey}`);
    
    // 2. Verificar que no exista un secuencial duplicado
    const existingInvoice = await invoiceRepo.findByClave(accessKey);
    if (existingInvoice) {
      console.warn(`Secuencial duplicado detectado: ${accessKey}`);
      return {
        claveAcceso: accessKey,
        estado: 'DEVUELTA',
        mensajes: ['Secuencial ya existe para este establecimiento/punto de emisión']
      };
    }
    
    // 3. Guardar registro inicial
    await invoiceRepo.upsertByClave({
      claveAcceso: accessKey,
      estado: 'RECIBIDA',
      xmlFirmado: signedXml,
      estab: payload.infoTributaria.estab,
      ptoEmi: payload.infoTributaria.ptoEmi,
      secuencial: payload.infoTributaria.secuencial,
      total: payload.infoFactura.importeTotal,
      emailCliente: payload.emailCliente
    });
    
    // 4. Enviar al SRI para recepción
    const receptionResult = await sendReception(signedXml);
    console.info(`Resultado de recepción: ${receptionResult.estado}`);
    
    if (receptionResult.estado === 'DEVUELTA') {
      // Actualizar estado y guardar mensajes de error
      await invoiceRepo.upsertByClave({
        claveAcceso: accessKey,
        estado: 'DEVUELTA',
        xmlFirmado: signedXml,
        estab: payload.infoTributaria.estab,
        ptoEmi: payload.infoTributaria.ptoEmi,
        secuencial: payload.infoTributaria.secuencial,
        total: payload.infoFactura.importeTotal,
        emailCliente: payload.emailCliente
      });
      
      return {
        claveAcceso: accessKey,
        estado: 'DEVUELTA',
        mensajes: receptionResult.mensajes
      };
    }
    
    // 5. Consultar autorización
    const authorizationResult = await getAuthorization(accessKey);
    console.info(`Resultado de autorización: ${authorizationResult.estado}`);
    
    if (authorizationResult.estado === 'AUTORIZADO') {
      // 6. Generar RIDE HTML
      const rideHtml = buildRideHtml(authorizationResult.xmlAutorizado!);
      console.info('RIDE HTML generado exitosamente');
      
      // 7. Guardar registro autorizado
      await invoiceRepo.upsertByClave({
        claveAcceso: accessKey,
        estado: 'AUTORIZADO',
        xmlFirmado: signedXml,
        xmlAutorizado: authorizationResult.xmlAutorizado,
        numeroAutorizacion: authorizationResult.numeroAutorizacion,
        fechaAutorizacion: authorizationResult.fechaAutorizacion,
        estab: payload.infoTributaria.estab,
        ptoEmi: payload.infoTributaria.ptoEmi,
        secuencial: payload.infoTributaria.secuencial,
        total: payload.infoFactura.importeTotal,
        emailCliente: payload.emailCliente
      });
      
      // 8. Enviar email si se proporcionó
      if (payload.emailCliente) {
        try {
          await sendInvoiceEmail(
            payload.emailCliente,
            accessKey,
            authorizationResult.xmlAutorizado!,
            rideHtml
          );
          console.info(`Email enviado exitosamente a: ${payload.emailCliente}`);
        } catch (emailError) {
          console.error('Error enviando email:', emailError);
          // No fallar el proceso por error de email
        }
      }
      
      return {
        claveAcceso: accessKey,
        estado: 'AUTORIZADO',
        numeroAutorizacion: authorizationResult.numeroAutorizacion,
        fechaAutorizacion: authorizationResult.fechaAutorizacion
      };
    } else {
      // Actualizar estado y guardar mensajes de error
      await invoiceRepo.upsertByClave({
        claveAcceso: accessKey,
        estado: 'NO AUTORIZADO',
        xmlFirmado: signedXml,
        estab: payload.infoTributaria.estab,
        ptoEmi: payload.infoTributaria.ptoEmi,
        secuencial: payload.infoTributaria.secuencial,
        total: payload.infoFactura.importeTotal,
        emailCliente: payload.emailCliente
      });
      
      return {
        claveAcceso: accessKey,
        estado: 'NO AUTORIZADO',
        mensajes: authorizationResult.mensajes
      };
    }
  } catch (error) {
    console.error('Error en crearYAutorizarFactura:', error);
    throw new Error(`Error en proceso de facturación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Obtiene una factura por su clave de acceso
 */
export async function obtenerFacturaPorClave(claveAcceso: string): Promise<any> {
  try {
    const factura = await invoiceRepo.findByClave(claveAcceso);
    if (!factura) {
      throw new Error('Factura no encontrada');
    }
    return factura;
  } catch (error) {
    console.error('Error obteniendo factura:', error);
    throw error;
  }
}

/**
 * Lista las últimas facturas
 */
export async function listarFacturas(limit: number = 50): Promise<any[]> {
  try {
    return await invoiceRepo.list(limit);
  } catch (error) {
    console.error('Error listando facturas:', error);
    return [];
  }
}
