import { NextResponse } from "next/server";
import { getAllUsers, getAllRatings, getAllFeedbacks } from "@/lib/excel-db";

export async function GET() {
  try {
    const [users, ratings, feedbacks] = await Promise.all([getAllUsers(), getAllRatings(), getAllFeedbacks()]);
    const avgRating = ratings.length
      ? ratings.reduce((a, r) => a + (r.rating || 0), 0) / ratings.length
      : 0;
    const recentFeedbacks = feedbacks
      .slice(-30)
      .reverse()
      .map(f => ({ email: f.email, rating: f.rating, feedback: f.text, date: f.created_at?.slice(0,10), city: f.city }));
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
