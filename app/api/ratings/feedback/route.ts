import { NextRequest, NextResponse } from "next/server";
import { saveFeedback } from "@/lib/excel-db";

export async function POST(req: NextRequest) {
  const { email, text, rating, city, day } = await req.json();
  if (!email || !text?.trim()) return NextResponse.json({ error: "missing fields" }, { status: 400 });
  try {
    await saveFeedback({ email, text: text.trim(), rating: rating || 0, city: city || "", day: day || "" });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
