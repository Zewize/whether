import { NextRequest, NextResponse } from "next/server";
import { verifyOTP, getUserByEmail } from "@/lib/excel-db";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code) return NextResponse.json({ error: "missing fields" }, { status: 400 });
  const valid = await verifyOTP(email, code);
  if (!valid) return NextResponse.json({ error: "invalid_otp" }, { status: 401 });
  const user = await getUserByEmail(email);
  return NextResponse.json({ success: true, user });
}
