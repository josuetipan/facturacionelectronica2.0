import { Request, Response } from 'express';
import { crearYAutorizarFactura, obtenerFacturaPorClave, listarFacturas, CreateInvoiceRequest } from './invoice.service';

/**
 * Valida el formato de fecha dd/MM/yyyy
 */
function validateDateFormat(fecha: string): boolean {
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(fecha)) {
    return false;
  }
  
  const [day, month, year] = fecha.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.getDate() === day && 
         date.getMonth() === month - 1 && 
         date.getFullYear() === year;
}

/**
 * Valida los campos mínimos requeridos para crear una factura
 */
function validateInvoiceRequest(body: any): body is CreateInvoiceRequest {
  const requiredFields = [
    'infoTributaria.ambiente',
    'infoTributaria.ruc',
    'infoTributaria.estab',
    'infoTributaria.ptoEmi',
    'infoTributaria.secuencial',
    'infoTributaria.codDoc',
    'infoFactura.fechaEmision',
    'infoFactura.razonSocialComprador',
    'infoFactura.identificacionComprador',
    'infoFactura.totalSinImpuestos',
    'infoFactura.importeTotal',
    'detalles'
  ];

  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj: any, key: string) => obj?.[key], body);
    if (value === undefined || value === null || value === '') {
      return false;
    }
  }

  // Validar que codDoc sea "01" (factura)
  if (body.infoTributaria?.codDoc !== '01') {
    return false;
  }

  // Validar que detalles sea un array no vacío
  if (!Array.isArray(body.detalles) || body.detalles.length === 0) {
    return false;
  }

  // Validar formato de fecha dd/MM/yyyy
  if (!validateDateFormat(body.infoFactura?.fechaEmision)) {
    return false;
  }

  // Validar ambiente
  if (!['1', '2'].includes(body.infoTributaria?.ambiente)) {
    return false;
  }

  return true;
}

/**
 * POST /api/invoices
 * Crea y autoriza una factura electrónica
 */
export async function createInvoice(req: Request, res: Response) {
  try {
    console.info('Solicitud de creación de factura recibida');

    // Validar campos mínimos
    if (!validateInvoiceRequest(req.body)) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes o inválidos',
        required: [
          'infoTributaria.ambiente (1=pruebas, 2=producción)',
          'infoTributaria.ruc (13 dígitos)',
          'infoTributaria.estab (3 dígitos)',
          'infoTributaria.ptoEmi (3 dígitos)',
          'infoTributaria.secuencial (9 dígitos)',
          'infoTributaria.codDoc (debe ser "01")',
          'infoFactura.fechaEmision (formato dd/MM/yyyy)',
          'infoFactura.razonSocialComprador',
          'infoFactura.identificacionComprador',
          'infoFactura.totalSinImpuestos',
          'infoFactura.importeTotal',
          'detalles (array no vacío)'
        ]
      });
    }

    // Crear y autorizar factura
    const result = await crearYAutorizarFactura(req.body);

    // Determinar código de respuesta HTTP
    let statusCode = 200;
    if (result.estado === 'DEVUELTA' || result.estado === 'NO AUTORIZADO') {
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: result.estado === 'AUTORIZADO',
      ...result
    });

  } catch (error) {
    console.error('Error en createInvoice:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

/**
 * GET /api/invoices/:claveAcceso
 * Obtiene una factura por su clave de acceso
 */
export async function getInvoiceByClave(req: Request, res: Response) {
  try {
    const { claveAcceso } = req.params;

    if (!claveAcceso) {
      return res.status(400).json({
        error: 'Clave de acceso requerida'
      });
    }

    const factura = await obtenerFacturaPorClave(claveAcceso);
    return res.json({
      success: true,
      factura
    });

  } catch (error) {
    console.error('Error en getInvoiceByClave:', error);
    
    if (error instanceof Error && error.message === 'Factura no encontrada') {
      return res.status(404).json({
        error: 'Factura no encontrada'
      });
    }

    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

/**
 * GET /api/invoices
 * Lista las últimas facturas
 */
export async function listInvoices(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    // Validar límite
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Límite debe ser un número entre 1 y 100'
      });
    }

    const facturas = await listarFacturas(limit);
    return res.json({
      success: true,
      count: facturas.length,
      facturas
    });

  } catch (error) {
    console.error('Error en listInvoices:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

/**
 * Configura las rutas de facturación
 */
export function setupInvoiceRoutes(router: any) {
  router.post('/invoices', createInvoice);
  router.get('/invoices/:claveAcceso', getInvoiceByClave);
  router.get('/invoices', listInvoices);
}

/*
EJEMPLO DE CURL PARA PROBAR EL ENDPOINT POST /api/invoices:

curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "infoTributaria": {
      "ambiente": "1",
      "tipoEmision": "1",
      "ruc": "1234567890001",
      "estab": "001",
      "ptoEmi": "001",
      "secuencial": "000000001",
      "codDoc": "01",
      "razonSocial": "Mi Empresa S.A.",
      "dirMatriz": "Dirección matriz"
    },
    "infoFactura": {
      "fechaEmision": "01/01/2024",
      "dirEstablecimiento": "Dirección establecimiento",
      "tipoIdentificacionComprador": "04",
      "razonSocialComprador": "Cliente ABC",
      "identificacionComprador": "1234567890",
      "totalSinImpuestos": 100.00,
      "totalDescuento": 0.00,
      "totalConImpuestos": [
        {
          "codigo": "2",
          "codigoPorcentaje": "2",
          "baseImponible": 100.00,
          "valor": 12.00
        }
      ],
      "propina": 0.00,
      "importeTotal": 112.00,
      "moneda": "DOLAR"
    },
    "detalles": [
      {
        "codigoPrincipal": "PROD001",
        "descripcion": "Producto A",
        "cantidad": 2,
        "precioUnitario": 50.00,
        "descuento": 0.00,
        "precioTotalSinImpuesto": 100.00,
        "impuestos": [
          {
            "codigo": "2",
            "codigoPorcentaje": "2",
            "tarifa": 12.00,
            "baseImponible": 100.00,
            "valor": 12.00
          }
        ]
      }
    ],
    "emailCliente": "cliente@ejemplo.com"
  }'

RESPUESTA ESPERADA (AUTORIZADO):
{
  "success": true,
  "claveAcceso": "0101202401123456789000011001001000000001XXXXXXXXX1",
  "estado": "AUTORIZADO",
  "numeroAutorizacion": "1234567890",
  "fechaAutorizacion": "01/01/2024 10:30:00"
}

RESPUESTA ESPERADA (DEVUELTA):
{
  "success": false,
  "claveAcceso": "0101202401123456789000011001001000000001XXXXXXXXX1",
  "estado": "DEVUELTA",
  "mensajes": ["Error específico del SRI"]
}
*/
