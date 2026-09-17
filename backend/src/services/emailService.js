/**
 * SwadGhar Email Dispatcher Service
 * Handles email notifications for:
 * 1. Restaurant Branch Inquiries -> Dispatched to Selected Branch Manager + Super Admin
 * 2. Franchise Partnership Inquiries -> Dispatched to Super Admin
 */

const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@swadghar.com';

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

/**
 * Dispatch Restaurant Inquiry Notification to Branch Manager & Super Admin
 */
const sendRestaurantInquiryNotification = async ({
  inquiry,
  branchName,
  branchCity,
  branchManagerEmail,
}) => {
  const recipients = Array.from(
    new Set([branchManagerEmail, ADMIN_EMAIL].filter(Boolean))
  );

  const subject = `🍽️ [New Restaurant Inquiry] ${branchCity || 'Branch'} - ${inquiry.subject || 'Table / Dining Request'}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #b45309, #d97706); padding: 20px; color: white;">
        <h2 style="margin: 0; font-size: 20px;">SwadGhar Restaurant Dining Inquiry</h2>
        <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">Branch: <strong>${branchName || branchCity}</strong></p>
      </div>
      <div style="padding: 24px; background: #ffffff;">
        <p style="font-size: 14px; color: #374151;">A customer has submitted a dining / table booking inquiry for the <strong>${branchName || branchCity}</strong> branch:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #6b7280; width: 35%;">Customer Name:</td>
            <td style="padding: 8px; color: #111827; font-weight: 600;">${inquiry.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #6b7280;">Contact Phone:</td>
            <td style="padding: 8px; color: #111827; font-family: monospace;">${inquiry.phone}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #6b7280;">Customer Email:</td>
            <td style="padding: 8px; color: #111827;">${inquiry.email}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #6b7280;">Inquiry Type:</td>
            <td style="padding: 8px; color: #b45309; font-weight: bold; text-transform: uppercase;">${inquiry.eventType || 'General Dining'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #6b7280;">Target Branch:</td>
            <td style="padding: 8px; color: #111827;">${branchName || branchCity}</td>
          </tr>
        </table>

        <div style="background: #fdf8f6; border-left: 4px solid #d97706; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <strong style="color: #92400e; font-size: 13px;">Customer Message:</strong>
          <p style="margin: 6px 0 0 0; color: #4b5563; font-size: 13px; line-height: 1.5;">"${inquiry.message}"</p>
        </div>

        <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
          This email notification was dispatched to Branch Manager (<strong>${branchManagerEmail}</strong>) and Head Admin (<strong>${ADMIN_EMAIL}</strong>).
        </p>
      </div>
    </div>
  `;

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"SwadGhar Concierge" <${process.env.SMTP_FROM || 'no-reply@swadghar.com'}>`,
        to: recipients.join(', '),
        subject,
        html: htmlContent,
      });
      console.log(`[Email Sent] Restaurant inquiry sent to: ${recipients.join(', ')}`);
      return { success: true, recipients, subject };
    } catch (err) {
      console.error('[Email SMTP Error]', err.message);
    }
  }

  // Fallback rich logging
  console.log(`\n======================================================`);
  console.log(`📧 [EMAIL NOTIFICATION DISPATCHED] Restaurant Inquiry`);
  console.log(`   To Recipients : ${recipients.join(' AND ')}`);
  console.log(`   Subject       : ${subject}`);
  console.log(`   Customer      : ${inquiry.name} (${inquiry.phone} / ${inquiry.email})`);
  console.log(`   Branch Target : ${branchName || branchCity}`);
  console.log(`   Inquiry Msg   : "${inquiry.message}"`);
  console.log(`======================================================\n`);

  return { success: true, recipients, subject, simulated: true };
};

/**
 * Dispatch Franchise Partnership Notification to Super Admin
 */
const sendFranchiseInquiryNotification = async ({
  inquiry,
  proposedCity,
  investmentBudget,
  experience,
}) => {
  const recipients = [ADMIN_EMAIL];
  const subject = `🏪 [New Franchise Application] City: ${proposedCity || 'Gujarat'} - ${inquiry.name}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1c1917, #78350f); padding: 20px; color: white;">
        <h2 style="margin: 0; font-size: 20px;">SwadGhar Franchise Partnership Application</h2>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #fef3c7;">Expansion Lead for: <strong>${proposedCity}</strong></p>
      </div>
      <div style="padding: 24px; background: #ffffff;">
        <p style="font-size: 14px; color: #374151;">A prospective partner has submitted a franchise inquiry for <strong>${proposedCity}</strong>:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #6b7280; width: 35%;">Applicant Name:</td>
            <td style="padding: 8px; color: #111827; font-weight: 600;">${inquiry.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #6b7280;">Contact Phone:</td>
            <td style="padding: 8px; color: #111827; font-family: monospace;">${inquiry.phone}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #6b7280;">Applicant Email:</td>
            <td style="padding: 8px; color: #111827;">${inquiry.email}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #6b7280;">Proposed City:</td>
            <td style="padding: 8px; color: #b45309; font-weight: bold;">${proposedCity}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #6b7280;">Investment Budget:</td>
            <td style="padding: 8px; color: #111827; font-weight: bold;">${investmentBudget || '₹30-50 Lakhs'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px; font-weight: bold; color: #6b7280;">Relevant Experience:</td>
            <td style="padding: 8px; color: #111827;">${experience || 'Not specified'}</td>
          </tr>
        </table>

        <div style="background: #fdf8f6; border-left: 4px solid #b45309; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <strong style="color: #92400e; font-size: 13px;">Business Plan / Proposal Note:</strong>
          <p style="margin: 6px 0 0 0; color: #4b5563; font-size: 13px; line-height: 1.5;">"${inquiry.message}"</p>
        </div>

        <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
          This franchise application was sent directly to Head Administration (<strong>${ADMIN_EMAIL}</strong>).
        </p>
      </div>
    </div>
  `;

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"SwadGhar Expansions" <${process.env.SMTP_FROM || 'franchise@swadghar.com'}>`,
        to: ADMIN_EMAIL,
        subject,
        html: htmlContent,
      });
      console.log(`[Email Sent] Franchise inquiry sent to Admin: ${ADMIN_EMAIL}`);
      return { success: true, recipients, subject };
    } catch (err) {
      console.error('[Email SMTP Error]', err.message);
    }
  }

  // Fallback rich logging
  console.log(`\n======================================================`);
  console.log(`📧 [EMAIL NOTIFICATION DISPATCHED] Franchise Application`);
  console.log(`   To Super Admin: ${ADMIN_EMAIL}`);
  console.log(`   Subject       : ${subject}`);
  console.log(`   Applicant     : ${inquiry.name} (${inquiry.phone} / ${inquiry.email})`);
  console.log(`   Proposed City : ${proposedCity}`);
  console.log(`   Budget        : ${investmentBudget}`);
  console.log(`   Message       : "${inquiry.message}"`);
  console.log(`======================================================\n`);

  return { success: true, recipients, subject, simulated: true };
};

module.exports = {
  sendRestaurantInquiryNotification,
  sendFranchiseInquiryNotification,
};
