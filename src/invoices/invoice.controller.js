"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.createInvoice = createInvoice;
exports.getInvoiceByClave = getInvoiceByClave;
exports.listInvoices = listInvoices;
exports.setupInvoiceRoutes = setupInvoiceRoutes;
var invoice_service_1 = require("./invoice.service");
/**
 * Valida el formato de fecha dd/MM/yyyy
 */
function validateDateFormat(fecha) {
    var dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(fecha)) {
        return false;
    }
    var _a = fecha.split('/').map(Number), day = _a[0], month = _a[1], year = _a[2];
    var date = new Date(year, month - 1, day);
    return date.getDate() === day &&
        date.getMonth() === month - 1 &&
        date.getFullYear() === year;
}
/**
 * Valida los campos mínimos requeridos para crear una factura
 */
function validateInvoiceRequest(body) {
    var _a, _b, _c;
    var requiredFields = [
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
    for (var _i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
        var field = requiredFields_1[_i];
        var value = field.split('.').reduce(function (obj, key) { return obj === null || obj === void 0 ? void 0 : obj[key]; }, body);
        if (value === undefined || value === null || value === '') {
            return false;
        }
    }
    // Validar que codDoc sea "01" (factura)
    if (((_a = body.infoTributaria) === null || _a === void 0 ? void 0 : _a.codDoc) !== '01') {
        return false;
    }
    // Validar que detalles sea un array no vacío
    if (!Array.isArray(body.detalles) || body.detalles.length === 0) {
        return false;
    }
    // Validar formato de fecha dd/MM/yyyy
    if (!validateDateFormat((_b = body.infoFactura) === null || _b === void 0 ? void 0 : _b.fechaEmision)) {
        return false;
    }
    // Validar ambiente
    if (!['1', '2'].includes((_c = body.infoTributaria) === null || _c === void 0 ? void 0 : _c.ambiente)) {
        return false;
    }
    return true;
}
/**
 * POST /api/invoices
 * Crea y autoriza una factura electrónica
 */
function createInvoice(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, statusCode, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.info('Solicitud de creación de factura recibida');
                    // Validar campos mínimos
                    if (!validateInvoiceRequest(req.body)) {
                        return [2 /*return*/, res.status(400).json({
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
                            })];
                    }
                    return [4 /*yield*/, (0, invoice_service_1.crearYAutorizarFactura)(req.body)];
                case 1:
                    result = _a.sent();
                    statusCode = 200;
                    if (result.estado === 'DEVUELTA' || result.estado === 'NO AUTORIZADO') {
                        statusCode = 400;
                    }
                    return [2 /*return*/, res.status(statusCode).json(__assign({ success: result.estado === 'AUTORIZADO' }, result))];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error en createInvoice:', error_1);
                    return [2 /*return*/, res.status(500).json({
                            error: 'Error interno del servidor',
                            message: error_1 instanceof Error ? error_1.message : 'Error desconocido'
                        })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * GET /api/invoices/:claveAcceso
 * Obtiene una factura por su clave de acceso
 */
function getInvoiceByClave(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var claveAcceso, factura, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    claveAcceso = req.params.claveAcceso;
                    if (!claveAcceso) {
                        return [2 /*return*/, res.status(400).json({
                                error: 'Clave de acceso requerida'
                            })];
                    }
                    return [4 /*yield*/, (0, invoice_service_1.obtenerFacturaPorClave)(claveAcceso)];
                case 1:
                    factura = _a.sent();
                    return [2 /*return*/, res.json({
                            success: true,
                            factura: factura
                        })];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error en getInvoiceByClave:', error_2);
                    if (error_2 instanceof Error && error_2.message === 'Factura no encontrada') {
                        return [2 /*return*/, res.status(404).json({
                                error: 'Factura no encontrada'
                            })];
                    }
                    return [2 /*return*/, res.status(500).json({
                            error: 'Error interno del servidor',
                            message: error_2 instanceof Error ? error_2.message : 'Error desconocido'
                        })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * GET /api/invoices
 * Lista las últimas facturas
 */
function listInvoices(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var limit, facturas, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    limit = req.query.limit ? parseInt(req.query.limit) : 50;
                    // Validar límite
                    if (isNaN(limit) || limit < 1 || limit > 100) {
                        return [2 /*return*/, res.status(400).json({
                                error: 'Límite debe ser un número entre 1 y 100'
                            })];
                    }
                    return [4 /*yield*/, (0, invoice_service_1.listarFacturas)(limit)];
                case 1:
                    facturas = _a.sent();
                    return [2 /*return*/, res.json({
                            success: true,
                            count: facturas.length,
                            facturas: facturas
                        })];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error en listInvoices:', error_3);
                    return [2 /*return*/, res.status(500).json({
                            error: 'Error interno del servidor',
                            message: error_3 instanceof Error ? error_3.message : 'Error desconocido'
                        })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Configura las rutas de facturación
 */
function setupInvoiceRoutes(router) {
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
