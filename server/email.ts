import nodemailer from "nodemailer";

// Configure your SMTP settings via environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@autolytiqs.com";
const APP_URL = process.env.APP_URL || "https://autolytiqs.com";

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<boolean> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_USER) {
      console.log("SMTP not configured. Reset link:", resetUrl);
      return true; // Return true for development
    }

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset Your Password - Income Calculator",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Reset Your Password</h2>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${resetUrl}"
             style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 12px;">
            Or copy this link: ${resetUrl}
          </p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER) {
      console.log("SMTP not configured. Welcome email would be sent to:", email);
      return true;
    }

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to Income Calculator!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Welcome${name ? `, ${name}` : ""}!</h2>
          <p>Thanks for signing up for Income Calculator.</p>
          <p>You can now:</p>
          <ul>
            <li>Calculate your projected annual income</li>
            <li>See payment-to-income estimates</li>
            <li>Explore loan options by credit score</li>
          </ul>
          <a href="${APP_URL}"
             style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Open Calculator
          </a>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
}
