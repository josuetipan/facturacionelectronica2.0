"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.getXMLFromLocalUrl = exports.getXMLFromLocalFile = exports.getP12FromUrl = exports.getP12FromLocalFile = exports.signXml = exports.documentReception = exports.generateInvoiceXml = exports.generateInvoice = exports.documentAuthorization = void 0;
// Exportaciones originales de open-factura
var authorization_1 = require("./services/authorization");
Object.defineProperty(exports, "documentAuthorization", { enumerable: true, get: function () { return authorization_1.documentAuthorization; } });
var generateInvoice_1 = require("./services/generateInvoice");
Object.defineProperty(exports, "generateInvoice", { enumerable: true, get: function () { return generateInvoice_1.generateInvoice; } });
Object.defineProperty(exports, "generateInvoiceXml", { enumerable: true, get: function () { return generateInvoice_1.generateInvoiceXml; } });
var reception_1 = require("./services/reception");
Object.defineProperty(exports, "documentReception", { enumerable: true, get: function () { return reception_1.documentReception; } });
var signing_1 = require("./services/signing");
Object.defineProperty(exports, "signXml", { enumerable: true, get: function () { return signing_1.signXml; } });
Object.defineProperty(exports, "getP12FromLocalFile", { enumerable: true, get: function () { return signing_1.getP12FromLocalFile; } });
Object.defineProperty(exports, "getP12FromUrl", { enumerable: true, get: function () { return signing_1.getP12FromUrl; } });
Object.defineProperty(exports, "getXMLFromLocalFile", { enumerable: true, get: function () { return signing_1.getXMLFromLocalFile; } });
Object.defineProperty(exports, "getXMLFromLocalUrl", { enumerable: true, get: function () { return signing_1.getXMLFromLocalUrl; } });
// Exportaciones del flujo completo de facturación
__exportStar(require("./sri/openFacturaService"), exports);
__exportStar(require("./ride/rideHtml"), exports);
__exportStar(require("./services/emailService"), exports);
__exportStar(require("./repositories"), exports);
__exportStar(require("./invoices/invoice.service"), exports);
__exportStar(require("./invoices/invoice.controller"), exports);
var index_1 = require("./app/index");
Object.defineProperty(exports, "app", { enumerable: true, get: function () { return index_1.default; } });
