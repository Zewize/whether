import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json(null);
  const user = await getUserByEmail(email);
  return NextResponse.json(user);
}
