import { NextRequest, NextResponse } from "next/server";
import { getAllRatings } from "@/lib/excel-db";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ total: 0, avgRating: 0, streak: 0 });
  try {
    const all = await getAllRatings();
    const mine = all.filter(r => r.email === email);
    const avg = mine.length ? mine.reduce((a, r) => a + (r.rating || 0), 0) / mine.length : 0;

    // Calculate current streak (consecutive days with ratings)
    const dates = Array.from(new Set(mine.map(r => r.date))).sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      const expectedStr = expected.toISOString().split("T")[0];
      if (dates[i] === expectedStr) streak++;
      else break;
    }

    return NextResponse.json({ total: mine.length, avgRating: Math.round(avg * 10) / 10, streak });
  } catch {
    return NextResponse.json({ total: 0, avgRating: 0, streak: 0 });
  }
}
