import { NextRequest, NextResponse } from "next/server";

type UVLevel = "low" | "medium" | "high";
type WindLevel = "low" | "medium" | "high";

function uvLevel(index: number): UVLevel {
  if (index <= 2) return "low";
  if (index <= 5) return "medium";
  return "high";
}

function windLevel(kmh: number): WindLevel {
  if (kmh <= 20) return "low";
  if (kmh <= 40) return "medium";
  return "high";
}

export async function POST(req: NextRequest) {
  const { city } = await req.json();
  if (!city) return NextResponse.json({ error: "missing city" }, { status: 400 });

  // 1. Geocode the city (supports Hebrew names)
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=he&format=json`,
    { headers: { "User-Agent": "What2wear/1.0" } }
  );
  if (!geoRes.ok) return NextResponse.json({ error: "geocode_error" }, { status: 500 });

  const geoData = await geoRes.json();
  if (!geoData.results?.length) return NextResponse.json({ error: "city_not_found" }, { status: 404 });

  const { latitude, longitude, name } = geoData.results[0];

  // 2. Fetch weather forecast (today + tomorrow)
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&daily=temperature_2m_max,temperature_2m_min,uv_index_max,wind_speed_10m_max` +
    `&timezone=auto&forecast_days=2`,
    { headers: { "User-Agent": "What2wear/1.0" } }
  );
  if (!weatherRes.ok) return NextResponse.json({ error: "weather_error" }, { status: 500 });

  const w = await weatherRes.json();
  const d = w.daily;

  const makeDay = (i: number) => ({
    min: Math.round(d.temperature_2m_min[i]),
    max: Math.round(d.temperature_2m_max[i]),
    avg: Math.round((d.temperature_2m_min[i] + d.temperature_2m_max[i]) / 2),
    uv: uvLevel(d.uv_index_max[i] ?? 0),
    wind: windLevel(d.wind_speed_10m_max[i] ?? 0),
  });

  return NextResponse.json({
    today: makeDay(0),
    tomorrow: makeDay(1),
    cityHe: name,
  });
}
