"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceInfo = void 0;
var totalWithTaxes = {
    totalImpuesto: [
        {
            codigo: "2",
            codigoPorcentaje: "0",
            descuentoAdicional: "0.00",
            baseImponible: "50.00",
            tarifa: "49.50",
            valor: "50.00",
            valorDevolucionIva: "50.00",
        },
        {
            codigo: "2",
            codigoPorcentaje: "0",
            descuentoAdicional: "0.00",
            baseImponible: "50.00",
            tarifa: "49.50",
            valor: "50.00",
            valorDevolucionIva: "50.00",
        },
    ],
};
var compensations = {
    compensacion: [
        {
            codigo: "1",
            tarifa: "49.50",
            valor: "50.00",
        },
        {
            codigo: "1",
            tarifa: "49.50",
            valor: "50.00",
        },
    ],
};
var payments = {
    pago: [
        {
            formaPago: "01",
            total: "50.00",
            plazo: "50.00",
            unidadTiempo: "unidadTiempo",
        },
        {
            formaPago: "01",
            total: "50.00",
            plazo: "50.00",
            unidadTiempo: "unidadTiempo",
        },
    ],
};
exports.invoiceInfo = {
    fechaEmision: "01/01/2000",
    dirEstablecimiento: "dirEstablecimiento0",
    contribuyenteEspecial: "contribuyente",
    obligadoContabilidad: "SI",
    comercioExterior: "EXPORTADOR",
    incoTermFactura: "A",
    lugarIncoTerm: "lugarIncoTerm0",
    paisOrigen: "000",
    puertoEmbarque: "puertoEmbarque0",
    puertoDestino: "puertoDestino0",
    paisDestino: "000",
    paisAdquisicion: "000",
    tipoIdentificacionComprador: "04",
    guiaRemision: "000-000-000000000",
    razonSocialComprador: "razonSocialComprador0",
    identificacionComprador: "identificacionComprador0",
    direccionComprador: "direccionComprador0",
    totalSinImpuestos: "50.00",
    totalSubsidio: "50.00",
    incoTermTotalSinImpuestos: "A",
    totalDescuento: "0.00",
    codDocReembolso: "00",
    totalComprobantesReembolso: "50.00",
    totalBaseImponibleReembolso: "50.00",
    totalImpuestoReembolso: "50.00",
    totalConImpuestos: totalWithTaxes,
    compensaciones: compensations,
    propina: "50.00",
    fleteInternacional: "50.00",
    seguroInternacional: "50.00",
    gastosAduaneros: "50.00",
    gastosTransporteOtros: "50.00",
    importeTotal: "50.00",
    moneda: "moneda0",
    placa: "placa0",
    pagos: payments,
    valorRetIva: "50.00",
    valorRetRenta: "50.00",
};
