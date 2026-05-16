import { NextRequest, NextResponse } from "next/server";
import { saveRating } from "@/lib/excel-db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, city, day, rating, feel_temp, direction } = body;
  if (!email || !city || !day) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  try {
    await saveRating({ email, date: new Date().toISOString().split("T")[0], city, day, rating, feel_temp, direction: direction || "" });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
