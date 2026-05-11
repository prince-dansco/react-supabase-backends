// import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// dotenv.config();

// Create transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Verify connection
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("Email service error:", error);
//   } else {
//     console.log("✅ Email service ready to send messages");
//   }
// });

// // Send email function
// export const sendEmail = async (to, subject, html) => {
//   try {
//     const info = await transporter.sendMail({
//       from: `"Your App" <${process.env.EMAIL_USER}>`,
//       to: to,
//       subject: subject,
//       html: html,
//     });
//     console.log("Email sent:", info.messageId);
//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     console.error("Email send error:", error);
//     return { success: false, error: error.message };
//   }
// };

// // Welcome email template
// export const sendWelcomeEmail = async (to, name) => {
//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2 style="color: #4285f4;">Welcome to React Supabase Backend! 🎉</h2>
//       <p>Hello <strong>${name}</strong>,</p>
//       <p>Thank you for joining our platform. We're excited to have you on board!</p>
//       <p>If you have any questions, feel free to reach out to our support team.</p>
//       <br>
//       <p>Best regards,</p>
//       <p><strong>The Team</strong></p>
//     </div>
//   `;
  
//   return await sendEmail(to, "Welcome to Our Platform!", html);
// };


// export const sendPasswordResetEmail = async (to, resetToken) => {
//   const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2 style="color: #4285f4;">Password Reset Request</h2>
//       <p>You requested to reset your password.</p>
//       <p>Click the button below to reset your password:</p>
//       <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
//         Reset Password
//       </a>
//       <p>This link will expire in 1 hour.</p>
//       <p>If you didn't request this, please ignore this email.</p>
//       <br>
//       <p>Best regards,</p>
//       <p><strong>The Team</strong></p>
//     </div>
//   `;
  
//   return await sendEmail(to, "Password Reset Request", html);
// };

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log("=== EMAIL SERVICE INITIALIZED (SMTP) ===");
console.log("SMTP User exists:", !!process.env.BREVO_USER);
console.log("SMTP Pass exists:", !!process.env.BREVO_PASS);

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,     
    pass: process.env.BREVO_PASS,     
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email service error:", error);
  } else {
    console.log("✅ Email service ready to send messages (Brevo SMTP)");
  }
});

export const sendEmail = async (to, subject, html) => {
  console.log(`📧 Attempting to send email to: ${to}`);
  
  try {
    const info = await transporter.sendMail({
      from: `"DANSCO HUB" <${process.env.BREVO_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log("✅ Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (to, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4285f4;">Welcome to Our Platform! 🎉</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>Start exploring and make the most of your experience.</p>
      <br>
      <p>Best regards,</p>
      <p><strong>The Team</strong></p>
    </div>
  `;
  return await sendEmail(to, "Welcome to Our Platform!", html);
};

// Password reset email template
export const sendPasswordResetEmail = async (to, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4285f4;">Password Reset Request</h2>
      <p>You requested to reset your password.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </div>
      <p>This link will expire in <strong>1 hour</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <br>
      <p>Best regards,</p>
      <p><strong>The Team</strong></p>
    </div>
  `;
  
  return await sendEmail(to, "Password Reset Request", html);
};