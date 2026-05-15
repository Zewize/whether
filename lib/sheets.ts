const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL!;

async function callScript(action: string, data: Record<string, unknown> = {}) {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action, ...data }),
  });
  return res.json();
}

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

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const data = await callScript("getUser", { email });
  return data || null;
}

export async function saveUser(user: UserProfile): Promise<void> {
  await callScript("saveUser", user);
}

export async function saveOTP(email: string, code: string): Promise<void> {
  await callScript("saveOTP", { email, code });
}

export async function verifyOTP(email: string, code: string): Promise<boolean> {
  const data = await callScript("verifyOTP", { email, code });
  return data?.valid === true;
}
