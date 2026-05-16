import nodemailer from "nodemailer";

export async function sendOTPEmail(to: string, code: string, lang: "he" | "en" = "he") {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });

  const isHe = lang === "he";

  await transporter.sendMail({
    from: `ThermoWear 🌡️ <${process.env.GMAIL_USER}>`,
    to,
    subject: isHe ? "קוד האימות שלך – ThermoWear" : "Your verification code – ThermoWear",
    html: isHe ? `
      <div dir="rtl" style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;background:#0f1923;color:#fff;border-radius:12px;">
        <h2 style="color:#F4A261;margin:0 0 16px">🌡️ ThermoWear</h2>
        <p style="color:rgba(255,255,255,0.7)">קוד האימות שלך:</p>
        <div style="font-size:40px;font-weight:900;letter-spacing:14px;color:#F4A261;padding:20px;background:rgba(244,162,97,0.1);border-radius:12px;text-align:center;">${code}</div>
        <p style="color:rgba(255,255,255,0.35);font-size:12px;margin-top:16px">הקוד תקף ל-10 דקות בלבד</p>
      </div>
    ` : `
      <div dir="ltr" style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;background:#0f1923;color:#fff;border-radius:12px;">
        <h2 style="color:#F4A261;margin:0 0 16px">🌡️ ThermoWear</h2>
        <p style="color:rgba(255,255,255,0.7)">Your verification code:</p>
        <div style="font-size:40px;font-weight:900;letter-spacing:14px;color:#F4A261;padding:20px;background:rgba(244,162,97,0.1);border-radius:12px;text-align:center;">${code}</div>
        <p style="color:rgba(255,255,255,0.35);font-size:12px;margin-top:16px">Valid for 10 minutes only</p>
      </div>
    `,
  });
}
