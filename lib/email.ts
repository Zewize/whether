import nodemailer from "nodemailer";

function makeTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

export async function sendDailyReport({ newUsers, totalUsers, todayRatings, avgRating }: {
  newUsers: number; totalUsers: number; todayRatings: number; avgRating: number | null;
}) {
  const transporter = makeTransporter();
  const today = new Date().toLocaleDateString("he-IL", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const starsDisplay = avgRating ? `${avgRating.toFixed(1)} / 5 ${"★".repeat(Math.round(avgRating))}${"☆".repeat(5 - Math.round(avgRating))}` : "אין דירוגים היום";

  await transporter.sendMail({
    from: `What2wear <${process.env.GMAIL_USER}>`,
    to: "ofek@zewize.com",
    subject: `What2wear – דוח יומי ${today}`,
    html: `
      <div dir="rtl" style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:28px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;">
        <h2 style="color:#1e3a6e;margin:0 0 6px;font-size:20px;">What2wear – דוח יומי</h2>
        <p style="color:#64748b;margin:0 0 24px;font-size:13px;">${today}</p>

        <div style="display:flex;gap:12px;margin-bottom:24px;">
          <div style="flex:1;background:#fff;border-radius:12px;padding:16px 20px;border:1px solid #e2e8f0;text-align:center;">
            <div style="font-size:32px;font-weight:800;color:#1e3a6e;">${newUsers}</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px;">נרשמו היום</div>
          </div>
          <div style="flex:1;background:#fff;border-radius:12px;padding:16px 20px;border:1px solid #e2e8f0;text-align:center;">
            <div style="font-size:32px;font-weight:800;color:#1e3a6e;">${totalUsers}</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px;">סה"כ משתמשים</div>
          </div>
        </div>

        <div style="background:#fff;border-radius:12px;padding:16px 20px;border:1px solid #e2e8f0;margin-bottom:16px;">
          <div style="font-size:12px;color:#64748b;margin-bottom:6px;">דירוגים היום</div>
          <div style="font-size:18px;font-weight:700;color:#1e293b;">${todayRatings} דירוגים</div>
          <div style="font-size:15px;color:#f59e0b;margin-top:4px;">${starsDisplay}</div>
        </div>

        <p style="color:#94a3b8;font-size:11px;text-align:center;margin:0;">What2wear · דוח אוטומטי</p>
      </div>
    `,
  });
}

export async function sendOTPEmail(to: string, code: string, lang: "he" | "en" = "he") {
  const transporter = makeTransporter();

  const isHe = lang === "he";

  await transporter.sendMail({
    from: `What2wear 🌡️ <${process.env.GMAIL_USER}>`,
    to,
    subject: isHe ? "קוד האימות שלך – What2wear" : "Your verification code – What2wear",
    html: isHe ? `
      <div dir="rtl" style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;background:#0f1923;color:#fff;border-radius:12px;">
        <h2 style="color:#F4A261;margin:0 0 16px">🌡️ What2wear</h2>
        <p style="color:rgba(255,255,255,0.7)">קוד האימות שלך:</p>
        <div style="font-size:40px;font-weight:900;letter-spacing:14px;color:#F4A261;padding:20px;background:rgba(244,162,97,0.1);border-radius:12px;text-align:center;">${code}</div>
        <p style="color:rgba(255,255,255,0.35);font-size:12px;margin-top:16px">הקוד תקף ל-10 דקות בלבד</p>
      </div>
    ` : `
      <div dir="ltr" style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;background:#0f1923;color:#fff;border-radius:12px;">
        <h2 style="color:#F4A261;margin:0 0 16px">🌡️ What2wear</h2>
        <p style="color:rgba(255,255,255,0.7)">Your verification code:</p>
        <div style="font-size:40px;font-weight:900;letter-spacing:14px;color:#F4A261;padding:20px;background:rgba(244,162,97,0.1);border-radius:12px;text-align:center;">${code}</div>
        <p style="color:rgba(255,255,255,0.35);font-size:12px;margin-top:16px">Valid for 10 minutes only</p>
      </div>
    `,
  });
}
