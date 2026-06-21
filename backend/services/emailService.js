// services/emailService.js
const nodemailer = require('nodemailer');

// Force send real emails by checking environment variables
const shouldSendRealEmails = process.env.ENABLE_EMAIL === 'true' || process.env.NODE_ENV === 'production';

console.log(`📧 Email mode: ${shouldSendRealEmails ? 'REAL EMAILS' : 'CONSOLE LOG (Development)'}`);

let transporter;

if (shouldSendRealEmails) {
  // Validate environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ EMAIL_USER or EMAIL_PASSWORD is missing in .env file!');
    console.error('📧 Falling back to console logging mode.');
  } else {
    try {
      console.log('📧 Configuring Gmail transporter...');
      console.log(`📧 Email User: ${process.env.EMAIL_USER}`);
      console.log(`📧 Password length: ${process.env.EMAIL_PASSWORD.length} characters`);
      
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        // Add timeout and debug options
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });

      // Verify connection immediately
      transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email transporter verification failed:', error.message);
          console.error('📧 Please check your email credentials and app password.');
          console.error('📧 Falling back to console logging mode.');
          transporter = null; // Disable transporter on failure
        } else {
          console.log('✅ Email transporter verified successfully!');
          console.log('✅ Ready to send real emails to:', process.env.EMAIL_USER);
        }
      });
    } catch (error) {
      console.error('❌ Failed to create email transporter:', error.message);
      transporter = null;
    }
  }
}

const sendOTPEmail = async (email, otp, name) => {
  console.log(`📧 Attempting to send OTP to: ${email}`);
  
  // If we're not sending real emails or transporter failed, log to console
  if (!shouldSendRealEmails || !transporter) {
    console.log('📧 ===== EMAIL OTP (Development Mode - No Email Sent) =====');
    console.log(`📧 To: ${email}`);
    console.log(`📧 OTP: ${otp}`);
    console.log(`📧 Name: ${name}`);
    console.log('📧 =================================================');
    return;
  }

  try {
    const mailOptions = {
      from: `"GyanPark" <${process.env.EMAIL_USER}>`,
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
    // This way you can still test the full flow
    return;
  }
};

module.exports = { sendOTPEmail };