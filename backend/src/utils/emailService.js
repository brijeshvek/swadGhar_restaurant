const nodemailer = require('nodemailer');

// Configure Nodemailer Transporter
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Gmail if SMTP_USER/SMTP_PASS are present without host
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return null;
};

/**
 * Send email verification code and link
 */
const sendVerificationEmail = async ({ to, name, verificationToken, otpCode }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyLink = `${clientUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(to)}`;

  const subject = 'Verify Your Email Address - SwadGhar Restaurant';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0c0a09; color: #f5f5f4; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #1c1917; border: 1px solid #292524; border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 26px; letter-spacing: 1px; }
        .content { padding: 30px 25px; }
        .otp-box { background: #0c0a09; border: 2px dashed #f59e0b; border-radius: 12px; padding: 18px; text-align: center; margin: 25px 0; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #fbbf24; font-family: monospace; }
        .btn { display: inline-block; background: #f59e0b; color: #1c1917; font-weight: bold; padding: 14px 28px; border-radius: 12px; text-decoration: none; margin: 20px 0; font-size: 14px; }
        .footer { background: #0c0a09; padding: 20px; text-align: center; font-size: 11px; color: #78716c; border-top: 1px solid #292524; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>સ્વાદઘર • SWADGHAR</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Pure Veg Traditional Heritage Dining</p>
        </div>
        <div class="content">
          <h2 style="color: #ffffff; margin-top: 0;">Namaste, ${name || 'Food Lover'}! 🙏</h2>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">
            Thank you for creating an account with <strong>SwadGhar Restaurant</strong>. Please verify your email address to unlock seamless order tracking, loyalty rewards, and fast checkout.
          </p>
          
          <div class="otp-box">
            <div style="font-size: 12px; color: #a8a29e; text-transform: uppercase; margin-bottom: 5px;">Your 6-Digit Email Verification Code</div>
            <div class="otp-code">${otpCode}</div>
            <div style="font-size: 11px; color: #78716c; margin-top: 6px;">Valid for 15 minutes</div>
          </div>

          <div style="text-align: center;">
            <p style="color: #a8a29e; font-size: 13px;">Or click the button below to verify instantly:</p>
            <a href="${verifyLink}" class="btn" target="_blank">Verify Email Address Now →</a>
          </div>

          <p style="color: #78716c; font-size: 11px; margin-top: 30px; border-top: 1px solid #292524; padding-top: 15px;">
            If you did not request this verification, please safely ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; 2026 SwadGhar Restaurant Network. Ahmedabad • Surat • Vadodara • Rajkot • Mumbai.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"SwadGhar Restaurant" <no-reply@swadghar.com>',
        to,
        subject,
        html: htmlContent,
      });
      console.log(`[Email Service] Verification email sent to ${to}`);
      return { sent: true };
    } else {
      console.log(`[Email Service - Dev Mode] Verification email for ${to}:`);
      console.log(`OTP: ${otpCode} | Link: ${verifyLink}`);
      return { sent: false, devOtp: otpCode, verifyLink };
    }
  } catch (error) {
    console.error('[Email Service Error]', error);
    return { sent: false, error: error.message, devOtp: otpCode, verifyLink };
  }
};

module.exports = {
  sendVerificationEmail,
};
