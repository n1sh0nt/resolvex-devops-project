const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

const baseTemplate = (title, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
    <h2 style="color: #1e3a8a;">ResolveX</h2>
    <h3 style="color: #111827;">${title}</h3>
    <div style="color: #374151; font-size: 15px; line-height: 1.6;">${bodyHtml}</div>
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
    <p style="color: #9ca3af; font-size: 12px;">ResolveX Smart Complaint Management System &mdash; College Support Portal</p>
  </div>
`;

const sendEmail = async ({ to, subject, html }) => {
  // In case SMTP isn't configured (e.g. local dev), don't crash the request flow
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn(`[emailService] SMTP not configured. Skipped email to ${to}: ${subject}`);
    return;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || 'ResolveX <no-reply@resolvex.com>',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`[emailService] Failed to send email to ${to}:`, err.message);
  }
};

const sendVerificationEmail = (to, name, verifyUrl) =>
  sendEmail({
    to,
    subject: 'Verify your ResolveX account',
    html: baseTemplate(
      'Verify your email',
      `<p>Hi ${name},</p>
       <p>Thanks for registering with ResolveX. Please verify your email address to activate your account.</p>
       <p><a href="${verifyUrl}" style="background:#1e3a8a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Verify Email</a></p>
       <p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>`
    ),
  });

const sendPasswordResetEmail = (to, name, resetUrl) =>
  sendEmail({
    to,
    subject: 'Reset your ResolveX password',
    html: baseTemplate(
      'Password reset request',
      `<p>Hi ${name},</p>
       <p>We received a request to reset your password. Click below to set a new one.</p>
       <p><a href="${resetUrl}" style="background:#1e3a8a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
       <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>`
    ),
  });

const sendComplaintStatusEmail = (to, name, ticketId, status, note) =>
  sendEmail({
    to,
    subject: `Complaint ${ticketId} update: ${status}`,
    html: baseTemplate(
      'Complaint status updated',
      `<p>Hi ${name},</p>
       <p>Your complaint <strong>${ticketId}</strong> status has been updated to <strong>${status}</strong>.</p>
       ${note ? `<p>Note: ${note}</p>` : ''}
       <p>Log in to your dashboard to view full details.</p>`
    ),
  });

const sendAssignmentEmail = (to, name, ticketId, title) =>
  sendEmail({
    to,
    subject: `New complaint assigned: ${ticketId}`,
    html: baseTemplate(
      'New complaint assigned to you',
      `<p>Hi ${name},</p>
       <p>Complaint <strong>${ticketId}</strong> - "${title}" has been assigned to you.</p>
       <p>Please log in to review and take action.</p>`
    ),
  });

const sendBroadcastEmail = (to, name, title, message) =>
  sendEmail({
    to,
    subject: title,
    html: baseTemplate(title, `<p>Hi ${name},</p><p>${message}</p>`),
  });

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendComplaintStatusEmail,
  sendAssignmentEmail,
  sendBroadcastEmail,
};
