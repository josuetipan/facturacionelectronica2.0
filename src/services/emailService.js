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
exports.verifyEmailConfig = verifyEmailConfig;
exports.sendEmail = sendEmail;
exports.sendInvoiceEmail = sendInvoiceEmail;
var nodemailer_1 = require("nodemailer");
/**
 * Configuración del transporter de email
 */
function createTransporter() {
    var host = process.env.SMTP_HOST || 'localhost';
    var port = parseInt(process.env.SMTP_PORT || '587');
    var secure = process.env.SMTP_SECURE === 'true';
    var user = process.env.SMTP_USER;
    var pass = process.env.SMTP_PASS;
    var from = process.env.SMTP_FROM || user;
    if (!user || !pass) {
        throw new Error('SMTP_USER y SMTP_PASS deben estar configurados');
    }
    return nodemailer_1.default.createTransport({
        host: host,
        port: port,
        secure: secure,
        auth: {
            user: user,
            pass: pass
        }
    });
}
/**
 * Verifica la configuración de email al inicio
 */
function verifyEmailConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var transporter, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    transporter = createTransporter();
                    return [4 /*yield*/, transporter.verify()];
                case 1:
                    _a.sent();
                    console.info('Configuración de email verificada correctamente');
                    return [2 /*return*/, true];
                case 2:
                    error_1 = _a.sent();
                    console.error('Configuración de email inválida:', error_1);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Envía un email usando la configuración del transporter
 */
function sendEmail(options) {
    return __awaiter(this, void 0, void 0, function () {
        var transporter, mailOptions, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    transporter = createTransporter();
                    mailOptions = {
                        from: process.env.SMTP_FROM || process.env.SMTP_USER,
                        to: options.to,
                        subject: options.subject,
                        html: options.html,
                        text: options.text,
                        attachments: options.attachments
                    };
                    console.info("Enviando email a: ".concat(options.to));
                    return [4 /*yield*/, transporter.sendMail(mailOptions)];
                case 1:
                    result = _a.sent();
                    console.info('Email enviado exitosamente');
                    return [2 /*return*/, result];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error enviando email:', error_2);
                    throw new Error("Error al enviar email: ".concat(error_2 instanceof Error ? error_2.message : 'Error desconocido'));
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Envía email con factura electrónica y RIDE
 */
function sendInvoiceEmail(to, claveAcceso, xmlAutorizado, rideHtml) {
    return __awaiter(this, void 0, void 0, function () {
        var subject, html, attachments;
        return __generator(this, function (_a) {
            subject = "Factura Electr\u00F3nica - ".concat(claveAcceso);
            html = "\n    <h2>Factura Electr\u00F3nica Autorizada</h2>\n    <p>Su factura electr\u00F3nica ha sido autorizada por el SRI.</p>\n    <p><strong>Clave de Acceso:</strong> ".concat(claveAcceso, "</p>\n    <p>Adjunto encontrar\u00E1:</p>\n    <ul>\n      <li>El archivo XML de la factura autorizada</li>\n      <li>La representaci\u00F3n impresa (RIDE) en formato HTML</li>\n    </ul>\n    <p>Gracias por su preferencia.</p>\n  ");
            attachments = [
                {
                    filename: "factura-".concat(claveAcceso, ".xml"),
                    content: xmlAutorizado,
                    contentType: 'application/xml'
                },
                {
                    filename: "ride-".concat(claveAcceso, ".html"),
                    content: rideHtml,
                    contentType: 'text/html'
                }
            ];
            return [2 /*return*/, sendEmail({
                    to: to,
                    subject: subject,
                    html: html,
                    attachments: attachments
                })];
        });
    });
}
