import nodemailer from 'nodemailer';

/**
 * Configuración del transporter de email
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'localhost';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!user || !pass) {
    throw new Error('SMTP_USER y SMTP_PASS deben estar configurados');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
}

/**
 * Verifica la configuración de email al inicio
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.info('Configuración de email verificada correctamente');
    return true;
  } catch (error) {
    console.error('Configuración de email inválida:', error);
    return false;
  }
}

/**
 * Opciones para enviar email
 */
export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Envía un email usando la configuración del transporter
 */
export async function sendEmail(options: EmailOptions): Promise<any> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments
    };

    console.info(`Enviando email a: ${options.to}`);
    const result = await transporter.sendMail(mailOptions);
    console.info('Email enviado exitosamente');
    
    return result;
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error(`Error al enviar email: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Envía email con factura electrónica y RIDE
 */
export async function sendInvoiceEmail(
  to: string,
  claveAcceso: string,
  xmlAutorizado: string,
  rideHtml: string
): Promise<any> {
  const subject = `Factura Electrónica - ${claveAcceso}`;
  
  const html = `
    <h2>Factura Electrónica Autorizada</h2>
    <p>Su factura electrónica ha sido autorizada por el SRI.</p>
    <p><strong>Clave de Acceso:</strong> ${claveAcceso}</p>
    <p>Adjunto encontrará:</p>
    <ul>
      <li>El archivo XML de la factura autorizada</li>
      <li>La representación impresa (RIDE) en formato HTML</li>
    </ul>
    <p>Gracias por su preferencia.</p>
  `;

  const attachments = [
    {
      filename: `factura-${claveAcceso}.xml`,
      content: xmlAutorizado,
      contentType: 'application/xml'
    },
    {
      filename: `ride-${claveAcceso}.html`,
      content: rideHtml,
      contentType: 'text/html'
    }
  ];

  return sendEmail({
    to,
    subject,
    html,
    attachments
  });
}
