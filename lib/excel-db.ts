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
  return wb;
}

async function saveWorkbook(wb: XLSX.WorkBook) {
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  await put(BLOB_NAME, buf, { access: "private", allowOverwrite: true });
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
  const row = data.find(r => r.email === email && r.code === code);
  return !!row && new Date(row.expires_at) > new Date();
}
