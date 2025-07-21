const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Basic sanitizer to escape HTML special characters
const sanitize = (str) =>
  String(str)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

// Email route
app.post("/api/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const cleanName = sanitize(name.trim());
  const cleanEmail = sanitize(email.trim());
  const cleanMessage = sanitize(message.trim()).replace(/\n/g, "<br/>");

  try {
    const data = await resend.emails.send({
      from: "Portfolio Website <onboarding@resend.dev>",
      to: ["cheetahmindset7@gmail.com"],
      subject: `New message from ${cleanName}`,
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; background-color: #ffffff; padding: 24px; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
          <h2 style="font-size: 22px; margin-bottom: 16px; color: #18181b;">📩 New Message from Portfolio</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="font-weight: 600; padding: 8px 0; width: 100px;">Name:</td>
              <td style="padding: 8px 0;">${cleanName}</td>
            </tr>
            <tr>
              <td style="font-weight: 600; padding: 8px 0;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${cleanEmail}" style="color: #000; text-decoration: none;">${cleanEmail}</a></td>
            </tr>
          </table>

          <div style="margin-top: 24px;">
            <div style="font-weight: 600; margin-bottom: 8px;">Message:</div>
            <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; color: #27272a;">
              ${cleanMessage}
            </div>
          </div>

          <p style="margin-top: 40px; font-size: 13px; color: #52525b;">This message was submitted through the contact form on your portfolio website.</p>
        </div>
      `,
    });

    console.log("✅ Email sent:", data);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
