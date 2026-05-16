import { NextResponse } from "next/server";
import { getAllUsers, getAllRatings } from "@/lib/excel-db";

export async function GET() {
  try {
    const [users, ratings] = await Promise.all([getAllUsers(), getAllRatings()]);
    const avgRating = ratings.length
      ? ratings.reduce((a, r) => a + (r.rating || 0), 0) / ratings.length
      : 0;
    const recentFeedbacks = ratings
      .filter(r => r.feedback && String(r.feedback).trim())
      .slice(-30)
      .reverse()
      .map(r => ({ email: r.email, rating: r.rating, feedback: r.feedback, date: r.date, city: r.city }));
    return NextResponse.json({
      userCount: users.length,
      ratingCount: ratings.length,
      avgRating: Math.round(avgRating * 10) / 10,
      tokenCostNis: 0,
      recentFeedbacks,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
