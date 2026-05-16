import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { city } = await req.json();
  if (!city) return NextResponse.json({ error: "missing city" }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "no api key" }, { status: 500 });

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const prompt = `Search for the weather forecast for the city "${city}" for today (${fmt(today)}) and tomorrow (${fmt(tomorrow)}).
The city name may be in Hebrew — search for it using both the Hebrew name and its English transliteration.
For example, "חדרה" → search "Hadera Israel weather", "תל אביב" → "Tel Aviv weather", etc.
After searching, reply with ONLY a single-line JSON object, no markdown, no extra text:
{"today":{"min":<integer>,"max":<integer>,"uv":"low"|"medium"|"high","wind":"low"|"medium"|"high"},"tomorrow":{"min":<integer>,"max":<integer>,"uv":"low"|"medium"|"high","wind":"low"|"medium"|"high"},"city_he":"<city name in Hebrew>"}
Only reply {"error":"not_found"} if the city genuinely does not exist anywhere in the world.`;

  const TOOLS = [{ type: "web_search_20250305", name: "web_search" }];
  let messages: { role: string; content: unknown }[] = [{ role: "user", content: prompt }];
  let finalData: { stop_reason: string; content: { type: string; text?: string; id?: string }[] } | null = null;

  for (let turn = 0; turn < 6; turn++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "x-api-key": apiKey },
      body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 1024, tools: TOOLS, messages }),
    });

    if (!res.ok) {
      const errText = await res.text();
      let errJson: { error?: { type?: string } } = {};
      try { errJson = JSON.parse(errText); } catch {}
      if (errJson?.error?.type === "rate_limit_error") {
        return NextResponse.json({ error: "rate_limit" }, { status: 429 });
      }
      return NextResponse.json({ error: "anthropic error", detail: errText.slice(0, 120) }, { status: 500 });
    }
    const data = await res.json();

    if (data.stop_reason === "end_turn") { finalData = data; break; }

    if (data.stop_reason === "tool_use") {
      const toolResults = (data.content || [])
        .filter((b: { type: string }) => b.type === "tool_use")
        .map((b: { id: string }) => ({ type: "tool_result", tool_use_id: b.id, content: "Search executed." }));
      messages = [...messages, { role: "assistant", content: data.content }, { role: "user", content: toolResults }];
      continue;
    }

    finalData = data; break;
  }

  if (!finalData) return NextResponse.json({ error: "no response" }, { status: 500 });

  const allText = (finalData.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");

  const matches = allText.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g) || [];
  for (const candidate of matches) {
    try {
      const p = JSON.parse(candidate);
      if (p.error === "not_found") return NextResponse.json({ error: "city_not_found" }, { status: 404 });
      if (p.today?.min !== undefined && p.tomorrow?.min !== undefined) {
        const toDay = { min: p.today.min, max: p.today.max, avg: Math.round((p.today.min + p.today.max) / 2), uv: p.today.uv || "medium", wind: p.today.wind || "medium" };
        const toMorrow = { min: p.tomorrow.min, max: p.tomorrow.max, avg: Math.round((p.tomorrow.min + p.tomorrow.max) / 2), uv: p.tomorrow.uv || "medium", wind: p.tomorrow.wind || "medium" };
        return NextResponse.json({ today: toDay, tomorrow: toMorrow, cityHe: p.city_he || city });
      }
    } catch {}
  }

  return NextResponse.json({ error: "parse_error" }, { status: 500 });
}
