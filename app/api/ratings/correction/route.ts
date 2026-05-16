import { NextRequest, NextResponse } from "next/server";
import { getRatingCorrection } from "@/lib/excel-db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ correction: 0 });
  try {
    const correction = await getRatingCorrection(email);
    return NextResponse.json({ correction });
  } catch {
    return NextResponse.json({ correction: 0 });
  }
}
