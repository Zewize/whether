import * as XLSX from "xlsx";
import { put, list } from "@vercel/blob";

const BLOB_NAME = "thermowear-db.xlsx";

export type UserProfile = {
  email: string;
  name: string;
  phone: string;
  gender: string;
  birthdate: string;
  height: string;
  weight: string;
  city: string;
};

export type RatingEntry = {
  email: string;
  date: string;
  city: string;
  day: "today" | "tomorrow";
  rating: number;
  feel_temp: number;
  direction?: "too_hot" | "too_cold" | "";
  feedback?: string;
};

async function loadWorkbook(): Promise<XLSX.WorkBook> {
  try {
    const { blobs } = await list({ prefix: BLOB_NAME });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      });
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        return XLSX.read(buffer, { type: "buffer" });
      }
    }
  } catch {}
  return createEmpty();
}

function createEmpty(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["email","name","phone","gender","birthdate","height","weight","city","created_at"]]), "users");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["email","code","expires_at"]]), "otps");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["email","date","city","day","rating","feel_temp","direction","created_at"]]), "ratings");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["email","text","rating","city","day","created_at"]]), "feedbacks");
  return wb;
}

export type FeedbackEntry = { email:string; text:string; rating:number; city:string; day:string; created_at:string };

export async function saveFeedback(entry: Omit<FeedbackEntry,"created_at">) {
  const wb = await loadWorkbook();
  if (!wb.Sheets["feedbacks"]) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["email","text","rating","city","day","created_at"]]), "feedbacks");
  }
  const data = XLSX.utils.sheet_to_json<FeedbackEntry>(wb.Sheets["feedbacks"]);
  data.push({ ...entry, created_at: new Date().toISOString() });
  wb.Sheets["feedbacks"] = XLSX.utils.json_to_sheet(data);
  await saveWorkbook(wb);
}

export async function getAllFeedbacks(): Promise<FeedbackEntry[]> {
  const wb = await loadWorkbook();
  if (!wb.Sheets["feedbacks"]) return [];
  return XLSX.utils.sheet_to_json<FeedbackEntry>(wb.Sheets["feedbacks"]);
}

async function saveWorkbook(wb: XLSX.WorkBook) {
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  await put(BLOB_NAME, buf, { access: "private", allowOverwrite: true });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const wb = await loadWorkbook();
  return XLSX.utils.sheet_to_json<UserProfile>(wb.Sheets["users"]);
}

export async function getAllRatings(): Promise<RatingEntry[]> {
  const wb = await loadWorkbook();
  if (!wb.Sheets["ratings"]) return [];
  return XLSX.utils.sheet_to_json<RatingEntry>(wb.Sheets["ratings"]);
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const wb = await loadWorkbook();
  const data = XLSX.utils.sheet_to_json<UserProfile>(wb.Sheets["users"]);
  return data.find(r => r.email === email) || null;
}

export async function saveUser(user: UserProfile) {
  const wb = await loadWorkbook();
  const data = XLSX.utils.sheet_to_json<UserProfile>(wb.Sheets["users"]);
  const idx = data.findIndex(r => r.email === user.email);
  if (idx === -1) data.push(user); else data[idx] = user;
  wb.Sheets["users"] = XLSX.utils.json_to_sheet(data);
  await saveWorkbook(wb);
}

export async function saveOTP(email: string, code: string) {
  const wb = await loadWorkbook();
  const data = XLSX.utils.sheet_to_json<{ email: string; code: string; expires_at: string }>(wb.Sheets["otps"]);
  const idx = data.findIndex(r => r.email === email);
  const entry = { email, code, expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() };
  if (idx === -1) data.push(entry); else data[idx] = entry;
  wb.Sheets["otps"] = XLSX.utils.json_to_sheet(data);
  await saveWorkbook(wb);
}

export async function verifyOTP(email: string, code: string): Promise<boolean> {
  const wb = await loadWorkbook();
  const data = XLSX.utils.sheet_to_json<{ email: string; code: string; expires_at: string }>(wb.Sheets["otps"]);
  const row = data.find(r => r.email === email && String(r.code) === String(code));
  return !!row && new Date(row.expires_at) > new Date();
}

export async function saveRating(entry: RatingEntry) {
  const wb = await loadWorkbook();
  if (!wb.Sheets["ratings"]) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["email","date","city","day","rating","feel_temp","direction","created_at"]]), "ratings");
  }
  const data = XLSX.utils.sheet_to_json<RatingEntry & { created_at: string }>(wb.Sheets["ratings"]);
  const idx = data.findIndex(r => r.email === entry.email && r.date === entry.date && r.day === entry.day);
  if (idx === -1) {
    data.push({ ...entry, created_at: new Date().toISOString() });
  } else {
    data[idx] = { ...data[idx], ...entry };
  }
  wb.Sheets["ratings"] = XLSX.utils.json_to_sheet(data);
  await saveWorkbook(wb);
}

export async function getRatingCorrection(email: string): Promise<number> {
  const wb = await loadWorkbook();
  if (!wb.Sheets["ratings"]) return 0;
  const data = XLSX.utils.sheet_to_json<RatingEntry>(wb.Sheets["ratings"]);
  const withDir = data.filter(r => r.email === email && (r.direction === "too_hot" || r.direction === "too_cold")).slice(-10);
  if (!withDir.length) return 0;
  const sum = withDir.reduce((acc, r) => acc + (r.direction === "too_hot" ? 1 : -1), 0);
  return Math.max(-3, Math.min(3, Math.round(sum / withDir.length * 2)));
}
