import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/excel-db";

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
