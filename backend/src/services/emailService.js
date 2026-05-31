const nodemailer = require('nodemailer');
require('dotenv').config();

const sendOtpEmail = async (email, otp) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SENDER_EMAIL } = process.env;

  // Check if credentials are empty or contain placeholder values
  const hasValidConfig = 
    SMTP_HOST && 
    SMTP_USER && 
    SMTP_PASS && 
    !SMTP_USER.includes('your_email') && 
    !SMTP_PASS.includes('your_app_password');

  if (!hasValidConfig) {
    console.log('\n=======================================');
    console.log(`[DEV MODE] OTP for ${email} is: ${otp}`);
    console.log('=======================================\n');
    return true;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: SMTP_PORT === '465',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: SENDER_EMAIL || SMTP_USER,
    to: email,
    subject: 'Your OTP Code - Project & Task Manager',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Project & Task Manager</h2>
        <p>Hello,</p>
        <p>Your verification code to log in or sign up is:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827;">${otp}</span>
        </div>
        <p>This code is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">Project & Task Manager Application</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`OTP email sent to ${email}`);
};

module.exports = { sendOtpEmail };
