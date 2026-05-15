import { NextRequest, NextResponse } from "next/server";
import { saveOTP } from "@/lib/excel-db";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "missing email" }, { status: 400 });

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await saveOTP(email, code);
  } catch (e) {
    console.error("saveOTP failed:", e);
    return NextResponse.json({ error: "blob_error", detail: String(e) }, { status: 500 });
  }

  try {
    await sendOTPEmail(email, code);
  } catch (e) {
    console.error("sendOTPEmail failed:", e);
    return NextResponse.json({ error: "email_error", detail: String(e) }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
