import { 
  generateInvoice, 
  generateInvoiceXml, 
  getP12FromLocalFile,
  getP12FromUrl,
  signXml, 
  documentReception, 
  documentAuthorization 
} from '../index';
import { readFile } from 'fs/promises';
import { URL } from 'url';

export type BuildResult = {
  invoice: any;        // objeto factura que exige open-factura
  accessKey: string;   // clave de acceso retornada por generateInvoice
  xml: string;         // XML sin firmar
  signedXml: string;   // XML firmado XAdES-BES
};

export type ReceptionResult = {
  estado: 'RECIBIDA' | 'DEVUELTA';
  mensajes?: string[];
};

export type AuthorizationResult = {
  estado: 'AUTORIZADO' | 'NO AUTORIZADO';
  numeroAutorizacion?: string;
  fechaAutorizacion?: string;
  xmlAutorizado?: string; // XML envuelto en <autorizacion> si aplica
  mensajes?: string[];
};

export type InvoiceInput = {
  infoTributaria: {
    ambiente: "1" | "2";
    tipoEmision: "1";
    ruc: string; 
    estab: string; 
    ptoEmi: string; 
    secuencial: string; 
    codDoc: "01";
    razonSocial: string; 
    dirMatriz: string;
  };
  infoFactura: {
    fechaEmision: string; 
    dirEstablecimiento: string;
    tipoIdentificacionComprador: string; 
    razonSocialComprador: string; 
    identificacionComprador: string;
    totalSinImpuestos: number; 
    totalDescuento: number;
    totalConImpuestos: Array<{ 
      codigo: string; 
      codigoPorcentaje: string; 
      baseImponible: number; 
      valor: number 
    }>;
    propina: number; 
    importeTotal: number; 
    moneda: string;
  };
  detalles: Array<{
    codigoPrincipal: string; 
    descripcion: string; 
    cantidad: number; 
    precioUnitario: number; 
    descuento: number; 
    precioTotalSinImpuesto: number;
    impuestos: Array<{ 
      codigo: string; 
      codigoPorcentaje: string; 
      tarifa: number; 
      baseImponible: number; 
      valor: number 
    }>;
  }>;
  infoAdicional?: Array<{ nombre: string; valor: string }>;
};

/**
 * Valida la coherencia entre ambiente y URLs del SRI
 */
function validateEnvironment(input: InvoiceInput): void {
  const ambiente = input.infoTributaria.ambiente;
  const receptionUrl = process.env.SRI_RECEPTION_URL;
  const authorizationUrl = process.env.SRI_AUTHORIZATION_URL;
  
  if (ambiente === "1" && (!receptionUrl?.includes('celcer.sri.gob.ec') || !authorizationUrl?.includes('celcer.sri.gob.ec'))) {
    throw new Error('Ambiente de pruebas (1) debe usar URLs de celcer.sri.gob.ec');
  }
  if (ambiente === "2" && (!receptionUrl?.includes('cel.sri.gob.ec') || !authorizationUrl?.includes('cel.sri.gob.ec'))) {
    throw new Error('Ambiente de producción (2) debe usar URLs de cel.sri.gob.ec');
  }
}

/**
 * Valida los códigos de IVA según tabla del SRI
 */
function validateIvaCodes(detalles: InvoiceInput['detalles']): void {
  const VALID_IVA_CODES = {
    '2': ['2', '3'], // IVA 12% y 14%
    '3': ['3072', '3073'], // ICE
    '5': ['1'] // IRBPNR
  };

  detalles.forEach((det, index) => {
    det.impuestos.forEach((imp, impIndex) => {
      if (!VALID_IVA_CODES[imp.codigo]?.includes(imp.codigoPorcentaje)) {
        throw new Error(`Código IVA inválido en detalle ${index + 1}, impuesto ${impIndex + 1}: ${imp.codigo}/${imp.codigoPorcentaje}`);
      }
    });
  });
}

/**
 * Carga el certificado .p12 desde archivo local o URL
 */
async function loadCertificate(): Promise<ArrayBuffer> {
  const certPath = process.env.CERT_URL_OR_PATH;
  if (!certPath) {
    throw new Error('CERT_URL_OR_PATH no está configurado');
  }

  try {
    if (certPath.startsWith('file://')) {
      // Cargar desde archivo local
      const filePath = certPath.replace('file://', '');
      const fileBuffer = await readFile(filePath);
      return fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      );
    } else if (certPath.startsWith('http://') || certPath.startsWith('https://')) {
      // Cargar desde URL
      return await getP12FromUrl(certPath);
    } else {
      // Asumir que es una ruta de archivo local
      const fileBuffer = await readFile(certPath);
      return fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      );
    }
  } catch (error) {
    throw new Error(`Error al cargar certificado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Convierte InvoiceInput al formato requerido por open-factura
 */
function convertToOpenFacturaFormat(input: InvoiceInput): any {
  return {
    infoTributaria: {
      ambiente: input.infoTributaria.ambiente,
      tipoEmision: input.infoTributaria.tipoEmision,
      razonSocial: input.infoTributaria.razonSocial,
      nombreComercial: input.infoTributaria.razonSocial, // Usar razón social como nombre comercial
      ruc: input.infoTributaria.ruc,
      codDoc: input.infoTributaria.codDoc,
      estab: input.infoTributaria.estab,
      ptoEmi: input.infoTributaria.ptoEmi,
      secuencial: input.infoTributaria.secuencial,
      dirMatriz: input.infoTributaria.dirMatriz,
      agenteRetencion: "0",
      contribuyenteRimpe: "CONTRIBUYENTE RÉGIMEN RIMPE"
    },
    infoFactura: {
      fechaEmision: input.infoFactura.fechaEmision,
      dirEstablecimiento: input.infoFactura.dirEstablecimiento,
      contribuyenteEspecial: "",
      obligadoContabilidad: "SI",
      comercioExterior: "NO",
      incoTermFactura: "",
      lugarIncoTerm: "",
      paisOrigen: "",
      puertoEmbarque: "",
      puertoDestino: "",
      paisDestino: "",
      paisAdquisicion: "",
      tipoIdentificacionComprador: input.infoFactura.tipoIdentificacionComprador,
      guiaRemision: "",
      razonSocialComprador: input.infoFactura.razonSocialComprador,
      identificacionComprador: input.infoFactura.identificacionComprador,
      direccionComprador: "",
      totalSinImpuestos: input.infoFactura.totalSinImpuestos.toFixed(2),
      totalSubsidio: "0.00",
      incoTermTotalSinImpuestos: "",
      totalDescuento: input.infoFactura.totalDescuento.toFixed(2),
      codDocReembolso: "00",
      totalComprobantesReembolso: "0.00",
      totalBaseImponibleReembolso: "0.00",
      totalImpuestoReembolso: "0.00",
      totalConImpuestos: {
        totalImpuesto: input.infoFactura.totalConImpuestos.map(imp => ({
          codigo: imp.codigo,
          codigoPorcentaje: imp.codigoPorcentaje,
          descuentoAdicional: "0.00",
          baseImponible: imp.baseImponible.toFixed(2),
          tarifa: "12.00",
          valor: imp.valor.toFixed(2),
          valorDevolucionIva: "0.00"
        }))
      },
      compensaciones: {
        compensacion: []
      },
      propina: input.infoFactura.propina.toFixed(2),
      fleteInternacional: "0.00",
      seguroInternacional: "0.00",
      gastosAduaneros: "0.00",
      gastosTransporteOtros: "0.00",
      importeTotal: input.infoFactura.importeTotal.toFixed(2),
      moneda: input.infoFactura.moneda,
      placa: "",
      pagos: {
        pago: [{
          formaPago: "01",
          total: input.infoFactura.importeTotal.toFixed(2),
          plazo: "0",
          unidadTiempo: "dias"
        }]
      },
      valorRetIva: "0.00",
      valorRetRenta: "0.00"
    },
    detalles: {
      detalle: input.detalles.map(det => ({
        codigoPrincipal: det.codigoPrincipal,
        codigoAuxiliar: det.codigoPrincipal,
        descripcion: det.descripcion,
        unidadMedida: "UNI",
        cantidad: det.cantidad.toFixed(6),
        precioUnitario: det.precioUnitario.toFixed(6),
        precioSinSubsidio: det.precioUnitario.toFixed(6),
        descuento: det.descuento.toFixed(2),
        precioTotalSinImpuesto: det.precioTotalSinImpuesto.toFixed(2),
        detallesAdicionales: input.infoAdicional ? {
          detAdicional: input.infoAdicional.map(info => ({
            "@nombre": info.nombre,
            "@valor": info.valor
          }))
        } : undefined,
        impuestos: {
          impuesto: det.impuestos.map(imp => ({
            codigo: imp.codigo,
            codigoPorcentaje: imp.codigoPorcentaje,
            tarifa: imp.tarifa.toFixed(2),
            baseImponible: imp.baseImponible.toFixed(2),
            valor: imp.valor.toFixed(2)
          }))
        }
      }))
    },
    infoAdicional: input.infoAdicional ? {
      campoAdicional: input.infoAdicional.map(info => ({
        "@nombre": info.nombre,
        "#": info.valor
      }))
    } : undefined
  };
}

/**
 * Construye y firma la factura electrónica
 */
export async function buildAndSign(input: InvoiceInput): Promise<BuildResult> {
  try {
    console.info('Iniciando construcción de factura electrónica');
    
    // Validaciones críticas antes de procesar
    validateEnvironment(input);
    validateIvaCodes(input.detalles);
    
    // Convertir al formato de open-factura
    const openFacturaInput = convertToOpenFacturaFormat(input);
    
    // Generar factura con clave de acceso
    const { invoice, accessKey } = generateInvoice(openFacturaInput);
    console.info(`Factura generada con clave de acceso: ${accessKey}`);
    
    // Generar XML sin firmar
    const xml = generateInvoiceXml(invoice);
    console.info('XML generado exitosamente');
    
    // Cargar certificado
    const certificate = await loadCertificate();
    console.info('Certificado cargado exitosamente');
    
    // Firmar XML
    const certPassword = process.env.CERT_PASSWORD;
    if (!certPassword) {
      throw new Error('CERT_PASSWORD no está configurado');
    }
    
    const signedXml = await signXml(certificate, certPassword, xml);
    console.info('XML firmado exitosamente');
    
    return {
      invoice,
      accessKey,
      xml,
      signedXml
    };
  } catch (error) {
    console.error('Error en buildAndSign:', error);
    throw error;
  }
}

/**
 * Envía el XML firmado al SRI para recepción
 */
export async function sendReception(signedXml: string): Promise<ReceptionResult> {
  try {
    console.info('Enviando XML al SRI para recepción');
    
    const receptionUrl = process.env.SRI_RECEPTION_URL;
    if (!receptionUrl) {
      throw new Error('SRI_RECEPTION_URL no está configurado');
    }
    
    const result = await documentReception(signedXml, receptionUrl);
    console.info('Respuesta de recepción recibida:', result);
    
    // Mapear respuesta del SRI
    if (result.estado === 'RECIBIDA') {
      return {
        estado: 'RECIBIDA'
      };
    } else {
      // Extraer mensajes de error
      const mensajes: string[] = [];
      if (result.mensajes && Array.isArray(result.mensajes)) {
        result.mensajes.forEach((msg: any) => {
          if (msg.mensaje) {
            mensajes.push(msg.mensaje);
          }
        });
      }
      
      return {
        estado: 'DEVUELTA',
        mensajes: mensajes.length > 0 ? mensajes : ['Error en recepción del SRI']
      };
    }
  } catch (error) {
    console.error('Error en sendReception:', error);
    return {
      estado: 'DEVUELTA',
      mensajes: [error instanceof Error ? error.message : 'Error desconocido en recepción']
    };
  }
}

/**
 * Consulta la autorización del documento en el SRI
 */
export async function getAuthorization(accessKey: string): Promise<AuthorizationResult> {
  try {
    console.info(`Consultando autorización para clave: ${accessKey}`);
    
    const authorizationUrl = process.env.SRI_AUTHORIZATION_URL;
    if (!authorizationUrl) {
      throw new Error('SRI_AUTHORIZATION_URL no está configurado');
    }
    
    const result = await documentAuthorization(accessKey, authorizationUrl);
    console.info('Respuesta de autorización recibida:', result);
    
    // Mapear respuesta del SRI
    if (result.estado === 'AUTORIZADO') {
      return {
        estado: 'AUTORIZADO',
        numeroAutorizacion: result.numeroAutorizacion,
        fechaAutorizacion: result.fechaAutorizacion,
        xmlAutorizado: result.comprobante
      };
    } else {
      // Extraer mensajes de error
      const mensajes: string[] = [];
      if (result.mensajes && Array.isArray(result.mensajes)) {
        result.mensajes.forEach((msg: any) => {
          if (msg.mensaje) {
            mensajes.push(msg.mensaje);
          }
        });
      }
      
      return {
        estado: 'NO AUTORIZADO',
        mensajes: mensajes.length > 0 ? mensajes : ['Error en autorización del SRI']
      };
    }
  } catch (error) {
    console.error('Error en getAuthorization:', error);
    return {
      estado: 'NO AUTORIZADO',
      mensajes: [error instanceof Error ? error.message : 'Error desconocido en autorización']
    };
  }
}
