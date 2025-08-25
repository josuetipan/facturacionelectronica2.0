"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.details = void 0;
var aditionalDetails = {
    detAdicional: [
        {
            "@nombre": "nombre0",
            "@valor": "valor0",
        },
        {
            "@nombre": "nombre1",
            "@valor": "valor1",
        },
    ],
};
var taxes = {
    impuesto: [
        {
            codigo: "2",
            codigoPorcentaje: "0",
            tarifa: "49.50",
            baseImponible: "50.00",
            valor: "50.00",
        },
        {
            codigo: "2",
            codigoPorcentaje: "0",
            tarifa: "49.50",
            baseImponible: "50.00",
            valor: "50.00",
        },
    ],
};
exports.details = {
    detalle: [
        {
            codigoPrincipal: "codigoPrincipal0",
            codigoAuxiliar: "codigoAuxiliar0",
            descripcion: "descripcion0",
            unidadMedida: "unidadMedida0",
            cantidad: "50.000000",
            precioUnitario: "50.000000",
            precioSinSubsidio: "50.000000",
            descuento: "50.00",
            precioTotalSinImpuesto: "50.00",
            detallesAdicionales: aditionalDetails,
            impuestos: taxes,
        },
        {
            codigoPrincipal: "codigoPrincipal1",
            codigoAuxiliar: "codigoAuxiliar1",
            descripcion: "descripcion1",
            unidadMedida: "unidadMedida1",
            cantidad: "50.000000",
            precioUnitario: "50.000000",
            precioSinSubsidio: "50.000000",
            descuento: "50.00",
            precioTotalSinImpuesto: "50.00",
            detallesAdicionales: aditionalDetails,
            impuestos: taxes,
        },
    ],
};
