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
