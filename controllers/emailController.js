
import nodemailer from "nodemailer";

export const sendEmailController = async (req, res) => {
  try {
    const { to, summary, subject } = req.body || {};
    if (!to || !summary) {
      return res.status(400).json({ error: "to and summary are required" });
    }

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      return res.status(500).json({ error: "Email credentials not configured" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: { user, pass },
    });

  
    await transporter.verify();

    //  HTML Email Template
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width:600px; margin:auto; border:1px solid #eaeaea; border-radius:8px; padding:20px;">
          <h2 style="color:#2c3e50; margin-bottom:10px;">📋 Meeting Summary</h2>
          <p style="font-size:14px; color:#555;">
            Here’s a quick summary of your meeting:
          </p>

          <div style="background:#f9f9f9; padding:15px; border-radius:6px; margin:20px 0;">
            <pre style="white-space:pre-wrap; font-size:14px; margin:0;">${summary}</pre>
          </div>

          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />

          <p style="font-size:13px; color:#888;">
            Sent automatically by <strong>Meeting Assistant</strong>   
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Meeting Assistant" <${user}>`,
      to,
      subject: subject || "Meeting Summary",
      text: String(summary),
      html, 
    });

    console.log("Email sent:", info.messageId);
    res.json({ ok: true, id: info.messageId });
  } catch (err) {
    console.error("Error sending email:", err?.message || err);
    res.status(500).json({ error: err?.message || "Failed to send email" });
  }
};
