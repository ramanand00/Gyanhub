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

// Send OTP Email
const sendOTPEmail = async (email, otp, name) => {
  console.log(`📧 Attempting to send OTP to: ${email}`);
  console.log(`📧 Transporter status: ${transporter ? '✅ Ready' : '❌ Not configured'}`);
  
  // If not sending real emails or transporter failed, log to console
  if (!shouldSendRealEmails || !transporter) {
    console.log('📧 ===== EMAIL OTP (Development Mode - No Email Sent) =====');
    console.log(`📧 To: ${email}`);
    console.log(`📧 OTP: ${otp}`);
    console.log(`📧 Name: ${name}`);
    console.log('📧 =================================================');
    console.log('💡 To send real emails:');
    console.log('   1. Set ENABLE_EMAIL=true in .env');
    console.log('   2. Set EMAIL_USER=your_email@gmail.com');
    console.log('   3. Set EMAIL_PASSWORD=your_app_password');
    console.log('   4. Restart the server');
    return;
  }

  try {
    const mailOptions = {
      from: `"GyanPark" <${emailUser}>`,
      to: email,
      subject: 'GyanPark - Email Verification OTP',
      html: `
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
      `,
    };

    console.log(`📧 Sending email to ${email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully!`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Response: ${info.response}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('❌ Full error:', error);
    
    // Log the OTP as fallback so testing can continue
    console.log('📧 ===== FALLBACK: OTP for testing =====');
    console.log(`📧 To: ${email}`);
    console.log(`📧 OTP: ${otp}`);
    console.log('📧 ======================================');
    
    // Don't throw error - let the user continue with the OTP from console
    return;
  }
};

// Send Password Reset Email
const sendPasswordResetEmail = async (email, name, resetLink) => {
  console.log(`📧 Sending password reset email to: ${email}`);
  console.log(`📧 Transporter status: ${transporter ? '✅ Ready' : '❌ Not configured'}`);
  
  if (!shouldSendRealEmails || !transporter) {
    console.log('📧 ===== PASSWORD RESET EMAIL (Fallback) =====');
    console.log(`📧 To: ${email}`);
    console.log(`📧 Reset Link: ${resetLink}`);
    console.log('📧 ============================================');
    return;
  }

  try {
    const mailOptions = {
      from: `"GyanPark" <${emailUser}>`,
      to: email,
      subject: 'GyanPark - Password Reset Request',
      html: `
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
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent successfully!`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    console.log('📧 ===== FALLBACK: Reset Link =====');
    console.log(`📧 To: ${email}`);
    console.log(`📧 Reset Link: ${resetLink}`);
    console.log('📧 =================================');
    return;
  }
};

// Send Password Reset Success Email
const sendPasswordResetSuccessEmail = async (email, name) => {
  console.log(`📧 Sending password reset success email to: ${email}`);
  console.log(`📧 Transporter status: ${transporter ? '✅ Ready' : '❌ Not configured'}`);
  
  if (!shouldSendRealEmails || !transporter) {
    console.log('📧 ===== PASSWORD RESET SUCCESS EMAIL (Fallback) =====');
    console.log(`📧 To: ${email}`);
    console.log('📧 ====================================================');
    return;
  }

  try {
    const mailOptions = {
      from: `"GyanPark" <${emailUser}>`,
      to: email,
      subject: '✅ GyanPark - Password Reset Successful',
      html: `
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
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset success email sent!`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending password reset success email:', error.message);
    return;
  }
};

// Export all functions
module.exports = { 
  sendOTPEmail, 
  sendPasswordResetEmail, 
  sendPasswordResetSuccessEmail 
};