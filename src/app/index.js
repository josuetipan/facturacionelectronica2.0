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
var express_1 = require("express");
var dotenv_1 = require("dotenv");
var invoice_controller_1 = require("../invoices/invoice.controller");
var emailService_1 = require("../services/emailService");
// Cargar variables de entorno
dotenv_1.default.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3000;
// Middleware para parsear JSON
app.use(express_1.default.json({ limit: '10mb' }));
// Middleware para logging
app.use(function (req, res, next) {
    console.info("".concat(new Date().toISOString(), " - ").concat(req.method, " ").concat(req.path));
    next();
});
// Middleware para CORS (si es necesario)
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
// Ruta de salud
app.get('/health', function (req, res) {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Configurar rutas de facturación
var apiRouter = express_1.default.Router();
(0, invoice_controller_1.setupInvoiceRoutes)(apiRouter);
app.use('/api', apiRouter);
// Middleware para manejo de errores
app.use(function (error, req, res, next) {
    console.error('Error no manejado:', error);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'production' ? 'Error interno' : error.message
    });
});
// Middleware para rutas no encontradas
app.use('*', function (req, res) {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl
    });
});
// Iniciar servidor
app.listen(PORT, function () { return __awaiter(void 0, void 0, void 0, function () {
    var emailConfigValid;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.info("\uD83D\uDE80 Servidor iniciado en puerto ".concat(PORT));
                console.info("\uD83D\uDCCA Health check: http://localhost:".concat(PORT, "/health"));
                console.info("\uD83D\uDCC4 API de facturaci\u00F3n: http://localhost:".concat(PORT, "/api/invoices"));
                if (!process.env.SMTP_HOST) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, emailService_1.verifyEmailConfig)()];
            case 1:
                emailConfigValid = _a.sent();
                if (!emailConfigValid) {
                    console.warn('⚠️  Configuración de email inválida - las facturas no se enviarán por email');
                }
                _a.label = 2;
            case 2:
                // Mostrar configuración
                console.info('🔧 Configuración:');
                console.info("   - Ambiente: ".concat(process.env.NODE_ENV || 'development'));
                console.info("   - SRI Recepci\u00F3n: ".concat(process.env.SRI_RECEPTION_URL ? 'Configurado' : 'NO CONFIGURADO'));
                console.info("   - SRI Autorizaci\u00F3n: ".concat(process.env.SRI_AUTHORIZATION_URL ? 'Configurado' : 'NO CONFIGURADO'));
                console.info("   - Certificado: ".concat(process.env.CERT_URL_OR_PATH ? 'Configurado' : 'NO CONFIGURADO'));
                console.info("   - Email SMTP: ".concat(process.env.SMTP_HOST ? 'Configurado' : 'NO CONFIGURADO'));
                return [2 /*return*/];
        }
    });
}); });
exports.default = app;
