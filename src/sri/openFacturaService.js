"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAndSign = buildAndSign;
exports.sendReception = sendReception;
exports.getAuthorization = getAuthorization;
var index_1 = require("../index");
var promises_1 = require("fs/promises");
/**
 * Valida la coherencia entre ambiente y URLs del SRI
 */
function validateEnvironment(input) {
    var ambiente = input.infoTributaria.ambiente;
    var receptionUrl = process.env.SRI_RECEPTION_URL;
    var authorizationUrl = process.env.SRI_AUTHORIZATION_URL;
    if (ambiente === "1" && (!(receptionUrl === null || receptionUrl === void 0 ? void 0 : receptionUrl.includes('celcer.sri.gob.ec')) || !(authorizationUrl === null || authorizationUrl === void 0 ? void 0 : authorizationUrl.includes('celcer.sri.gob.ec')))) {
        throw new Error('Ambiente de pruebas (1) debe usar URLs de celcer.sri.gob.ec');
    }
    if (ambiente === "2" && (!(receptionUrl === null || receptionUrl === void 0 ? void 0 : receptionUrl.includes('cel.sri.gob.ec')) || !(authorizationUrl === null || authorizationUrl === void 0 ? void 0 : authorizationUrl.includes('cel.sri.gob.ec')))) {
        throw new Error('Ambiente de producción (2) debe usar URLs de cel.sri.gob.ec');
    }
}
/**
 * Valida los códigos de IVA según tabla del SRI
 */
function validateIvaCodes(detalles) {
    var VALID_IVA_CODES = {
        '2': ['2', '3'], // IVA 12% y 14%
        '3': ['3072', '3073'], // ICE
        '5': ['1'] // IRBPNR
    };
    detalles.forEach(function (det, index) {
        det.impuestos.forEach(function (imp, impIndex) {
            var _a;
            if (!((_a = VALID_IVA_CODES[imp.codigo]) === null || _a === void 0 ? void 0 : _a.includes(imp.codigoPorcentaje))) {
                throw new Error("C\u00F3digo IVA inv\u00E1lido en detalle ".concat(index + 1, ", impuesto ").concat(impIndex + 1, ": ").concat(imp.codigo, "/").concat(imp.codigoPorcentaje));
            }
        });
    });
}
/**
 * Carga el certificado .p12 desde archivo local o URL
 */
function loadCertificate() {
    return __awaiter(this, void 0, void 0, function () {
        var certPath, filePath, fileBuffer, fileBuffer, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    certPath = process.env.CERT_URL_OR_PATH;
                    if (!certPath) {
                        throw new Error('CERT_URL_OR_PATH no está configurado');
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    if (!certPath.startsWith('file://')) return [3 /*break*/, 3];
                    filePath = certPath.replace('file://', '');
                    return [4 /*yield*/, (0, promises_1.readFile)(filePath)];
                case 2:
                    fileBuffer = _a.sent();
                    return [2 /*return*/, fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength)];
                case 3:
                    if (!(certPath.startsWith('http://') || certPath.startsWith('https://'))) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, index_1.getP12FromUrl)(certPath)];
                case 4: 
                // Cargar desde URL
                return [2 /*return*/, _a.sent()];
                case 5: return [4 /*yield*/, (0, promises_1.readFile)(certPath)];
                case 6:
                    fileBuffer = _a.sent();
                    return [2 /*return*/, fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength)];
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    throw new Error("Error al cargar certificado: ".concat(error_1 instanceof Error ? error_1.message : 'Error desconocido'));
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Convierte InvoiceInput al formato requerido por open-factura
 */
function convertToOpenFacturaFormat(input) {
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
                totalImpuesto: input.infoFactura.totalConImpuestos.map(function (imp) { return ({
                    codigo: imp.codigo,
                    codigoPorcentaje: imp.codigoPorcentaje,
                    descuentoAdicional: "0.00",
                    baseImponible: imp.baseImponible.toFixed(2),
                    tarifa: "12.00",
                    valor: imp.valor.toFixed(2),
                    valorDevolucionIva: "0.00"
                }); })
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
            detalle: input.detalles.map(function (det) { return ({
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
                    detAdicional: input.infoAdicional.map(function (info) { return ({
                        "@nombre": info.nombre,
                        "@valor": info.valor
                    }); })
                } : undefined,
                impuestos: {
                    impuesto: det.impuestos.map(function (imp) { return ({
                        codigo: imp.codigo,
                        codigoPorcentaje: imp.codigoPorcentaje,
                        tarifa: imp.tarifa.toFixed(2),
                        baseImponible: imp.baseImponible.toFixed(2),
                        valor: imp.valor.toFixed(2)
                    }); })
                }
            }); })
        },
        infoAdicional: input.infoAdicional ? {
            campoAdicional: input.infoAdicional.map(function (info) { return ({
                "@nombre": info.nombre,
                "#": info.valor
            }); })
        } : undefined
    };
}
/**
 * Construye y firma la factura electrónica
 */
function buildAndSign(input) {
    return __awaiter(this, void 0, void 0, function () {
        var openFacturaInput, _a, invoice, accessKey, xml, certificate, certPassword, signedXml, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    console.info('Iniciando construcción de factura electrónica');
                    // Validaciones críticas antes de procesar
                    validateEnvironment(input);
                    validateIvaCodes(input.detalles);
                    openFacturaInput = convertToOpenFacturaFormat(input);
                    _a = (0, index_1.generateInvoice)(openFacturaInput), invoice = _a.invoice, accessKey = _a.accessKey;
                    console.info("Factura generada con clave de acceso: ".concat(accessKey));
                    xml = (0, index_1.generateInvoiceXml)(invoice);
                    console.info('XML generado exitosamente');
                    return [4 /*yield*/, loadCertificate()];
                case 1:
                    certificate = _b.sent();
                    console.info('Certificado cargado exitosamente');
                    certPassword = process.env.CERT_PASSWORD;
                    if (!certPassword) {
                        throw new Error('CERT_PASSWORD no está configurado');
                    }
                    return [4 /*yield*/, (0, index_1.signXml)(certificate, certPassword, xml)];
                case 2:
                    signedXml = _b.sent();
                    console.info('XML firmado exitosamente');
                    return [2 /*return*/, {
                            invoice: invoice,
                            accessKey: accessKey,
                            xml: xml,
                            signedXml: signedXml
                        }];
                case 3:
                    error_2 = _b.sent();
                    console.error('Error en buildAndSign:', error_2);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Envía el XML firmado al SRI para recepción
 */
function sendReception(signedXml) {
    return __awaiter(this, void 0, void 0, function () {
        var receptionUrl, result, mensajes_1, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.info('Enviando XML al SRI para recepción');
                    receptionUrl = process.env.SRI_RECEPTION_URL;
                    if (!receptionUrl) {
                        throw new Error('SRI_RECEPTION_URL no está configurado');
                    }
                    return [4 /*yield*/, (0, index_1.documentReception)(signedXml, receptionUrl)];
                case 1:
                    result = _a.sent();
                    console.info('Respuesta de recepción recibida:', result);
                    // Mapear respuesta del SRI
                    if (result.estado === 'RECIBIDA') {
                        return [2 /*return*/, {
                                estado: 'RECIBIDA'
                            }];
                    }
                    else {
                        mensajes_1 = [];
                        if (result.mensajes && Array.isArray(result.mensajes)) {
                            result.mensajes.forEach(function (msg) {
                                if (msg.mensaje) {
                                    mensajes_1.push(msg.mensaje);
                                }
                            });
                        }
                        return [2 /*return*/, {
                                estado: 'DEVUELTA',
                                mensajes: mensajes_1.length > 0 ? mensajes_1 : ['Error en recepción del SRI']
                            }];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error en sendReception:', error_3);
                    return [2 /*return*/, {
                            estado: 'DEVUELTA',
                            mensajes: [error_3 instanceof Error ? error_3.message : 'Error desconocido en recepción']
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Consulta la autorización del documento en el SRI
 */
function getAuthorization(accessKey) {
    return __awaiter(this, void 0, void 0, function () {
        var authorizationUrl, result, mensajes_2, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.info("Consultando autorizaci\u00F3n para clave: ".concat(accessKey));
                    authorizationUrl = process.env.SRI_AUTHORIZATION_URL;
                    if (!authorizationUrl) {
                        throw new Error('SRI_AUTHORIZATION_URL no está configurado');
                    }
                    return [4 /*yield*/, (0, index_1.documentAuthorization)(accessKey, authorizationUrl)];
                case 1:
                    result = _a.sent();
                    console.info('Respuesta de autorización recibida:', result);
                    // Mapear respuesta del SRI
                    if (result.estado === 'AUTORIZADO') {
                        return [2 /*return*/, {
                                estado: 'AUTORIZADO',
                                numeroAutorizacion: result.numeroAutorizacion,
                                fechaAutorizacion: result.fechaAutorizacion,
                                xmlAutorizado: result.comprobante
                            }];
                    }
                    else {
                        mensajes_2 = [];
                        if (result.mensajes && Array.isArray(result.mensajes)) {
                            result.mensajes.forEach(function (msg) {
                                if (msg.mensaje) {
                                    mensajes_2.push(msg.mensaje);
                                }
                            });
                        }
                        return [2 /*return*/, {
                                estado: 'NO AUTORIZADO',
                                mensajes: mensajes_2.length > 0 ? mensajes_2 : ['Error en autorización del SRI']
                            }];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error en getAuthorization:', error_4);
                    return [2 /*return*/, {
                            estado: 'NO AUTORIZADO',
                            mensajes: [error_4 instanceof Error ? error_4.message : 'Error desconocido en autorización']
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
