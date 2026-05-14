

import dotenv from "dotenv";
dotenv.config();

console.log("=== EMAIL SERVICE INITIALIZED (Brevo HTTP API) ===");
console.log("BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);

export const sendEmail = async (to, subject, html) => {
  console.log(`📧 Attempting to send email to: ${to}`);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "DANSCO HUB", email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Brevo API error:", errorData);
      return { success: false, error: JSON.stringify(errorData) };
    }

    const data = await response.json();
    console.log("✅ Email sent, messageId:", data.messageId);
    return { success: true, messageId: data.messageId };

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