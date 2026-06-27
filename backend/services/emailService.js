// services/emailService.js
const nodemailer = require('nodemailer');

// Check both possible variable names
const emailUser = process.env.EMAIL_USER || process.env.EMAIL;
const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

// Check if we should send real emails
const shouldSendRealEmails = process.env.ENABLE_EMAIL === 'true' || process.env.SEND_REAL_EMAILS === 'true';

console.log(`📧 Email mode: ${shouldSendRealEmails ? 'REAL EMAILS' : 'CONSOLE LOG (Development)'}`);
console.log(`📧 Email User: ${emailUser ? '✅ Set' : '❌ Not set'}`);
console.log(`📧 Email Password: ${emailPass ? '✅ Set' : '❌ Not set'}`);

let transporter;

if (shouldSendRealEmails) {
  // Validate environment variables
  if (!emailUser || !emailPass) {
    console.error('❌ EMAIL_USER or EMAIL_PASSWORD is missing in .env file!');
    console.error('📧 Please add these to your .env file:');
    console.error('   EMAIL_USER=your_email@gmail.com');
    console.error('   EMAIL_PASSWORD=your_app_password');
    console.error('📧 Falling back to console logging mode.');
  } else {
    try {
      console.log('📧 Configuring Gmail transporter...');
      console.log(`📧 Email User: ${emailUser}`);
      
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });

      // Verify connection
      transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email transporter verification failed:', error.message);
          console.error('📧 Please check your email credentials and app password.');
          console.error('📧 Make sure you are using an App Password, not your regular Gmail password.');
          console.error('📧 How to get App Password: https://support.google.com/accounts/answer/185833');
          transporter = null;
        } else {
          console.log('✅ Email transporter verified successfully!');
          console.log('✅ Ready to send real emails from:', emailUser);
        }
      });
    } catch (error) {
      console.error('❌ Failed to create email transporter:', error.message);
      transporter = null;
    }
  }
}

// ==================== GENERIC SEND EMAIL FUNCTION ====================
/**
 * Send email using the configured transporter
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @param {string} text - Plain text content (optional)
 * @returns {Promise<Object>} - Email send result
 */
const sendEmail = async (to, subject, html, text = null) => {
  console.log(`📧 Attempting to send email to: ${to}`);
  console.log(`📧 Subject: ${subject}`);
  console.log(`📧 Transporter status: ${transporter ? '✅ Ready' : '❌ Not configured'}`);
  
  // If not sending real emails or transporter failed, log to console
  if (!shouldSendRealEmails || !transporter) {
    console.log('📧 ===== EMAIL (Development Mode - No Email Sent) =====');
    console.log(`📧 To: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📧 Content: ${html ? html.substring(0, 200) + '...' : text || 'No content'}`);
    console.log('📧 =================================================');
    console.log('💡 To send real emails:');
    console.log('   1. Set ENABLE_EMAIL=true in .env');
    console.log('   2. Set EMAIL_USER=your_email@gmail.com');
    console.log('   3. Set EMAIL_PASSWORD=your_app_password');
    console.log('   4. Restart the server');
    return { success: true, message: 'Email logged (development mode)' };
  }

  try {
    const mailOptions = {
      from: `"GyanPark" <${emailUser}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || undefined,
    };

    console.log(`📧 Sending email to ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully!`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Response: ${info.response}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('❌ Full error:', error);
    
    // Log the email as fallback so testing can continue
    console.log('📧 ===== FALLBACK: Email content =====');
    console.log(`📧 To: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log('📧 ======================================');
    
    throw error;
  }
};

// ==================== SEND OTP EMAIL ====================
const sendOTPEmail = async (email, otp, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: #059669; padding: 20px; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎓 GyanPark</h1>
          <p style="color: #a7f3d0; margin: 5px 0 0 0;">Learning Platform</p>
        </div>
      </div>
      
      <div style="padding: 0 20px;">
        <h2 style="color: #1f2937; font-size: 22px;">Welcome to GyanPark! 👋</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Hello ${name},</p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Thank you for registering! Please use the following OTP to verify your email address:</p>
        
        <div style="background: #f3f4f6; padding: 25px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; margin: 25px 0; border: 2px dashed #059669; color: #059669;">
          ${otp}
        </div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            ⏰ This OTP is valid for 10 minutes.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        
        <hr style="border: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} GyanPark. All rights reserved.<br>
          Empowering Education
        </p>
      </div>
    </div>
  `;

  return await sendEmail(email, 'GyanPark - Email Verification OTP', html);
};

// ==================== SEND PASSWORD RESET EMAIL ====================
const sendPasswordResetEmail = async (email, name, resetLink) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: #059669; padding: 20px; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎓 GyanPark</h1>
          <p style="color: #a7f3d0; margin: 5px 0 0 0;">Learning Platform</p>
        </div>
      </div>
      
      <div style="padding: 0 20px;">
        <h2 style="color: #1f2937; font-size: 22px;">Password Reset Request</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Hello ${name},</p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">We received a request to reset your password for your GyanPark account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(to right, #059669, #047857); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            Reset Password
          </a>
        </div>
        
        <p style="color: #4b5563; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="color: #059669; font-size: 14px; word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 6px;">
          ${resetLink}
        </p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            ⏰ This link is valid for 1 hour.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        
        <hr style="border: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} GyanPark. All rights reserved.<br>
          Empowering Education
        </p>
      </div>
    </div>
  `;

  return await sendEmail(email, 'GyanPark - Password Reset Request', html);
};

// ==================== SEND PASSWORD RESET SUCCESS EMAIL ====================
const sendPasswordResetSuccessEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: #059669; padding: 20px; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎓 GyanPark</h1>
          <p style="color: #a7f3d0; margin: 5px 0 0 0;">Learning Platform</p>
        </div>
      </div>
      
      <div style="padding: 0 20px;">
        <h2 style="color: #1f2937; font-size: 22px;">Password Reset Successful ✅</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Hello ${name},</p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Your password has been successfully reset.</p>
        
        <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #065f46; margin: 0; font-size: 14px;">
            🔒 Your account is now secure with your new password.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">If you didn't make this change, please contact our support team immediately.</p>
        
        <hr style="border: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} GyanPark. All rights reserved.<br>
          Empowering Education
        </p>
      </div>
    </div>
  `;

  return await sendEmail(email, '✅ GyanPark - Password Reset Successful', html);
};

// ==================== SEND CONTACT CONFIRMATION EMAIL ====================
const sendContactConfirmationEmail = async (email, name, subject, category) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background: #059669; padding: 20px; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">✅ Message Received</h1>
      </div>
      
      <div style="padding: 0 20px;">
        <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">Dear ${name},</p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Thank you for contacting GyanPark support. We have received your message and will get back to you within 24 hours.
        </p>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="font-weight: bold; color: #4b5563; margin: 0 0 5px 0;">Your Message:</p>
          <p style="color: #4b5563; margin: 0; font-size: 14px;"><strong>Subject:</strong> ${subject}</p>
          <p style="color: #4b5563; margin: 10px 0 0 0; font-size: 14px;"><strong>Category:</strong> ${category}</p>
        </div>
        
        <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #065f46; margin: 0; font-size: 14px;">
            💡 In the meantime, you can check our <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/faqs" style="color: #059669; text-decoration: underline;">FAQs</a> for quick answers.
          </p>
        </div>
        
        <hr style="border: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} GyanPark. All rights reserved.<br>
          Empowering Education
        </p>
      </div>
    </div>
  `;

  return await sendEmail(email, "We've received your message - GyanPark", html);
};

// ==================== SEND CONTACT NOTIFICATION TO ADMIN ====================
const sendContactNotificationToAdmin = async (name, email, subject, message, category, userId = null) => {
  const adminEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="background: #059669; padding: 20px; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📬 New Contact Message</h1>
      </div>
      
      <div style="padding: 0 20px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4b5563; width: 120px;">Name:</td>
            <td style="padding: 8px 0; color: #1f2937;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Email:</td>
            <td style="padding: 8px 0; color: #1f2937;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Category:</td>
            <td style="padding: 8px 0; color: #1f2937;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Subject:</td>
            <td style="padding: 8px 0; color: #1f2937;">${subject}</td>
          </tr>
        </table>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="font-weight: bold; color: #4b5563; margin: 0 0 10px 0;">Message:</p>
          <p style="color: #1f2937; margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        
        ${userId ? `
          <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 10px 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #065f46; margin: 0; font-size: 14px;">
              ✅ This message was sent by a logged-in user (User ID: ${userId})
            </p>
          </div>
        ` : `
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              ℹ️ This message was sent by a guest user.
            </p>
          </div>
        `}
        
        <hr style="border: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} GyanPark. All rights reserved.<br>
          Empowering Education
        </p>
      </div>
    </div>
  `;

  return await sendEmail(
    adminEmail,
    `[GyanPark] ${category.toUpperCase()}: ${subject}`,
    html
  );
};

// Export all functions
module.exports = { 
  sendEmail,
  sendOTPEmail, 
  sendPasswordResetEmail, 
  sendPasswordResetSuccessEmail,
  sendContactConfirmationEmail,
  sendContactNotificationToAdmin
};