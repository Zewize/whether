import { NextRequest, NextResponse } from "next/server";
import { saveUser } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  const user = await req.json();
  if (!user.email) return NextResponse.json({ error: "missing email" }, { status: 400 });

  await saveUser(user);
  return NextResponse.json({ success: true });
}
