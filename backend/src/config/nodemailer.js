import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Sanitize & normalize configuration credentials
const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_MAIL || '').trim();
const smtpPass = (process.env.EMAIL_PASS || process.env.SMTP_PASSWORD || '').trim();
const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const isSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

/**
 * Creates and configures a production-ready Nodemailer transporter.
 * Uses STARTTLS (Port 587) by default for Gmail to prevent Cloud Hosting (Render) SSL handshake drops.
 */
const transporterOptions = {
  host: smtpHost,
  port: smtpPort,
  secure: isSecure, // false for port 587, true for port 465
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3',
  },
  requireTLS: !isSecure, // Enforce STARTTLS for port 587
  connectionTimeout: 15000, // 15s connection timeout for Render network
  greetingTimeout: 15000,
  socketTimeout: 15000,
  dnsTimeout: 10000,
};

// If custom service is defined (e.g., 'gmail', 'SendGrid', 'Brevo'), pass it explicitly
if (process.env.SMTP_SERVICE) {
  transporterOptions.service = process.env.SMTP_SERVICE;
}

const transporter = nodemailer.createTransport(transporterOptions);

/**
 * Verifies SMTP connection and authentication status.
 * @returns {Promise<boolean>} True if connected, throws error if connection fails.
 */
export const verifyTransporter = async () => {
  console.log('🔐 [NODEMAILER DIAGNOSTIC] Authenticating SMTP Transporter...');
  console.log(`📡 [SMTP CONFIG] Host: ${smtpHost} | Port: ${smtpPort} | Secure: ${isSecure} | User: ${smtpUser ? smtpUser.replace(/(.{2})(.*)(?=@)/, '$1***') : 'NOT_SET'}`);
  
  try {
    const success = await transporter.verify();
    console.log('✅ [NODEMAILER] SMTP Transporter connected successfully and ready to deliver messages.');
    return success;
  } catch (error) {
    console.error('❌ [NODEMAILER ERROR] SMTP Transporter verification failed:', error.message);
    throw error;
  }
};

// Verify connection on non-production startup for developer feedback
if (process.env.NODE_ENV !== 'production') {
  verifyTransporter().catch(() => {});
}

export default transporter;
