import { NextRequest, NextResponse } from "next/server";
import { saveOTP } from "@/lib/sheets";
import { sendOTPEmail } from "@/lib/email";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "missing email" }, { status: 400 });

  const code = generateOTP();
  await saveOTP(email, code);
  await sendOTPEmail(email, code);

  return NextResponse.json({ success: true });
}
