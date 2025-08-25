"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoice = void 0;
var additionalInfo_1 = require("./additionalInfo");
var details_1 = require("./details");
var invoiceInfo_1 = require("./invoiceInfo");
var otherThirdPartyValues_1 = require("./otherThirdPartyValues");
var reimbursements_1 = require("./reimbursements");
var remissionGuidesSustitutiveInfo_1 = require("./remissionGuidesSustitutiveInfo");
var retentions_1 = require("./retentions");
var taxInfo_1 = require("./taxInfo");
exports.invoice = {
    factura: {
        "@xmlns:ds": "http://www.w3.org/2000/09/xmldsig#",
        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "@id": "comprobante",
        "@version": "version0",
        infoTributaria: taxInfo_1.taxInfo,
        infoFactura: invoiceInfo_1.invoiceInfo,
        detalles: details_1.details,
        reembolsos: reimbursements_1.reimbursements,
        retenciones: retentions_1.retentions,
        infoSustitutivaGuiaRemision: remissionGuidesSustitutiveInfo_1.remisionGuideSustitutiveInfo,
        otrosRubrosTerceros: otherThirdPartyValues_1.otherThirdPartyValues,
        tipoNegociable: {
            correo: "correo0",
        },
        maquinaFiscal: {
            marca: "marca0",
            modelo: "modelo0",
            serie: "serie0",
        },
        infoAdicional: additionalInfo_1.additionalInfo,
    },
};
