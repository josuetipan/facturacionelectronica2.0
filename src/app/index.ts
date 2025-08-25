import express from 'express';
import dotenv from 'dotenv';
import { setupInvoiceRoutes } from '../invoices/invoice.controller';
import { verifyEmailConfig } from '../services/emailService';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));

// Middleware para logging
app.use((req, res, next) => {
  console.info(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware para CORS (si es necesario)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Configurar rutas de facturación
const apiRouter = express.Router();
setupInvoiceRoutes(apiRouter);
app.use('/api', apiRouter);

// Middleware para manejo de errores
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no manejado:', error);
  
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' ? 'Error interno' : error.message
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.info(`🚀 Servidor iniciado en puerto ${PORT}`);
  console.info(`📊 Health check: http://localhost:${PORT}/health`);
  console.info(`📄 API de facturación: http://localhost:${PORT}/api/invoices`);
  
  // Verificar configuración de email al inicio
  if (process.env.SMTP_HOST) {
    const emailConfigValid = await verifyEmailConfig();
    if (!emailConfigValid) {
      console.warn('⚠️  Configuración de email inválida - las facturas no se enviarán por email');
    }
  }
  
  // Mostrar configuración
  console.info('🔧 Configuración:');
  console.info(`   - Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.info(`   - SRI Recepción: ${process.env.SRI_RECEPTION_URL ? 'Configurado' : 'NO CONFIGURADO'}`);
  console.info(`   - SRI Autorización: ${process.env.SRI_AUTHORIZATION_URL ? 'Configurado' : 'NO CONFIGURADO'}`);
  console.info(`   - Certificado: ${process.env.CERT_URL_OR_PATH ? 'Configurado' : 'NO CONFIGURADO'}`);
  console.info(`   - Email SMTP: ${process.env.SMTP_HOST ? 'Configurado' : 'NO CONFIGURADO'}`);
});

export default app;
