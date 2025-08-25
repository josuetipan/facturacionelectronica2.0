"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reimbursements = void 0;
var taxDetail = {
    codigo: "2",
    codigoPorcentaje: "0",
    tarifa: "49.50",
    baseImponibleReembolso: "50.00",
    impuestoReembolso: "50.00",
};
var taxDetails = {
    detalleImpuesto: [taxDetail, taxDetail],
};
var reimbursementCompensation = {
    codigo: "1",
    tarifa: "49.50",
    valor: "50.00",
};
var reimbursementCompensations = {
    compensacionesReembolso: [
        reimbursementCompensation,
        reimbursementCompensation,
    ],
};
exports.reimbursements = {
    reembolsoDetalle: [
        {
            tipoIdentificacionProveedorReembolso: "04",
            identificacionProveedorReembolso: "identificacionProveedorReembolso0",
            codPaisPagoProveedorReembolso: "000",
            tipoProveedorReembolso: "01",
            codDocReembolso: "00",
            estabDocReembolso: "000",
            ptoEmiDocReembolso: "000",
            secuencialDocReembolso: "0000000000",
            fechaEmisionDocReembolso: "01/01/2000",
            numeroautorizacionDocReemb: "0000000000",
            detalleImpuestos: taxDetails,
            compensacionesReembolso: reimbursementCompensations,
        },
        {
            tipoIdentificacionProveedorReembolso: "04",
            identificacionProveedorReembolso: "identificacionProveedorReembolso0",
            codPaisPagoProveedorReembolso: "000",
            tipoProveedorReembolso: "01",
            codDocReembolso: "00",
            estabDocReembolso: "000",
            ptoEmiDocReembolso: "000",
            secuencialDocReembolso: "0000000000",
            fechaEmisionDocReembolso: "01/01/2000",
            numeroautorizacionDocReemb: "0000000000",
            detalleImpuestos: taxDetails,
            compensacionesReembolso: reimbursementCompensations,
        },
    ],
};
