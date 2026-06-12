const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: config.email.user ? { user: config.email.user, pass: config.email.pass } : undefined
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await getTransporter().sendMail({
      from: config.email.from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    });
    logger.info('Email sent', { to, subject, messageId: info.messageId });
    return info;
  } catch (err) {
    logger.error('Email send failed', { to, subject, error: err.message });
    throw err;
  }
};

const emailService = {
  sendWelcomeEmail(to, name) {
    return sendEmail({
      to,
      subject: 'Welcome to LoginApp',
      html: `<h2>Welcome, ${name}!</h2><p>Your account has been created successfully.</p>`
    });
  },

  sendPasswordResetEmail(to, name, resetLink) {
    return sendEmail({
      to,
      subject: 'Password Reset Request — Employee Portal',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid #2d2d50;">
          <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Password Reset</h1>
          </div>
          <div style="padding: 32px; color: #f1f5f9;">
            <p style="font-size: 16px; margin-bottom: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #94a3b8; line-height: 1.6;">
              We received a request to reset your password for your Employee Portal account. 
              Click the button below to set a new password:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" 
                 style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #4f46e5); 
                        color: white; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px;
                        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                Reset My Password
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              This link will expire in <strong style="color: #f59e0b;">15 minutes</strong>.
              If you didn't request this, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #2d2d50; margin: 24px 0;" />
            <p style="color: #64748b; font-size: 12px;">
              If the button doesn't work, copy and paste this link:<br>
              <a href="${resetLink}" style="color: #818cf8; word-break: break-all;">${resetLink}</a>
            </p>
          </div>
          <div style="background: #0f0f1a; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">Employee Management Portal • Confidential</p>
          </div>
        </div>
      `
    });
  },

  sendLeaveApprovedEmail(to, employeeName, leaveDetails) {
    return sendEmail({
      to,
      subject: 'Leave Application Approved',
      html: `<h2>Leave Approved</h2><p>Dear ${employeeName}, your leave from ${leaveDetails.from_date} to ${leaveDetails.to_date} has been approved.</p>`
    });
  },

  sendAssetAssignedEmail(to, employeeName, assetName) {
    return sendEmail({
      to,
      subject: 'Asset Assigned',
      html: `<h2>Asset Assigned</h2><p>Dear ${employeeName}, asset <strong>${assetName}</strong> has been assigned to you.</p>`
    });
  }
};

module.exports = emailService;
