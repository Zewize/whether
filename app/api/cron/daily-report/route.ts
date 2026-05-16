import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, getAllRatings } from "@/lib/excel-db";
import { sendDailyReport } from "@/lib/email";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];
    const [users, ratings] = await Promise.all([getAllUsers(), getAllRatings()]);

    const newUsersToday = (users as unknown as { created_at?: string }[]).filter(u =>
      u.created_at?.startsWith(today)
    ).length;

    const todayRatings = ratings.filter(r => r.date === today);
    const avgRating = todayRatings.length
      ? todayRatings.reduce((a, r) => a + (r.rating || 0), 0) / todayRatings.length
      : null;

    await sendDailyReport({
      newUsers: newUsersToday,
      totalUsers: users.length,
      todayRatings: todayRatings.length,
      avgRating,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
