/**
 * Generador de RIDE (Representación Impresa de Documentos Electrónicos) en HTML
 * Parsea el XML autorizado del SRI y genera una representación impresa simple
 */

interface ParsedInvoice {
  claveAcceso: string;
  numeroAutorizacion: string;
  fechaAutorizacion: string;
  emisor: {
    razonSocial: string;
    ruc: string;
    dirMatriz: string;
  };
  comprador: {
    razonSocial: string;
    identificacion: string;
    direccion: string;
  };
  factura: {
    fechaEmision: string;
    totalSinImpuestos: string;
    totalDescuento: string;
    propina: string;
    importeTotal: string;
    moneda: string;
  };
  items: Array<{
    codigo: string;
    descripcion: string;
    cantidad: string;
    precioUnitario: string;
    descuento: string;
    precioTotalSinImpuesto: string;
    impuestos: Array<{
      codigo: string;
      codigoPorcentaje: string;
      tarifa: string;
      baseImponible: string;
      valor: string;
    }>;
  }>;
  impuestos: Array<{
    codigo: string;
    codigoPorcentaje: string;
    baseImponible: string;
    valor: string;
  }>;
}

/**
 * Parsea el XML autorizado del SRI
 */
function parseXmlAutorizado(xmlAutorizado: string): ParsedInvoice {
  try {
    // Extraer el XML de la factura desde la respuesta de autorización
    const facturaMatch = xmlAutorizado.match(/<factura[^>]*>[\s\S]*?<\/factura>/);
    if (!facturaMatch) {
      throw new Error('No se encontró la factura en el XML autorizado');
    }
    
    const facturaXml = facturaMatch[0];
    
    // Función helper para extraer valores de XML
    const extractValue = (xml: string, tag: string): string => {
      const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`);
      const match = xml.match(regex);
      return match ? match[1].trim() : '';
    };
    
    const extractMultipleValues = (xml: string, tag: string): string[] => {
      const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'g');
      const matches = [];
      let match;
      while ((match = regex.exec(xml)) !== null) {
        matches.push(match[1].trim());
      }
      return matches;
    };
    
    // Extraer información básica
    const claveAcceso = extractValue(facturaXml, 'claveAcceso');
    const numeroAutorizacion = extractValue(xmlAutorizado, 'numeroAutorizacion');
    const fechaAutorizacion = extractValue(xmlAutorizado, 'fechaAutorizacion');
    
    // Extraer información del emisor
    const emisor = {
      razonSocial: extractValue(facturaXml, 'razonSocial'),
      ruc: extractValue(facturaXml, 'ruc'),
      dirMatriz: extractValue(facturaXml, 'dirMatriz')
    };
    
    // Extraer información del comprador
    const comprador = {
      razonSocial: extractValue(facturaXml, 'razonSocialComprador'),
      identificacion: extractValue(facturaXml, 'identificacionComprador'),
      direccion: extractValue(facturaXml, 'direccionComprador')
    };
    
    // Extraer información de la factura
    const factura = {
      fechaEmision: extractValue(facturaXml, 'fechaEmision'),
      totalSinImpuestos: extractValue(facturaXml, 'totalSinImpuestos'),
      totalDescuento: extractValue(facturaXml, 'totalDescuento'),
      propina: extractValue(facturaXml, 'propina'),
      importeTotal: extractValue(facturaXml, 'importeTotal'),
      moneda: extractValue(facturaXml, 'moneda')
    };
    
    // Extraer items
    const items: ParsedInvoice['items'] = [];
    const detalleMatches = facturaXml.match(/<detalle[^>]*>[\s\S]*?<\/detalle>/g);
    if (detalleMatches) {
      detalleMatches.forEach(detalleXml => {
        const item = {
          codigo: extractValue(detalleXml, 'codigoPrincipal'),
          descripcion: extractValue(detalleXml, 'descripcion'),
          cantidad: extractValue(detalleXml, 'cantidad'),
          precioUnitario: extractValue(detalleXml, 'precioUnitario'),
          descuento: extractValue(detalleXml, 'descuento'),
          precioTotalSinImpuesto: extractValue(detalleXml, 'precioTotalSinImpuesto'),
          impuestos: [] as ParsedInvoice['items'][0]['impuestos']
        };
        
        // Extraer impuestos del item
        const impuestoMatches = detalleXml.match(/<impuesto[^>]*>[\s\S]*?<\/impuesto>/g);
        if (impuestoMatches) {
          impuestoMatches.forEach(impuestoXml => {
            item.impuestos.push({
              codigo: extractValue(impuestoXml, 'codigo'),
              codigoPorcentaje: extractValue(impuestoXml, 'codigoPorcentaje'),
              tarifa: extractValue(impuestoXml, 'tarifa'),
              baseImponible: extractValue(impuestoXml, 'baseImponible'),
              valor: extractValue(impuestoXml, 'valor')
            });
          });
        }
        
        items.push(item);
      });
    }
    
    // Extraer impuestos totales
    const impuestos: ParsedInvoice['impuestos'] = [];
    const totalImpuestoMatches = facturaXml.match(/<totalImpuesto[^>]*>[\s\S]*?<\/totalImpuesto>/g);
    if (totalImpuestoMatches) {
      totalImpuestoMatches.forEach(impuestoXml => {
        impuestos.push({
          codigo: extractValue(impuestoXml, 'codigo'),
          codigoPorcentaje: extractValue(impuestoXml, 'codigoPorcentaje'),
          baseImponible: extractValue(impuestoXml, 'baseImponible'),
          valor: extractValue(impuestoXml, 'valor')
        });
      });
    }
    
    return {
      claveAcceso,
      numeroAutorizacion,
      fechaAutorizacion,
      emisor,
      comprador,
      factura,
      items,
      impuestos
    };
  } catch (error) {
    throw new Error(`Error al parsear XML autorizado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Formatea un número como moneda
 */
function formatCurrency(amount: string, currency: string = 'USD'): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0.00';
  
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: currency === 'DOLAR' ? 'USD' : currency,
    minimumFractionDigits: 2
  }).format(num);
}

/**
 * Genera el HTML del RIDE
 */
export function buildRideHtml(xmlAutorizado: string): string {
  try {
    const invoice = parseXmlAutorizado(xmlAutorizado);
    
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FACTURA ELECTRÓNICA</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin: 0;
        }
        .subtitle {
            font-size: 14px;
            color: #666;
            margin: 5px 0;
        }
        .info-section {
            margin-bottom: 30px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .info-item {
            margin-bottom: 15px;
        }
        .info-label {
            font-weight: bold;
            color: #333;
            font-size: 12px;
            text-transform: uppercase;
        }
        .info-value {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .items-table th {
            background-color: #f8f9fa;
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
            font-size: 12px;
            text-transform: uppercase;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
            font-size: 14px;
        }
        .totals-section {
            margin-top: 30px;
            text-align: right;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .total-final {
            font-size: 18px;
            font-weight: bold;
            border-top: 2px solid #333;
            padding-top: 10px;
        }
        .authorization-info {
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 5px;
        }
        .qr-placeholder {
            width: 100px;
            height: 100px;
            background-color: #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #666;
            margin: 20px auto;
            border: 1px solid #ccc;
        }
        @media print {
            body { background-color: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">FACTURA ELECTRÓNICA</h1>
            <p class="subtitle">R.U.C.: ${invoice.emisor.ruc}</p>
            <p class="subtitle">${invoice.emisor.razonSocial}</p>
        </div>

        <div class="info-section">
            <div class="info-grid">
                <div>
                    <div class="info-item">
                        <div class="info-label">Clave de Acceso</div>
                        <div class="info-value">${invoice.claveAcceso}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Número de Autorización</div>
                        <div class="info-value">${invoice.numeroAutorizacion}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Fecha de Autorización</div>
                        <div class="info-value">${invoice.fechaAutorizacion}</div>
                    </div>
                </div>
                <div>
                    <div class="info-item">
                        <div class="info-label">Fecha de Emisión</div>
                        <div class="info-value">${invoice.factura.fechaEmision}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Moneda</div>
                        <div class="info-value">${invoice.factura.moneda}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="info-section">
            <h3>INFORMACIÓN DEL COMPRADOR</h3>
            <div class="info-grid">
                <div>
                    <div class="info-item">
                        <div class="info-label">Razón Social</div>
                        <div class="info-value">${invoice.comprador.razonSocial}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Identificación</div>
                        <div class="info-value">${invoice.comprador.identificacion}</div>
                    </div>
                </div>
                <div>
                    <div class="info-item">
                        <div class="info-label">Dirección</div>
                        <div class="info-value">${invoice.comprador.direccion}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="info-section">
            <h3>DETALLE DE PRODUCTOS/SERVICIOS</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Descuento</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                            <td>${item.codigo}</td>
                            <td>${item.descripcion}</td>
                            <td>${item.cantidad}</td>
                            <td>${formatCurrency(item.precioUnitario)}</td>
                            <td>${formatCurrency(item.descuento)}</td>
                            <td>${formatCurrency(item.precioTotalSinImpuesto)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="totals-section">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(invoice.factura.totalSinImpuestos)}</span>
            </div>
            <div class="total-row">
                <span>Descuento:</span>
                <span>${formatCurrency(invoice.factura.totalDescuento)}</span>
            </div>
            ${invoice.impuestos.map(imp => `
                <div class="total-row">
                    <span>IVA (${imp.codigoPorcentaje}%):</span>
                    <span>${formatCurrency(imp.valor)}</span>
                </div>
            `).join('')}
            <div class="total-row">
                <span>Propina:</span>
                <span>${formatCurrency(invoice.factura.propina)}</span>
            </div>
            <div class="total-row total-final">
                <span>TOTAL:</span>
                <span>${formatCurrency(invoice.factura.importeTotal)}</span>
            </div>
        </div>

        <div class="authorization-info">
            <div class="info-item">
                <div class="info-label">Autorización SRI</div>
                <div class="info-value">
                    Número: ${invoice.numeroAutorizacion}<br>
                    Fecha: ${invoice.fechaAutorizacion}<br>
                    Clave: ${invoice.claveAcceso}
                </div>
            </div>
        </div>

        <div class="qr-placeholder">
            CÓDIGO QR<br>
            (Clave: ${invoice.claveAcceso})
        </div>

        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
            <p>Este documento es una representación impresa de un comprobante electrónico</p>
            <p>Autorizado por el Servicio de Rentas Internas del Ecuador</p>
        </div>
    </div>
</body>
</html>`;

    return html;
  } catch (error) {
    console.error('Error generando RIDE HTML:', error);
    // Retornar HTML de error simple
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Error - RIDE</title>
</head>
<body>
    <h1>Error al generar RIDE</h1>
    <p>No se pudo generar la representación impresa del documento electrónico.</p>
    <p>Error: ${error instanceof Error ? error.message : 'Error desconocido'}</p>
</body>
</html>`;
  }
}
