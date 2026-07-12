import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Custom Transactional Email Service using Nodemailer.
 */
class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initializes the SMTP transporter if credentials are provided.
   */
  private initializeTransporter() {
    const { host, port, user, pass } = config.smtp;

    const isPlaceholder =
      !user ||
      user === 'your-email@domain.com' ||
      !pass ||
      pass === 'your-email-password-or-app-key' ||
      host === 'smtp.yourprovider.com';

    if (isPlaceholder) {
      logger.warn('⚠️ SMTP email credentials (SMTP_USER/SMTP_PASS) are missing or are default placeholders. Transactional emails will be mocked to the server logs.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // True for 465, false for 587 or other ports
        auth: {
          user,
          pass,
        },
      });
      logger.info(`📧 Custom SMTP email client initialized successfully: Host ${host}:${port}`);
    } catch (err: any) {
      logger.error(`❌ Failed to initialize SMTP email client: ${err.message}`);
    }
  }

  get isMocked(): boolean {
    return !this.transporter;
  }

  /**
   * Sends a beautiful custom HTML 6-digit OTP verification email.
   */
  async sendOtpEmail(toEmail: string, code: string): Promise<void> {
    const fromName = config.smtp.fromName;
    const fromEmail = config.smtp.fromEmail || config.smtp.user;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your ServiceWala account</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #F9FAFB;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 480px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
            border: 1px solid #E5E7EB;
          }
          .header {
            background-color: #10B981;
            padding: 32px;
            text-align: center;
          }
          .header h1 {
            color: #FFFFFF;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 40px 32px;
            text-align: center;
          }
          .content p {
            color: #4B5563;
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 24px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: 800;
            color: #10B981;
            letter-spacing: 6px;
            background-color: #ECFDF5;
            padding: 16px 24px;
            border-radius: 16px;
            display: inline-block;
            margin-bottom: 28px;
            border: 1px solid #A7F3D0;
            -webkit-user-select: all;
            user-select: all;
          }
          .footer {
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #F3F4F6;
            background-color: #FAFAFA;
          }
          .footer p {
            color: #9CA3AF;
            font-size: 12px;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <!-- Hidden preheader for native mobile notification OTP parsers -->
        <span style="display:none !important; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
          Your ServiceWala verification code is: ${code}. Do not share this code.
        </span>
        <div class="container">
          <div class="header">
            <h1>${fromName} Verification</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You requested a login/signup verification code for your <strong>ServiceWala</strong> account. Please use the following 6-digit OTP code:</p>
            <div class="otp-code">${code}</div>
            <p>This code is valid for <strong>5 minutes</strong>. For security, do not share this code with anyone.</p>
          </div>
          <div class="footer">
            <p>If you did not request this email, please ignore it.</p>
            <p style="margin-top: 8px;">&copy; ${new Date().getFullYear()} ServiceWala. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Re-initialize transporter if it was previously mock-mode but configuration is updated
    if (!this.transporter && config.smtp.user && config.smtp.pass) {
      this.initializeTransporter();
    }

    if (!this.transporter) {
      logger.info(`✨ [MOCK EMAIL] OTP verification code for ${toEmail}: [ ${code} ]`);
      return;
    }

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: `Your ServiceWala Verification Code: ${code}`,
      html: htmlBody,
      text: `Your ServiceWala verification code is: ${code}. Do not share this code.`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Custom OTP email sent successfully to: ${toEmail}`);
    } catch (err: any) {
      logger.error(`❌ Custom SMTP failed to send email to ${toEmail}: ${err.message}`);
      throw new Error(`Failed to send email verification code: ${err.message}`);
    }
  }
}

export const emailService = new EmailService();
