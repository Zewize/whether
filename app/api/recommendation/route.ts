import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { feel, uv, wind, weatherCode, gender, age, bmi, correction, lang, city } = await req.json();

  const isHe = lang === "he";

  const bmiLabel = bmi < 18.5
    ? (isHe ? "רזה" : "slim")
    : bmi > 26 ? (isHe ? "משקל עודף" : "overweight")
    : (isHe ? "תקין" : "normal weight");

  const correctionNote = correction > 1
    ? (isHe ? "נוטה להרגיש קר" : "tends to feel cold")
    : correction < -1 ? (isHe ? "נוטה להרגיש חם" : "tends to feel hot")
    : "";

  const weatherDesc = isHe
    ? `תחושה ${feel}°C, UV: ${uv === "high" ? "גבוה" : uv === "medium" ? "בינוני" : "נמוך"}, רוח: ${wind === "high" ? "חזקה" : wind === "medium" ? "בינונית" : "חלשה"}, קוד מזג אוויר: ${weatherCode}, עיר: ${city}`
    : `feels like ${feel}°C, UV: ${uv}, wind: ${wind}, weather code: ${weatherCode}, city: ${city}`;

  const userDesc = isHe
    ? `${gender === "female" ? "אישה" : "גבר"}, גיל ${age}, BMI ${bmiLabel}${correctionNote ? `, ${correctionNote}` : ""}`
    : `${gender === "female" ? "female" : "male"}, age ${age}, BMI ${bmiLabel}${correctionNote ? `, ${correctionNote}` : ""}`;

  const systemPrompt = isHe
    ? `אתה עוזר לבוש אישי ידידותי בעברית. בהתבסס על מזג האוויר ופרופיל המשתמש, כתוב משפט אחד עד שניים קצרים ומעשיים עם טיפ לבישה או התנהגות. התייחס ישירות למשתמש (לפי המגדר שלו). אל תפתח בברכה. ישיר, חם ותמציתי.`
    : `You are a friendly personal clothing assistant. Based on the weather and user profile, write one to two short, practical sentences with a clothing or weather tip. Address the user directly. No greeting. Direct, warm and concise.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 120,
      system: systemPrompt,
      messages: [{ role: "user", content: `${weatherDesc}\n${userDesc}` }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const inputTokens = message.usage.input_tokens;
    const outputTokens = message.usage.output_tokens;
    return NextResponse.json({ text, inputTokens, outputTokens });
  } catch (e) {
    return NextResponse.json({ text: "", error: String(e) }, { status: 500 });
  }
}
