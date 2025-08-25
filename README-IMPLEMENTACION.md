# Implementación Completa del Flujo de Facturación Electrónica SRI

Esta implementación extiende **open-factura** con un flujo completo de facturación electrónica para Ecuador, incluyendo API REST, persistencia, RIDE HTML y envío de emails.

## 🏗️ Arquitectura Implementada

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API REST      │    │   Servicios     │    │   Persistencia  │
│   (Express)     │◄──►│   (Orquestación)│◄──►│   (Prisma/JSON) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   open-factura  │    │   RIDE HTML     │    │   Email SMTP    │
│   (SRI)         │    │   (Generador)   │    │   (Nodemailer)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Estructura de Archivos

```
src/
├── sri/
│   └── openFacturaService.ts     # Servicio SRI con open-factura
├── ride/
│   └── rideHtml.ts               # Generador de RIDE HTML
├── services/
│   └── emailService.ts           # Servicio de email
├── repositories/
│   ├── invoiceRepo.ts            # Repositorio de facturas
│   └── index.ts                  # Exportaciones
├── invoices/
│   ├── invoice.service.ts        # Servicio de orquestación
│   └── invoice.controller.ts     # Controlador Express
├── app/
│   └── index.ts                  # Aplicación Express
└── index.ts                      # Exportaciones principales
```

## 🚀 Funcionalidades Implementadas

### 1. **Servicio SRI Completo** (`src/sri/openFacturaService.ts`)
- ✅ Construcción y firma de facturas
- ✅ Envío al SRI para recepción
- ✅ Consulta de autorización
- ✅ Manejo de certificados .p12
- ✅ Conversión de formatos

### 2. **Generador de RIDE HTML** (`src/ride/rideHtml.ts`)
- ✅ Parseo del XML autorizado
- ✅ Generación de HTML limpio y profesional
- ✅ Formateo de moneda ecuatoriana
- ✅ Estructura responsive

### 3. **Servicio de Email** (`src/services/emailService.ts`)
- ✅ Configuración SMTP flexible
- ✅ Envío de facturas con adjuntos
- ✅ Manejo de errores robusto

### 4. **Persistencia Inteligente** (`src/repositories/`)
- ✅ Soporte para Prisma (si está disponible)
- ✅ Fallback a JSON local
- ✅ Factory pattern para selección automática

### 5. **API REST Completa** (`src/invoices/`)
- ✅ POST `/api/invoices` - Crear factura
- ✅ GET `/api/invoices/:claveAcceso` - Consultar factura
- ✅ GET `/api/invoices` - Listar facturas
- ✅ Validaciones robustas
- ✅ Manejo de errores HTTP

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Configurar variables en .env
```

#### **SRI (Obligatorio)**
```env
SRI_RECEPTION_URL=https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl
SRI_AUTHORIZATION_URL=https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl
```

#### **Certificado Digital (Obligatorio)**
```env
CERT_URL_OR_PATH=file://./certificados/certificado.p12
CERT_PASSWORD=mi_password_segura
```

#### **Email (Opcional)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=mi-email@gmail.com
SMTP_PASS=mi_password_de_aplicacion
SMTP_FROM=mi-email@gmail.com
```

## 📡 API Endpoints

### **POST /api/invoices**
Crea y autoriza una factura electrónica completa.

**Request Body:**
```json
{
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
}
```

**Response (AUTORIZADO):**
```json
{
  "success": true,
  "claveAcceso": "0101202401123456789000011001001000000001XXXXXXXXX1",
  "estado": "AUTORIZADO",
  "numeroAutorizacion": "1234567890",
  "fechaAutorizacion": "01/01/2024 10:30:00"
}
```

**Response (DEVUELTA):**
```json
{
  "success": false,
  "claveAcceso": "0101202401123456789000011001001000000001XXXXXXXXX1",
  "estado": "DEVUELTA",
  "mensajes": ["Error específico del SRI"]
}
```

### **GET /api/invoices/:claveAcceso**
Consulta una factura por su clave de acceso.

### **GET /api/invoices?limit=50**
Lista las últimas facturas (máximo 100).

## 🔄 Flujo Completo Implementado

1. **Validación de Datos** → Campos mínimos requeridos
2. **Construcción** → Generar factura con open-factura
3. **Firma Digital** → Firmar con certificado .p12
4. **Persistencia Inicial** → Guardar registro
5. **Recepción SRI** → Enviar XML firmado
6. **Autorización SRI** → Consultar con clave de acceso
7. **Generación RIDE** → Crear HTML representativo
8. **Persistencia Final** → Actualizar con resultado
9. **Envío Email** → Enviar factura y RIDE (si configurado)

## 🛠️ Uso Programático

### **Servicio de Orquestación**
```typescript
import { crearYAutorizarFactura } from './src/invoices/invoice.service';

const resultado = await crearYAutorizarFactura({
  infoTributaria: { /* ... */ },
  infoFactura: { /* ... */ },
  detalles: [ /* ... */ ],
  emailCliente: 'cliente@ejemplo.com'
});
```

### **Servicio SRI Directo**
```typescript
import { buildAndSign, sendReception, getAuthorization } from './src/sri/openFacturaService';

const { accessKey, signedXml } = await buildAndSign(datosFactura);
const reception = await sendReception(signedXml);
const authorization = await getAuthorization(accessKey);
```

### **Generador de RIDE**
```typescript
import { buildRideHtml } from './src/ride/rideHtml';

const rideHtml = buildRideHtml(xmlAutorizado);
```

## 🧪 Pruebas

### **Curl de Ejemplo**
```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d @factura-ejemplo.json
```

### **Health Check**
```bash
curl http://localhost:3000/health
```

## 🔍 Logs y Monitoreo

La implementación incluye logs detallados en cada paso:

```
2024-01-01T10:00:00.000Z - POST /api/invoices
Iniciando proceso de facturación electrónica
Iniciando construcción de factura electrónica
Factura generada con clave de acceso: 0101202401...
XML generado exitosamente
Certificado cargado exitosamente
XML firmado exitosamente
Factura construida y firmada con clave: 0101202401...
Enviando XML al SRI para recepción
Resultado de recepción: RECIBIDA
Consultando autorización para clave: 0101202401...
Resultado de autorización: AUTORIZADO
RIDE HTML generado exitosamente
Email enviado exitosamente a: cliente@ejemplo.com
```

## 🚨 Manejo de Errores

### **Errores SRI**
- **DEVUELTA**: Errores de validación del SRI
- **NO AUTORIZADO**: Errores de autorización
- **HTTP 400**: Para ambos casos con mensajes detallados

### **Errores de Sistema**
- **HTTP 500**: Errores internos del servidor
- **Logs detallados**: Para debugging

## 🔒 Seguridad

- ✅ **Certificados seguros**: Manejo seguro de .p12
- ✅ **Validaciones**: Campos requeridos y formatos
- ✅ **Logs seguros**: Sin exponer contraseñas
- ✅ **CORS configurado**: Para APIs web

## 📊 Persistencia

### **Con Prisma (Recomendado)**
```sql
-- Modelo sugerido para Prisma
model Invoice {
  id                  String   @id @default(cuid())
  claveAcceso         String   @unique
  estado              String
  xmlFirmado          String   @db.Text
  xmlAutorizado       String?  @db.Text
  numeroAutorizacion  String?
  fechaAutorizacion   String?
  estab               String
  ptoEmi              String
  secuencial          String
  total               Float
  emailCliente        String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

### **Con JSON (Fallback)**
- Archivo: `./data/invoices.json`
- Estructura automática
- Sin dependencias externas

## 🎯 Características Destacadas

1. **Zero Dependencies**: No instala paquetes adicionales
2. **Fallback Inteligente**: Prisma → JSON automático
3. **Tipado Estricto**: TypeScript completo
4. **Logs Detallados**: Monitoreo completo
5. **Validaciones Robustas**: Campos y formatos
6. **Manejo de Errores**: HTTP codes apropiados
7. **Documentación Completa**: Ejemplos y guías

## 🚀 Inicio Rápido

1. **Configurar variables de entorno**
2. **Colocar certificado .p12**
3. **Ejecutar servidor**: `npm start`
4. **Probar endpoint**: `curl -X POST /api/invoices`

¡Listo! Tienes un sistema completo de facturación electrónica funcionando. 🎉
