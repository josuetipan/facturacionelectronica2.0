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
exports.crearYAutorizarFactura = crearYAutorizarFactura;
exports.obtenerFacturaPorClave = obtenerFacturaPorClave;
exports.listarFacturas = listarFacturas;
var openFacturaService_1 = require("../sri/openFacturaService");
var rideHtml_1 = require("../ride/rideHtml");
var emailService_1 = require("../services/emailService");
var repositories_1 = require("../repositories");
/**
 * Crea y autoriza una factura electrónica completa
 */
function crearYAutorizarFactura(payload) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, invoice, accessKey, xml, signedXml, existingInvoice, receptionResult, authorizationResult, rideHtml, emailError_1, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 16, , 17]);
                    console.info('Iniciando proceso de facturación electrónica');
                    return [4 /*yield*/, (0, openFacturaService_1.buildAndSign)(payload)];
                case 1:
                    _a = _b.sent(), invoice = _a.invoice, accessKey = _a.accessKey, xml = _a.xml, signedXml = _a.signedXml;
                    console.info("Factura construida y firmada con clave: ".concat(accessKey));
                    return [4 /*yield*/, repositories_1.invoiceRepo.findByClave(accessKey)];
                case 2:
                    existingInvoice = _b.sent();
                    if (existingInvoice) {
                        console.warn("Secuencial duplicado detectado: ".concat(accessKey));
                        return [2 /*return*/, {
                                claveAcceso: accessKey,
                                estado: 'DEVUELTA',
                                mensajes: ['Secuencial ya existe para este establecimiento/punto de emisión']
                            }];
                    }
                    // 3. Guardar registro inicial
                    return [4 /*yield*/, repositories_1.invoiceRepo.upsertByClave({
                            claveAcceso: accessKey,
                            estado: 'RECIBIDA',
                            xmlFirmado: signedXml,
                            estab: payload.infoTributaria.estab,
                            ptoEmi: payload.infoTributaria.ptoEmi,
                            secuencial: payload.infoTributaria.secuencial,
                            total: payload.infoFactura.importeTotal,
                            emailCliente: payload.emailCliente
                        })];
                case 3:
                    // 3. Guardar registro inicial
                    _b.sent();
                    return [4 /*yield*/, (0, openFacturaService_1.sendReception)(signedXml)];
                case 4:
                    receptionResult = _b.sent();
                    console.info("Resultado de recepci\u00F3n: ".concat(receptionResult.estado));
                    if (!(receptionResult.estado === 'DEVUELTA')) return [3 /*break*/, 6];
                    // Actualizar estado y guardar mensajes de error
                    return [4 /*yield*/, repositories_1.invoiceRepo.upsertByClave({
                            claveAcceso: accessKey,
                            estado: 'DEVUELTA',
                            xmlFirmado: signedXml,
                            estab: payload.infoTributaria.estab,
                            ptoEmi: payload.infoTributaria.ptoEmi,
                            secuencial: payload.infoTributaria.secuencial,
                            total: payload.infoFactura.importeTotal,
                            emailCliente: payload.emailCliente
                        })];
                case 5:
                    // Actualizar estado y guardar mensajes de error
                    _b.sent();
                    return [2 /*return*/, {
                            claveAcceso: accessKey,
                            estado: 'DEVUELTA',
                            mensajes: receptionResult.mensajes
                        }];
                case 6: return [4 /*yield*/, (0, openFacturaService_1.getAuthorization)(accessKey)];
                case 7:
                    authorizationResult = _b.sent();
                    console.info("Resultado de autorizaci\u00F3n: ".concat(authorizationResult.estado));
                    if (!(authorizationResult.estado === 'AUTORIZADO')) return [3 /*break*/, 13];
                    rideHtml = (0, rideHtml_1.buildRideHtml)(authorizationResult.xmlAutorizado);
                    console.info('RIDE HTML generado exitosamente');
                    // 7. Guardar registro autorizado
                    return [4 /*yield*/, repositories_1.invoiceRepo.upsertByClave({
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
                        })];
                case 8:
                    // 7. Guardar registro autorizado
                    _b.sent();
                    if (!payload.emailCliente) return [3 /*break*/, 12];
                    _b.label = 9;
                case 9:
                    _b.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, (0, emailService_1.sendInvoiceEmail)(payload.emailCliente, accessKey, authorizationResult.xmlAutorizado, rideHtml)];
                case 10:
                    _b.sent();
                    console.info("Email enviado exitosamente a: ".concat(payload.emailCliente));
                    return [3 /*break*/, 12];
                case 11:
                    emailError_1 = _b.sent();
                    console.error('Error enviando email:', emailError_1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/, {
                        claveAcceso: accessKey,
                        estado: 'AUTORIZADO',
                        numeroAutorizacion: authorizationResult.numeroAutorizacion,
                        fechaAutorizacion: authorizationResult.fechaAutorizacion
                    }];
                case 13: 
                // Actualizar estado y guardar mensajes de error
                return [4 /*yield*/, repositories_1.invoiceRepo.upsertByClave({
                        claveAcceso: accessKey,
                        estado: 'NO AUTORIZADO',
                        xmlFirmado: signedXml,
                        estab: payload.infoTributaria.estab,
                        ptoEmi: payload.infoTributaria.ptoEmi,
                        secuencial: payload.infoTributaria.secuencial,
                        total: payload.infoFactura.importeTotal,
                        emailCliente: payload.emailCliente
                    })];
                case 14:
                    // Actualizar estado y guardar mensajes de error
                    _b.sent();
                    return [2 /*return*/, {
                            claveAcceso: accessKey,
                            estado: 'NO AUTORIZADO',
                            mensajes: authorizationResult.mensajes
                        }];
                case 15: return [3 /*break*/, 17];
                case 16:
                    error_1 = _b.sent();
                    console.error('Error en crearYAutorizarFactura:', error_1);
                    throw new Error("Error en proceso de facturaci\u00F3n: ".concat(error_1 instanceof Error ? error_1.message : 'Error desconocido'));
                case 17: return [2 /*return*/];
            }
        });
    });
}
/**
 * Obtiene una factura por su clave de acceso
 */
function obtenerFacturaPorClave(claveAcceso) {
    return __awaiter(this, void 0, void 0, function () {
        var factura, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, repositories_1.invoiceRepo.findByClave(claveAcceso)];
                case 1:
                    factura = _a.sent();
                    if (!factura) {
                        throw new Error('Factura no encontrada');
                    }
                    return [2 /*return*/, factura];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error obteniendo factura:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Lista las últimas facturas
 */
function listarFacturas() {
    return __awaiter(this, arguments, void 0, function (limit) {
        var error_3;
        if (limit === void 0) { limit = 50; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, repositories_1.invoiceRepo.list(limit)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error listando facturas:', error_3);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
