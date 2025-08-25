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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoiceXml = generateInvoiceXml;
exports.generateInvoice = generateInvoice;
var xmlbuilder2_1 = require("xmlbuilder2");
var utils_1 = require("../utils/utils");
function generateInvoiceXml(invoice) {
    var document = (0, xmlbuilder2_1.create)(invoice);
    var xml = document.end({ prettyPrint: true });
    return xml;
}
function generateInvoice(invoiceData) {
    var accessKey = (0, utils_1.generateAccessKey)({
        date: new Date(invoiceData.infoFactura.fechaEmision),
        codDoc: invoiceData.infoTributaria.codDoc,
        ruc: invoiceData.infoTributaria.ruc,
        environment: invoiceData.infoTributaria.ambiente,
        establishment: invoiceData.infoTributaria.estab,
        emissionPoint: invoiceData.infoTributaria.ptoEmi,
        sequential: invoiceData.infoTributaria.secuencial,
    });
    var invoice = {
        factura: {
            "@xmlns:ds": "http://www.w3.org/2000/09/xmldsig#",
            "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "@id": "comprobante",
            "@version": "1.0.0",
            infoTributaria: __assign(__assign({}, invoiceData.infoTributaria), { claveAcceso: accessKey }),
            infoFactura: invoiceData.infoFactura,
            detalles: invoiceData.detalles,
        },
    };
    return { invoice: invoice, accessKey: accessKey };
}
