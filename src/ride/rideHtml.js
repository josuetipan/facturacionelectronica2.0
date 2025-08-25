"use strict";
/**
 * Generador de RIDE (Representación Impresa de Documentos Electrónicos) en HTML
 * Parsea el XML autorizado del SRI y genera una representación impresa simple
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRideHtml = buildRideHtml;
/**
 * Parsea el XML autorizado del SRI
 */
function parseXmlAutorizado(xmlAutorizado) {
    try {
        // Extraer el XML de la factura desde la respuesta de autorización
        var facturaMatch = xmlAutorizado.match(/<factura[^>]*>[\s\S]*?<\/factura>/);
        if (!facturaMatch) {
            throw new Error('No se encontró la factura en el XML autorizado');
        }
        var facturaXml = facturaMatch[0];
        // Función helper para extraer valores de XML
        var extractValue_1 = function (xml, tag) {
            var regex = new RegExp("<".concat(tag, "[^>]*>([^<]*)</").concat(tag, ">"));
            var match = xml.match(regex);
            return match ? match[1].trim() : '';
        };
        var extractMultipleValues = function (xml, tag) {
            var regex = new RegExp("<".concat(tag, "[^>]*>([^<]*)</").concat(tag, ">"), 'g');
            var matches = [];
            var match;
            while ((match = regex.exec(xml)) !== null) {
                matches.push(match[1].trim());
            }
            return matches;
        };
        // Extraer información básica
        var claveAcceso = extractValue_1(facturaXml, 'claveAcceso');
        var numeroAutorizacion = extractValue_1(xmlAutorizado, 'numeroAutorizacion');
        var fechaAutorizacion = extractValue_1(xmlAutorizado, 'fechaAutorizacion');
        // Extraer información del emisor
        var emisor = {
            razonSocial: extractValue_1(facturaXml, 'razonSocial'),
            ruc: extractValue_1(facturaXml, 'ruc'),
            dirMatriz: extractValue_1(facturaXml, 'dirMatriz')
        };
        // Extraer información del comprador
        var comprador = {
            razonSocial: extractValue_1(facturaXml, 'razonSocialComprador'),
            identificacion: extractValue_1(facturaXml, 'identificacionComprador'),
            direccion: extractValue_1(facturaXml, 'direccionComprador')
        };
        // Extraer información de la factura
        var factura = {
            fechaEmision: extractValue_1(facturaXml, 'fechaEmision'),
            totalSinImpuestos: extractValue_1(facturaXml, 'totalSinImpuestos'),
            totalDescuento: extractValue_1(facturaXml, 'totalDescuento'),
            propina: extractValue_1(facturaXml, 'propina'),
            importeTotal: extractValue_1(facturaXml, 'importeTotal'),
            moneda: extractValue_1(facturaXml, 'moneda')
        };
        // Extraer items
        var items_1 = [];
        var detalleMatches = facturaXml.match(/<detalle[^>]*>[\s\S]*?<\/detalle>/g);
        if (detalleMatches) {
            detalleMatches.forEach(function (detalleXml) {
                var item = {
                    codigo: extractValue_1(detalleXml, 'codigoPrincipal'),
                    descripcion: extractValue_1(detalleXml, 'descripcion'),
                    cantidad: extractValue_1(detalleXml, 'cantidad'),
                    precioUnitario: extractValue_1(detalleXml, 'precioUnitario'),
                    descuento: extractValue_1(detalleXml, 'descuento'),
                    precioTotalSinImpuesto: extractValue_1(detalleXml, 'precioTotalSinImpuesto'),
                    impuestos: []
                };
                // Extraer impuestos del item
                var impuestoMatches = detalleXml.match(/<impuesto[^>]*>[\s\S]*?<\/impuesto>/g);
                if (impuestoMatches) {
                    impuestoMatches.forEach(function (impuestoXml) {
                        item.impuestos.push({
                            codigo: extractValue_1(impuestoXml, 'codigo'),
                            codigoPorcentaje: extractValue_1(impuestoXml, 'codigoPorcentaje'),
                            tarifa: extractValue_1(impuestoXml, 'tarifa'),
                            baseImponible: extractValue_1(impuestoXml, 'baseImponible'),
                            valor: extractValue_1(impuestoXml, 'valor')
                        });
                    });
                }
                items_1.push(item);
            });
        }
        // Extraer impuestos totales
        var impuestos_1 = [];
        var totalImpuestoMatches = facturaXml.match(/<totalImpuesto[^>]*>[\s\S]*?<\/totalImpuesto>/g);
        if (totalImpuestoMatches) {
            totalImpuestoMatches.forEach(function (impuestoXml) {
                impuestos_1.push({
                    codigo: extractValue_1(impuestoXml, 'codigo'),
                    codigoPorcentaje: extractValue_1(impuestoXml, 'codigoPorcentaje'),
                    baseImponible: extractValue_1(impuestoXml, 'baseImponible'),
                    valor: extractValue_1(impuestoXml, 'valor')
                });
            });
        }
        return {
            claveAcceso: claveAcceso,
            numeroAutorizacion: numeroAutorizacion,
            fechaAutorizacion: fechaAutorizacion,
            emisor: emisor,
            comprador: comprador,
            factura: factura,
            items: items_1,
            impuestos: impuestos_1
        };
    }
    catch (error) {
        throw new Error("Error al parsear XML autorizado: ".concat(error instanceof Error ? error.message : 'Error desconocido'));
    }
}
/**
 * Formatea un número como moneda
 */
function formatCurrency(amount, currency) {
    if (currency === void 0) { currency = 'USD'; }
    var num = parseFloat(amount);
    if (isNaN(num))
        return '0.00';
    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: currency === 'DOLAR' ? 'USD' : currency,
        minimumFractionDigits: 2
    }).format(num);
}
/**
 * Genera el HTML del RIDE
 */
function buildRideHtml(xmlAutorizado) {
    try {
        var invoice = parseXmlAutorizado(xmlAutorizado);
        var html = "\n<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>FACTURA ELECTR\u00D3NICA</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 0;\n            padding: 20px;\n            background-color: #f5f5f5;\n        }\n        .container {\n            max-width: 800px;\n            margin: 0 auto;\n            background-color: white;\n            padding: 30px;\n            box-shadow: 0 0 10px rgba(0,0,0,0.1);\n        }\n        .header {\n            text-align: center;\n            border-bottom: 2px solid #333;\n            padding-bottom: 20px;\n            margin-bottom: 30px;\n        }\n        .title {\n            font-size: 24px;\n            font-weight: bold;\n            color: #333;\n            margin: 0;\n        }\n        .subtitle {\n            font-size: 14px;\n            color: #666;\n            margin: 5px 0;\n        }\n        .info-section {\n            margin-bottom: 30px;\n        }\n        .info-grid {\n            display: grid;\n            grid-template-columns: 1fr 1fr;\n            gap: 20px;\n        }\n        .info-item {\n            margin-bottom: 15px;\n        }\n        .info-label {\n            font-weight: bold;\n            color: #333;\n            font-size: 12px;\n            text-transform: uppercase;\n        }\n        .info-value {\n            color: #666;\n            font-size: 14px;\n            margin-top: 5px;\n        }\n        .items-table {\n            width: 100%;\n            border-collapse: collapse;\n            margin: 20px 0;\n        }\n        .items-table th {\n            background-color: #f8f9fa;\n            padding: 12px;\n            text-align: left;\n            border-bottom: 1px solid #ddd;\n            font-size: 12px;\n            text-transform: uppercase;\n        }\n        .items-table td {\n            padding: 12px;\n            border-bottom: 1px solid #eee;\n            font-size: 14px;\n        }\n        .totals-section {\n            margin-top: 30px;\n            text-align: right;\n        }\n        .total-row {\n            display: flex;\n            justify-content: space-between;\n            margin-bottom: 10px;\n            font-size: 14px;\n        }\n        .total-final {\n            font-size: 18px;\n            font-weight: bold;\n            border-top: 2px solid #333;\n            padding-top: 10px;\n        }\n        .authorization-info {\n            margin-top: 30px;\n            padding: 20px;\n            background-color: #f8f9fa;\n            border-radius: 5px;\n        }\n        .qr-placeholder {\n            width: 100px;\n            height: 100px;\n            background-color: #ddd;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            font-size: 10px;\n            color: #666;\n            margin: 20px auto;\n            border: 1px solid #ccc;\n        }\n        @media print {\n            body { background-color: white; }\n            .container { box-shadow: none; }\n        }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h1 class=\"title\">FACTURA ELECTR\u00D3NICA</h1>\n            <p class=\"subtitle\">R.U.C.: ".concat(invoice.emisor.ruc, "</p>\n            <p class=\"subtitle\">").concat(invoice.emisor.razonSocial, "</p>\n        </div>\n\n        <div class=\"info-section\">\n            <div class=\"info-grid\">\n                <div>\n                    <div class=\"info-item\">\n                        <div class=\"info-label\">Clave de Acceso</div>\n                        <div class=\"info-value\">").concat(invoice.claveAcceso, "</div>\n                    </div>\n                    <div class=\"info-item\">\n                        <div class=\"info-label\">N\u00FAmero de Autorizaci\u00F3n</div>\n                        <div class=\"info-value\">").concat(invoice.numeroAutorizacion, "</div>\n                    </div>\n                    <div class=\"info-item\">\n                        <div class=\"info-label\">Fecha de Autorizaci\u00F3n</div>\n                        <div class=\"info-value\">").concat(invoice.fechaAutorizacion, "</div>\n                    </div>\n                </div>\n                <div>\n                    <div class=\"info-item\">\n                        <div class=\"info-label\">Fecha de Emisi\u00F3n</div>\n                        <div class=\"info-value\">").concat(invoice.factura.fechaEmision, "</div>\n                    </div>\n                    <div class=\"info-item\">\n                        <div class=\"info-label\">Moneda</div>\n                        <div class=\"info-value\">").concat(invoice.factura.moneda, "</div>\n                    </div>\n                </div>\n            </div>\n        </div>\n\n        <div class=\"info-section\">\n            <h3>INFORMACI\u00D3N DEL COMPRADOR</h3>\n            <div class=\"info-grid\">\n                <div>\n                    <div class=\"info-item\">\n                        <div class=\"info-label\">Raz\u00F3n Social</div>\n                        <div class=\"info-value\">").concat(invoice.comprador.razonSocial, "</div>\n                    </div>\n                    <div class=\"info-item\">\n                        <div class=\"info-label\">Identificaci\u00F3n</div>\n                        <div class=\"info-value\">").concat(invoice.comprador.identificacion, "</div>\n                    </div>\n                </div>\n                <div>\n                    <div class=\"info-item\">\n                        <div class=\"info-label\">Direcci\u00F3n</div>\n                        <div class=\"info-value\">").concat(invoice.comprador.direccion, "</div>\n                    </div>\n                </div>\n            </div>\n        </div>\n\n        <div class=\"info-section\">\n            <h3>DETALLE DE PRODUCTOS/SERVICIOS</h3>\n            <table class=\"items-table\">\n                <thead>\n                    <tr>\n                        <th>C\u00F3digo</th>\n                        <th>Descripci\u00F3n</th>\n                        <th>Cantidad</th>\n                        <th>Precio Unit.</th>\n                        <th>Descuento</th>\n                        <th>Total</th>\n                    </tr>\n                </thead>\n                <tbody>\n                    ").concat(invoice.items.map(function (item) { return "\n                        <tr>\n                            <td>".concat(item.codigo, "</td>\n                            <td>").concat(item.descripcion, "</td>\n                            <td>").concat(item.cantidad, "</td>\n                            <td>").concat(formatCurrency(item.precioUnitario), "</td>\n                            <td>").concat(formatCurrency(item.descuento), "</td>\n                            <td>").concat(formatCurrency(item.precioTotalSinImpuesto), "</td>\n                        </tr>\n                    "); }).join(''), "\n                </tbody>\n            </table>\n        </div>\n\n        <div class=\"totals-section\">\n            <div class=\"total-row\">\n                <span>Subtotal:</span>\n                <span>").concat(formatCurrency(invoice.factura.totalSinImpuestos), "</span>\n            </div>\n            <div class=\"total-row\">\n                <span>Descuento:</span>\n                <span>").concat(formatCurrency(invoice.factura.totalDescuento), "</span>\n            </div>\n            ").concat(invoice.impuestos.map(function (imp) { return "\n                <div class=\"total-row\">\n                    <span>IVA (".concat(imp.codigoPorcentaje, "%):</span>\n                    <span>").concat(formatCurrency(imp.valor), "</span>\n                </div>\n            "); }).join(''), "\n            <div class=\"total-row\">\n                <span>Propina:</span>\n                <span>").concat(formatCurrency(invoice.factura.propina), "</span>\n            </div>\n            <div class=\"total-row total-final\">\n                <span>TOTAL:</span>\n                <span>").concat(formatCurrency(invoice.factura.importeTotal), "</span>\n            </div>\n        </div>\n\n        <div class=\"authorization-info\">\n            <div class=\"info-item\">\n                <div class=\"info-label\">Autorizaci\u00F3n SRI</div>\n                <div class=\"info-value\">\n                    N\u00FAmero: ").concat(invoice.numeroAutorizacion, "<br>\n                    Fecha: ").concat(invoice.fechaAutorizacion, "<br>\n                    Clave: ").concat(invoice.claveAcceso, "\n                </div>\n            </div>\n        </div>\n\n        <div class=\"qr-placeholder\">\n            C\u00D3DIGO QR<br>\n            (Clave: ").concat(invoice.claveAcceso, ")\n        </div>\n\n        <div style=\"text-align: center; margin-top: 30px; font-size: 12px; color: #666;\">\n            <p>Este documento es una representaci\u00F3n impresa de un comprobante electr\u00F3nico</p>\n            <p>Autorizado por el Servicio de Rentas Internas del Ecuador</p>\n        </div>\n    </div>\n</body>\n</html>");
        return html;
    }
    catch (error) {
        console.error('Error generando RIDE HTML:', error);
        // Retornar HTML de error simple
        return "\n<!DOCTYPE html>\n<html>\n<head>\n    <meta charset=\"UTF-8\">\n    <title>Error - RIDE</title>\n</head>\n<body>\n    <h1>Error al generar RIDE</h1>\n    <p>No se pudo generar la representaci\u00F3n impresa del documento electr\u00F3nico.</p>\n    <p>Error: ".concat(error instanceof Error ? error.message : 'Error desconocido', "</p>\n</body>\n</html>");
    }
}
