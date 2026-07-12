import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration from environment variables
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || 'ArkDev Pro <noreply@arkdevpro.com>';
const adminEmail = process.env.ADMIN_GMAIL || 'premchandsharma@gmail.com'; // Default admin gmail

let transporter = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort == 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
  console.log('📧 Nodemailer configured successfully with SMTP host.');
} else {
  console.log('⚠️ SMTP variables not configured. Emails will be saved locally as HTML in "server/sent_emails/".');
}

// Helper to save mail logs locally
const saveMailLocally = (to, subject, html) => {
  const mailDir = path.resolve(__dirname, 'sent_emails');
  if (!fs.existsSync(mailDir)) {
    fs.mkdirSync(mailDir, { recursive: true });
  }
  const filename = `email_${Date.now()}_${to.replace(/[@.]/g, '_')}.html`;
  const filePath = path.join(mailDir, filename);
  
  const content = `
<!--
  To: ${to}
  Subject: ${subject}
  Date: ${new Date().toISOString()}
-->
${html}
  `;
  fs.writeFileSync(filePath, content);
  console.log(`💾 Saved email to ${filePath}`);
};

export const emailService = {
  async sendEmail({ to, subject, html }) {
    if (transporter) {
      try {
        await transporter.sendMail({
          from: smtpFrom,
          to,
          subject,
          html
        });
        console.log(`✉️ Email successfully sent to ${to}: ${subject}`);
      } catch (err) {
        console.error(`❌ Failed to send email via SMTP to ${to}:`, err.message);
        saveMailLocally(to, subject, html);
      }
    } else {
      saveMailLocally(to, subject, html);
    }
  },

  async notifyAdminOnRegistration(user, ip, browser) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0d0e12; color: #f3f4f6; border-radius: 12px; border: 1px solid #1e293b;">
        <h2 style="color: #6366f1; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">New User Registration 🟢</h2>
        <p>A new developer has joined ArkDev Pro.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #94a3b8; border-bottom: 1px solid #1e293b;">Name:</td>
            <td style="padding: 8px; color: #f3f4f6; border-bottom: 1px solid #1e293b;">${user.username}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #94a3b8; border-bottom: 1px solid #1e293b;">Email:</td>
            <td style="padding: 8px; color: #f3f4f6; border-bottom: 1px solid #1e293b;">${user.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #94a3b8; border-bottom: 1px solid #1e293b;">OAuth Provider:</td>
            <td style="padding: 8px; color: #f3f4f6; border-bottom: 1px solid #1e293b; text-transform: uppercase;">${user.provider}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #94a3b8; border-bottom: 1px solid #1e293b;">IP Address:</td>
            <td style="padding: 8px; color: #f3f4f6; border-bottom: 1px solid #1e293b;">${ip || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #94a3b8; border-bottom: 1px solid #1e293b;">Browser:</td>
            <td style="padding: 8px; color: #f3f4f6; border-bottom: 1px solid #1e293b;">${browser || 'Unknown'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #94a3b8; border-bottom: 1px solid #1e293b;">Time:</td>
            <td style="padding: 8px; color: #f3f4f6; border-bottom: 1px solid #1e293b;">${new Date().toLocaleString()}</td>
          </tr>
        </table>
      </div>
    `;
    await this.sendEmail({
      to: adminEmail,
      subject: `[ArkDevPro] New User Registered: ${user.username}`,
      html
    });
  },

  async notifyAdminOnPayment(user, payment) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0d0e12; color: #f3f4f6; border-radius: 12px; border: 1px solid #1e293b;">
        <h2 style="color: #10b981; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">Payment Captured Successfully! 💰</h2>
        <p>A new purchase has been processed.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #94a3b8; border-bottom: 1px solid #1e293b;">Customer:</td>
            <td style="padding: 8px; color: #f3f4f6; border-bottom: 1px solid #1e293b;">${user.username}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #94a3b8; border-bottom: 1px solid #1e293b;">Email:</td>
            <td style="padding: 8px; color: #f3f4f6; border-bottom: 1px solid #1e293b;">${user.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #94a3b8; border-bottom: 1px solid #1e293b;">Plan Purchased:</td>
            <td style="padding: 8px; color: #f3f4f6; border-bottom: 1px solid #1e293b; text-transform: uppercase; font-weight: bold;">${payment.plan}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #94a3b8; border-bottom: 1px solid #1e293b;">Amount Paid:</td>
            <td style="padding: 8px; color: #10b981; border-bottom: 1px solid #1e293b; font-weight: bold;">${payment.currency} ${payment.amount}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #94a3b8; border-bottom: 1px solid #1e293b;">Payment ID:</td>
            <td style="padding: 8px; color: #f3f4f6; border-bottom: 1px solid #1e293b;">${payment.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #94a3b8; border-bottom: 1px solid #1e293b;">Order ID:</td>
            <td style="padding: 8px; color: #f3f4f6; border-bottom: 1px solid #1e293b;">${payment.order_id}</td>
          </tr>
        </table>
      </div>
    `;
    await this.sendEmail({
      to: adminEmail,
      subject: `[ArkDevPro] Payment Successful: ${payment.currency} ${payment.amount} by ${user.username}`,
      html
    });
  },

  async sendInvoiceToCustomer(user, payment, invoiceNo) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f3f4f6; border-radius: 12px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 28px;">ArkDev Pro</h1>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Premium Developer Assets & UI Kits</p>
        </div>
        <div style="background-color: #111827; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #1f2937;">
          <h3 style="color: #10b981; margin-top: 0;">Subscription Activated! 🎉</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.5;">Hi ${user.username}, thank you for your purchase! Your lifetime subscription to the <strong>${payment.plan.toUpperCase()}</strong> plan is now active. You have full access to our premium templates, UI components, and lifetime updates.</p>
        </div>
        <h3 style="color: #f3f4f6; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Invoice Number:</td>
            <td style="padding: 6px 0; text-align: right; color: #f3f4f6; font-weight: bold;">${invoiceNo}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Plan:</td>
            <td style="padding: 6px 0; text-align: right; color: #f3f4f6; text-transform: capitalize;">${payment.plan}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Amount:</td>
            <td style="padding: 6px 0; text-align: right; color: #10b981; font-weight: bold;">${payment.currency} ${payment.amount}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Payment ID:</td>
            <td style="padding: 6px 0; text-align: right; color: #f3f4f6; font-family: monospace;">${payment.id}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Date:</td>
            <td style="padding: 6px 0; text-align: right; color: #f3f4f6;">${new Date().toLocaleDateString()}</td>
          </tr>
        </table>
        <div style="margin-top: 30px; text-align: center; border-top: 1px solid #1e293b; padding-top: 20px;">
          <p style="font-size: 12px; color: #64748b; margin: 0;">If you have any questions, please contact support at support@arkdevpro.com</p>
        </div>
      </div>
    `;
    await this.sendEmail({
      to: user.email,
      subject: `Your ArkDev Pro Invoice & Subscription Confirmation [${invoiceNo}]`,
      html
    });
  }
};
