"use client";
import { useState, useEffect } from "react";

import { getSupabase } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";

// ─── LOGIC ────────────────────────────────────────────────────────────────────
function calcAge(birthdate: string) {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function calcBMI(weight: number, height_cm: number) {
  const h = height_cm / 100;
  return weight / (h * h);
}

function getOffsets(gender: string, bmi: number, age: number) {
  return {
    genderOffset: gender === "female" ? -2 : 0,
    bmiOffset: bmi < 18.5 ? -2 : bmi > 26 ? 2 : 0,
    ageOffset: age > 60 ? -1 : 0,
  };
}

function getRecommendation(feelTemp: number) {
  if (feelTemp >= 30) return { label: "חם מאוד", emoji: "☀️", clothes: "מכנסיים קצרים וחולצת טי דקה.", color: "#FF6B35", sky: ["#FF8C00","#FFB347","#FFA500"] as [string,string,string], sun: true };
  if (feelTemp >= 26) return { label: "חמים ונעים", emoji: "⛅", clothes: "מכנסיים קצרים/ארוכים דקים וחולצת טי.", color: "#F4A261", sky: ["#87CEEB","#FDB97D","#F4A261"] as [string,string,string], sun: true };
  if (feelTemp >= 21) return { label: "נעים", emoji: "🌤️", clothes: "מכנסיים ארוכים וחולצת טי. קח קרדיגן קל לצל.", color: "#2EC4B6", sky: ["#74B9FF","#0984E3","#2EC4B6"] as [string,string,string], sun: true };
  if (feelTemp >= 16) return { label: "קריר", emoji: "🌥️", clothes: "מכנסיים ארוכים, חולצה ארוכה וג׳קט קל.", color: "#74B9FF", sky: ["#636E72","#B2BEC3","#74B9FF"] as [string,string,string], sun: false };
  if (feelTemp >= 11) return { label: "קר מעט", emoji: "🌬️", clothes: "מכנסיים ארוכים, סוודר חם וג׳קט מעבר.", color: "#A29BFE", sky: ["#2D3436","#636E72","#A29BFE"] as [string,string,string], sun: false };
  return { label: "קר", emoji: "❄️", clothes: "ציוד חורף מלא: מעיל כבד, צעיף ושכבות חמות.", color: "#74B9FF", sky: ["#0F3460","#16213E","#74B9FF"] as [string,string,string], sun: false };
}

// ─── GEOLOCATION ──────────────────────────────────────────────────────────────
async function getCityFromCoords(lat: number, lon: number): Promise<string> {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=he`, {
    headers: { "User-Agent": "ThermoWear/1.0" },
  });
  const data = await res.json();
  return data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
}

async function detectCity(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("geolocation_unsupported"));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const city = await getCityFromCoords(pos.coords.latitude, pos.coords.longitude);
          resolve(city);
        } catch { reject(new Error("geocode_failed")); }
      },
      () => reject(new Error("location_denied"))
    );
  });
}

// ─── SKY ──────────────────────────────────────────────────────────────────────
function Cloud({ top, left, scale, speed, opacity }: { top: string; left: string; scale: number; speed: number; opacity: number }) {
  return (
    <div style={{ position:"absolute", top, left, opacity, animation:`drift ${speed}s linear infinite`, transform:`scale(${scale})`, transformOrigin:"left center" }}>
      <div style={{ position:"relative", width:84, height:32 }}>
        <div style={{ position:"absolute", bottom:0, left:10, width:64, height:22, borderRadius:22, background:"rgba(255,255,255,0.92)" }} />
        <div style={{ position:"absolute", bottom:10, left:22, width:38, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.92)" }} />
        <div style={{ position:"absolute", bottom:10, left:8, width:30, height:24, borderRadius:"50%", background:"rgba(255,255,255,0.88)" }} />
      </div>
    </div>
  );
}

function SkyBackground({ colors, sun }: { colors: [string,string,string]; sun: boolean }) {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", zIndex:0 }}>
      <div style={{ position:"absolute", inset:0, background:`linear-gradient(180deg,${colors[0]} 0%,${colors[1]} 55%,${colors[2]} 100%)`, transition:"background 1.2s ease" }} />
      {!sun && [1,2,3,4,5,6,7,8].map(i=>(
        <div key={i} style={{ position:"absolute", width:i%3===0?3:2, height:i%3===0?3:2, borderRadius:"50%", background:"rgba(255,255,255,0.8)", top:`${6+i*9}%`, left:`${8+i*12}%`, animation:`twinkle ${1+i*0.3}s ease-in-out infinite alternate` }} />
      ))}
      {sun && <div style={{ position:"absolute", top:20, left:28, width:60, height:60, borderRadius:"50%", background:"radial-gradient(circle,#FFE066,#FF9F1C)", boxShadow:"0 0 48px 22px rgba(255,200,50,0.4)", animation:"sunPulse 3s ease-in-out infinite" }} />}
      <Cloud top="14%" left="52%" scale={1.2} speed={32} opacity={0.88} />
      <Cloud top="30%" left="8%" scale={0.75} speed={46} opacity={0.75} />
      <Cloud top="8%" left="28%" scale={0.55} speed={58} opacity={0.65} />
    </div>
  );
}

// ─── UI HELPERS ───────────────────────────────────────────────────────────────
function SectionLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
      <span style={{ fontSize:14 }}>{icon}</span>
      <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{text}</span>
      <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
    </div>
  );
}

function FieldWrap({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:11, fontWeight:700, color:error?"#FF6B6B":"rgba(255,255,255,0.3)", letterSpacing:"0.08em", textTransform:"uppercase" }}>
        {label}{required && <span style={{ color:"#F4A261", marginRight:3 }}>*</span>}
      </label>
      {children}
      {error && <p style={{ fontSize:11, color:"#FF6B6B" }}>⚠ {error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, type="text", placeholder, unit, ltr, error, disabled }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
  unit?: string; ltr?: boolean; error?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <input
        type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        max={type==="date" ? new Date().toISOString().split("T")[0] : undefined}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{
          width:"100%", padding: unit ? "13px 14px 13px 44px" : "13px 14px",
          background:"rgba(255,255,255,0.05)",
          border:`1.5px solid ${error?"#FF6B6B": focused?"#F4A261": value?"rgba(244,162,97,0.4)":"rgba(255,255,255,0.08)"}`,
          borderRadius:12, fontSize:15, color:"#fff", fontFamily:"inherit",
          outline:"none", transition:"border-color .2s",
          direction: ltr?"ltr":"rtl", textAlign: ltr?"left":"right",
          WebkitAppearance:"none",
          opacity: disabled ? 0.5 : 1,
        }}
      />
      {unit && <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.25)", fontSize:12, pointerEvents:"none" }}>{unit}</span>}
    </div>
  );
}

function PrimaryBtn({ onClick, disabled, loading, children }: { onClick: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      width:"100%", padding:"16px", border:"none", borderRadius:14,
      background: (disabled || loading) ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#F4A261,#E85D04)",
      color: (disabled || loading) ? "rgba(255,255,255,0.35)" : "#fff",
      fontSize:16, fontWeight:800, cursor: (disabled || loading) ? "not-allowed" : "pointer",
      fontFamily:"inherit", transition:"all .25s",
      boxShadow: (disabled || loading) ? "none" : "0 8px 28px rgba(244,162,97,0.4)",
      display:"flex", alignItems:"center", justifyContent:"center", gap:12,
    }}>
      {loading ? (
        <>
          <span style={{ width:18, height:18, borderRadius:"50%", border:"2.5px solid rgba(255,255,255,0.15)", borderTopColor:"#F4A261", display:"inline-block", animation:"spin .7s linear infinite" }} />
          טוען...
        </>
      ) : children}
    </button>
  );
}

// ─── RESULT CARD ──────────────────────────────────────────────────────────────
function Chip({ label, value }: { label: string; value: number }) {
  const color = value > 0 ? "#F4A261" : value < 0 ? "#74B9FF" : "#445";
  const bg    = value > 0 ? "rgba(244,162,97,0.1)" : value < 0 ? "rgba(116,185,255,0.1)" : "rgba(255,255,255,0.03)";
  return (
    <span style={{ padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:700, color, background:bg, border:`1px solid ${color}44` }}>
      {label}: {value > 0 ? "+" : ""}{value}°
    </span>
  );
}

type WeatherResult = {
  rec: ReturnType<typeof getRecommendation>;
  feelTemp: number;
  weather: { min: number; max: number; avg: number; cityHe: string };
  dateStr: string;
  bmi: string;
  genderOffset: number;
  bmiOffset: number;
  ageOffset: number;
  age: number;
};

function ResultCard({ result, name, onReset, onCopy, copied }: { result: WeatherResult; name: string; onReset: () => void; onCopy: () => void; copied: boolean }) {
  const { rec, feelTemp, weather, dateStr, bmi, genderOffset, bmiOffset, ageOffset, age } = result;
  return (
    <div style={{ animation:"slideUp .6s cubic-bezier(.23,1,.32,1) both" }}>
      <div style={{ position:"relative", borderRadius:"24px 24px 0 0", overflow:"hidden", minHeight:230, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", padding:"0 24px 28px" }}>
        <SkyBackground colors={rec.sky} sun={rec.sun} />
        <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
          <div style={{ fontSize:54, filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.35))", animation:"float 3s ease-in-out infinite" }}>{rec.emoji}</div>
          <div style={{ fontSize:76, fontWeight:900, color:"#fff", lineHeight:1, textShadow:"0 4px 28px rgba(0,0,0,0.45)", marginTop:4 }}>{feelTemp}°</div>
          <div style={{ fontSize:16, color:"rgba(255,255,255,0.9)", fontWeight:700, textShadow:"0 2px 8px rgba(0,0,0,0.3)" }}>{rec.label}</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginTop:6 }}>{weather.cityHe} · {dateStr}</div>
        </div>
      </div>

      <div style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(12px)", padding:"12px 20px", display:"flex", justifyContent:"space-around", borderRight:`4px solid ${rec.color}` }}>
        {([["מינ׳",`${weather.min}°`],["ממוצע",`${weather.avg}°`],["מקס׳",`${weather.max}°`],["תחושה אישית",`${feelTemp}°`]] as [string,string][]).map(([l,v],i)=>(
          <div key={l} style={{ textAlign:"center" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", letterSpacing:"0.07em", textTransform:"uppercase" }}>{l}</div>
            <div style={{ fontSize:20, fontWeight:800, color: i===3 ? rec.color : "#fff" }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#0f1923", padding:"20px 22px 26px", borderRadius:"0 0 24px 24px" }}>
        <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${rec.color}44`, borderRadius:16, padding:"14px 16px", marginBottom:14 }}>
          <div style={{ fontSize:10, color:rec.color, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>👕 המלצת לבוש למחר</div>
          <div style={{ fontSize:15, color:"#f0f0f0", lineHeight:1.65, fontWeight:500 }}>{rec.clothes}</div>
        </div>

        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:14, padding:"12px 14px", marginBottom:14 }}>
          <div style={{ fontSize:10, color:"#445", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>ניתוח פיזיולוגי אישי</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
            <Chip label="מגדר" value={genderOffset} />
            <Chip label={`BMI ${parseFloat(bmi).toFixed(1)}`} value={bmiOffset} />
            <Chip label={`גיל ${age}`} value={ageOffset} />
            <span style={{ fontSize:12, color:"#556" }}>= <strong style={{ color:"#fff" }}>{feelTemp}°C</strong> תחושה</span>
          </div>
        </div>

        <div style={{ background:"#080e15", border:"1px solid #1a2535", borderRadius:14, padding:"14px 16px", marginBottom:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div style={{ fontSize:10, color:"#445", letterSpacing:"0.08em", textTransform:"uppercase" }}>📲 הודעת ערב</div>
            <button onClick={onCopy} style={{ background:"none", border:`1px solid ${copied?"#2EC4B6":"#1a2535"}`, borderRadius:8, color:copied?"#2EC4B6":"#445", fontSize:11, padding:"4px 10px", cursor:"pointer", fontFamily:"inherit", transition:"all .2s" }}>
              {copied ? "✓ הועתק" : "העתק"}
            </button>
          </div>
          <p style={{ fontSize:13, color:"#778", lineHeight:1.75, fontStyle:"italic" }}>
            "היי <strong style={{ color:"#fff" }}>{name}</strong>! מחר ב{weather.cityHe} יהיו <strong style={{ color:rec.color }}>{weather.avg}°C</strong>, אבל בשבילך זה ירגיש כמו <strong style={{ color:rec.color }}>{feelTemp}°C</strong>. ההמלצה שלנו: {rec.clothes}"
          </p>
        </div>

        <button onClick={onReset} style={{ width:"100%", padding:"13px", background:"transparent", border:"1px solid #1a2535", borderRadius:14, color:"#445", fontSize:14, cursor:"pointer", fontFamily:"inherit", transition:"all .2s" }}
          onMouseOver={e=>(e.currentTarget.style.borderColor="#2a3545")}
          onMouseOut={e=>(e.currentTarget.style.borderColor="#1a2535")}>
          ← קבל תחזית חדשה
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
type View = "auth_email" | "auth_otp" | "auth_register" | "weather";

const EMPTY_PROFILE = { name:"", phone:"", gender:"", birthdate:"", height:"", weight:"", city:"" };

export default function App() {
  const [view, setView]           = useState<View>("auth_email");
  const [email, setEmail]         = useState("");
  const [otp, setOtp]             = useState("");
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [form, setForm]           = useState(EMPTY_PROFILE);
  const [errors, setErrors]       = useState<Record<string,string>>({});
  const [loading, setLoading]     = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [result, setResult]       = useState<WeatherResult | null>(null);
  const [copied, setCopied]       = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const setF = (k: string) => (v: string) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); setGlobalError(""); };

  // Check existing session on load
  useEffect(() => {
    getSupabase().auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data: p } = await getSupabase().from("profiles").select("*").eq("id", session.user.id).single();
      if (p) { setProfile(p as Profile); setEmail((p as Profile).email); setView("weather"); }
    });
  }, []);

  // ── AUTH: send OTP ──
  async function sendOtp() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrors({ email: "מייל לא תקין" }); return; }
    setLoading(true); setGlobalError("");
    try {
      const { error } = await getSupabase().auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      if (error) throw error;
      setView("auth_otp");
    } catch (e: unknown) {
      setGlobalError(e instanceof Error ? e.message : "שגיאה בשליחת קוד");
    } finally { setLoading(false); }
  }

  // ── AUTH: verify OTP ──
  async function verifyOtp() {
    if (otp.length < 4) { setErrors({ otp: "יש להזין את הקוד שנשלח" }); return; }
    setLoading(true); setGlobalError("");
    try {
      const { data, error } = await getSupabase().auth.verifyOtp({ email, token: otp, type: "email" });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error("שגיאה בהתחברות");

      const { data: p } = await getSupabase().from("profiles").select("*").eq("id", userId).single();
      if (p) {
        setProfile(p as Profile);
        setView("weather");
      } else {
        setForm(f => ({ ...f }));
        setView("auth_register");
      }
    } catch (e: unknown) {
      setGlobalError(e instanceof Error ? e.message : "קוד שגוי, נסה שוב");
    } finally { setLoading(false); }
  }

  // ── REGISTER ──
  function validateRegister() {
    const e: Record<string,string> = {};
    if (!form.name.trim())   e.name = "שדה חובה";
    if (!form.gender)        e.gender = "יש לבחור מגדר";
    if (!form.birthdate)     e.birthdate = "שדה חובה";
    else { const a = calcAge(form.birthdate); if (a < 5 || a > 110) e.birthdate = "תאריך לא תקין"; }
    if (!form.height || +form.height < 50) e.height = "ערך לא תקין";
    if (!form.weight || +form.weight < 10) e.weight = "ערך לא תקין";
    if (!form.city.trim())   e.city = "יש להזין עיר";
    return e;
  }

  async function saveProfile() {
    const e = validateRegister();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setGlobalError("");
    try {
      const { data: { user } } = await getSupabase().auth.getUser();
      if (!user) throw new Error("לא מחובר");
      const profileData = {
        id: user.id,
        email,
        name: form.name.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        birthdate: form.birthdate,
        height: +form.height,
        weight: +form.weight,
        city: form.city.trim(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await getSupabase().from("profiles").upsert(profileData as any);
      if (error) throw error;
      setProfile(profileData as Profile);
      setView("weather");
    } catch (e: unknown) {
      setGlobalError(e instanceof Error ? e.message : "שגיאה בשמירה");
    } finally { setLoading(false); }
  }

  // ── WEATHER ──
  async function fetchWeather(city: string) {
    setLoading(true); setLoadingMsg("🔍 מחפש תחזית מזג אוויר..."); setGlobalError("");
    try {
      const res = await fetch("/api/weather", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ city }) });
      const weather = await res.json();
      if (!res.ok) throw new Error(weather.error === "city_not_found" ? `לא מצאנו את העיר "${city}"` : "שגיאה בקבלת תחזית");

      setLoadingMsg("🧮 מחשב תחושה אישית...");
      const p = profile!;
      const age = calcAge(p.birthdate);
      const bmi = calcBMI(p.weight, p.height);
      const { genderOffset, bmiOffset, ageOffset } = getOffsets(p.gender, bmi, age);
      const feelTemp = weather.avg + genderOffset + bmiOffset + ageOffset;
      const rec = getRecommendation(feelTemp);
      const tom = new Date(); tom.setDate(tom.getDate() + 1);
      const dateStr = tom.toLocaleDateString("he-IL", { weekday:"long", day:"numeric", month:"long" });
      setResult({ age, bmi: bmi.toFixed(1), genderOffset, bmiOffset, ageOffset, feelTemp, rec, weather, dateStr });
    } catch (e: unknown) {
      setGlobalError(e instanceof Error ? e.message : "שגיאה בקבלת תחזית");
    } finally { setLoading(false); setLoadingMsg(""); }
  }

  // ── GEOLOCATION ──
  async function useMyLocation(setter: (v: string) => void) {
    setLocLoading(true);
    try {
      const city = await detectCity();
      if (city) setter(city);
      else setGlobalError("לא הצלחנו לזהות את העיר מהמיקום");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "location_denied") setGlobalError("יש לאשר גישה למיקום בדפדפן");
      else if (msg === "geolocation_unsupported") setGlobalError("הדפדפן לא תומך בגיאולוקיישן");
      else setGlobalError("לא הצלחנו לאתר את מיקומך");
    } finally { setLocLoading(false); }
  }

  function signOut() {
    getSupabase().auth.signOut();
    setProfile(null); setEmail(""); setOtp(""); setResult(null);
    setForm(EMPTY_PROFILE); setView("auth_email");
  }

  const bgColors = result ? result.rec.sky : (["#1a2a4a","#0d1b2e","#2a3a5a"] as [string,string,string]);
  const bgSun    = result ? result.rec.sun : false;

  const globalStyles = `
    @keyframes slideUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes drift{from{transform:translateX(-140px)}to{transform:translateX(calc(100vw + 140px))}}
    @keyframes twinkle{from{opacity:0.2}to{opacity:1}}
    @keyframes sunPulse{0%,100%{box-shadow:0 0 40px 20px rgba(255,200,50,0.35)}50%{box-shadow:0 0 65px 30px rgba(255,200,50,0.55)}}
    *{box-sizing:border-box;margin:0;padding:0;}
    input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
    input::placeholder{color:rgba(255,255,255,0.18);}
    input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.4) sepia(1) hue-rotate(180deg);}
    ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}
  `;

  return (
    <div dir="rtl" style={{ minHeight:"100vh", fontFamily:"'Heebo', sans-serif", position:"relative", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"28px 16px 48px" }}>
      <style>{globalStyles}</style>

      {/* Sky BG */}
      <div style={{ position:"fixed", inset:0, zIndex:0 }}>
        <SkyBackground colors={bgColors} sun={bgSun} />
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }} />
      </div>

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:460 }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:22, animation:"fadeIn .5s ease both" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"7px 20px", background:"rgba(255,255,255,0.08)", backdropFilter:"blur(12px)", borderRadius:40, border:"1px solid rgba(255,255,255,0.12)", marginBottom:12 }}>
            <span style={{ fontSize:16 }}>🌡️</span>
            <span style={{ fontSize:12, fontWeight:800, letterSpacing:"0.14em", color:"rgba(255,255,255,0.8)", textTransform:"uppercase" }}>ThermoWear</span>
          </div>
          <h1 style={{ fontSize:28, fontWeight:900, color:"#fff", lineHeight:1.2, textShadow:"0 2px 20px rgba(0,0,0,0.5)" }}>
            {view === "auth_email" && "מה ללבוש מחר?"}
            {view === "auth_otp" && "הזן קוד אימות"}
            {view === "auth_register" && "ספר לנו קצת עליך"}
            {view === "weather" && (result ? `היי ${profile?.name} 👋` : `שלום ${profile?.name} 👋`)}
          </h1>
          {view === "auth_email" && <p style={{ marginTop:6, fontSize:13, color:"rgba(255,255,255,0.4)" }}>המלצת לבוש אישית לפי מזג האוויר</p>}
          {profile && view === "weather" && (
            <button onClick={signOut} style={{ marginTop:8, background:"none", border:"none", color:"rgba(255,255,255,0.25)", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
              ← התנתק
            </button>
          )}
        </div>

        {/* ── EMAIL VIEW ── */}
        {view === "auth_email" && (
          <div style={{ background:"rgba(10,18,30,0.78)", backdropFilter:"blur(22px)", borderRadius:24, border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 32px 80px rgba(0,0,0,0.55)", overflow:"hidden", animation:"slideUp .5s cubic-bezier(.23,1,.32,1) both" }}>
            <div style={{ height:3, background:"linear-gradient(90deg,#74B9FF,#F4A261,#FF6B35)" }} />
            <div style={{ padding:"28px 24px 30px", display:"flex", flexDirection:"column", gap:18 }}>
              <FieldWrap label="כתובת מייל" error={errors.email} required>
                <TextInput value={email} onChange={v=>{ setEmail(v); setErrors({}); setGlobalError(""); }} type="email" placeholder="you@example.com" ltr error={errors.email} />
              </FieldWrap>
              {globalError && <div style={{ background:"rgba(255,107,107,0.1)", border:"1px solid rgba(255,107,107,0.3)", borderRadius:12, padding:"12px 16px", fontSize:13, color:"#FF8080" }}>⚠ {globalError}</div>}
              <PrimaryBtn onClick={sendOtp} loading={loading}>שלח קוד אימות 📨</PrimaryBtn>
              <p style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,0.2)", lineHeight:1.6 }}>
                נשלח קוד חד-פעמי למייל שלך.<br />אם זו הפעם הראשונה – תמלא פרטים קצרים.
              </p>
            </div>
          </div>
        )}

        {/* ── OTP VIEW ── */}
        {view === "auth_otp" && (
          <div style={{ background:"rgba(10,18,30,0.78)", backdropFilter:"blur(22px)", borderRadius:24, border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 32px 80px rgba(0,0,0,0.55)", overflow:"hidden", animation:"slideUp .5s cubic-bezier(.23,1,.32,1) both" }}>
            <div style={{ height:3, background:"linear-gradient(90deg,#74B9FF,#F4A261,#FF6B35)" }} />
            <div style={{ padding:"28px 24px 30px", display:"flex", flexDirection:"column", gap:18 }}>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", textAlign:"center" }}>
                שלחנו קוד 6 ספרות לכתובת<br /><strong style={{ color:"#F4A261" }}>{email}</strong>
              </p>
              <FieldWrap label="קוד אימות" error={errors.otp} required>
                <TextInput value={otp} onChange={v=>{ setOtp(v); setErrors({}); setGlobalError(""); }} type="text" placeholder="123456" ltr error={errors.otp} />
              </FieldWrap>
              {globalError && <div style={{ background:"rgba(255,107,107,0.1)", border:"1px solid rgba(255,107,107,0.3)", borderRadius:12, padding:"12px 16px", fontSize:13, color:"#FF8080" }}>⚠ {globalError}</div>}
              <PrimaryBtn onClick={verifyOtp} loading={loading}>אמת והיכנס ✓</PrimaryBtn>
              <button onClick={()=>{ setView("auth_email"); setOtp(""); setGlobalError(""); }} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.25)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                ← שנה מייל
              </button>
            </div>
          </div>
        )}

        {/* ── REGISTER VIEW ── */}
        {view === "auth_register" && (
          <div style={{ background:"rgba(10,18,30,0.78)", backdropFilter:"blur(22px)", borderRadius:24, border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 32px 80px rgba(0,0,0,0.55)", overflow:"hidden", animation:"slideUp .5s cubic-bezier(.23,1,.32,1) both" }}>
            <div style={{ height:3, background:"linear-gradient(90deg,#74B9FF,#F4A261,#FF6B35)" }} />
            <div style={{ padding:"26px 24px 30px" }}>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginBottom:20, textAlign:"center" }}>פרטים אלה יישמרו לשימוש הבא</p>

              <SectionLabel icon="👤" text="פרטים אישיים" />
              <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:22 }}>
                <FieldWrap label="שם מלא" error={errors.name} required>
                  <TextInput value={form.name} onChange={setF("name")} placeholder="ישראל ישראלי" error={errors.name} />
                </FieldWrap>
                <FieldWrap label="טלפון" error={errors.phone}>
                  <TextInput value={form.phone} onChange={setF("phone")} type="tel" placeholder="050-0000000" ltr />
                </FieldWrap>
              </div>

              <div style={{ height:1, background:"rgba(255,255,255,0.06)", marginBottom:20 }} />
              <SectionLabel icon="📊" text="נתוני גוף" />
              <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:22 }}>
                <FieldWrap label="מגדר" error={errors.gender} required>
                  <div style={{ display:"flex", gap:10 }}>
                    {([["male","♂ זכר"],["female","♀ נקבה"]] as [string,string][]).map(([val,lbl])=>(
                      <button key={val} onClick={()=>setF("gender")(val)} style={{
                        flex:1, padding:"13px 0", borderRadius:12, cursor:"pointer",
                        fontSize:15, fontWeight:700, fontFamily:"inherit", border:"1.5px solid",
                        transition:"all .2s",
                        borderColor: form.gender===val ? "#F4A261" : errors.gender ? "#FF6B6B" : "rgba(255,255,255,0.08)",
                        background: form.gender===val ? "rgba(244,162,97,0.15)" : "rgba(255,255,255,0.03)",
                        color: form.gender===val ? "#F4A261" : "rgba(255,255,255,0.3)",
                      }}>{lbl}</button>
                    ))}
                  </div>
                </FieldWrap>
                <FieldWrap label="תאריך לידה" error={errors.birthdate} required>
                  <TextInput value={form.birthdate} onChange={setF("birthdate")} type="date" error={errors.birthdate} />
                </FieldWrap>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <FieldWrap label="גובה" error={errors.height} required>
                    <TextInput value={form.height} onChange={setF("height")} type="number" placeholder="170" unit='ס"מ' error={errors.height} />
                  </FieldWrap>
                  <FieldWrap label="משקל" error={errors.weight} required>
                    <TextInput value={form.weight} onChange={setF("weight")} type="number" placeholder="70" unit='ק"ג' error={errors.weight} />
                  </FieldWrap>
                </div>
              </div>

              <div style={{ height:1, background:"rgba(255,255,255,0.06)", marginBottom:20 }} />
              <SectionLabel icon="📍" text="מיקום" />
              <div style={{ marginBottom:22 }}>
                <FieldWrap label="עיר" error={errors.city} required>
                  <TextInput value={form.city} onChange={setF("city")} placeholder="תל אביב / חדרה / ירושלים..." error={errors.city} />
                </FieldWrap>
                <button onClick={()=>useMyLocation(setF("city"))} disabled={locLoading} style={{
                  marginTop:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:10, color:"rgba(255,255,255,0.4)", fontSize:12, padding:"8px 14px",
                  cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6,
                  opacity: locLoading ? 0.5 : 1,
                }}>
                  {locLoading ? "⏳ מאתר מיקום..." : "📍 זהה מיקום אוטומטית"}
                </button>
              </div>

              {globalError && <div style={{ background:"rgba(255,107,107,0.1)", border:"1px solid rgba(255,107,107,0.3)", borderRadius:12, padding:"12px 16px", marginBottom:16, fontSize:13, color:"#FF8080" }}>⚠ {globalError}</div>}
              <PrimaryBtn onClick={saveProfile} loading={loading}>שמור והמשך 🌡️</PrimaryBtn>
            </div>
          </div>
        )}

        {/* ── WEATHER VIEW ── */}
        {view === "weather" && profile && (
          result ? (
            <ResultCard result={result} name={profile.name} onReset={()=>setResult(null)} onCopy={()=>{
              const { weather, feelTemp, rec, dateStr } = result;
              navigator.clipboard.writeText(`היי ${profile.name}! מחר ${dateStr} ב${weather.cityHe} יהיו ${weather.avg}°C, אבל בשבילך זה ירגיש כמו ${feelTemp}°C. ההמלצה שלנו: ${rec.clothes}`);
              setCopied(true); setTimeout(()=>setCopied(false), 2500);
            }} copied={copied} />
          ) : (
            <div style={{ background:"rgba(10,18,30,0.78)", backdropFilter:"blur(22px)", borderRadius:24, border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 32px 80px rgba(0,0,0,0.55)", overflow:"hidden", animation:"slideUp .5s cubic-bezier(.23,1,.32,1) both" }}>
              <div style={{ height:3, background:"linear-gradient(90deg,#74B9FF,#F4A261,#FF6B35)" }} />
              <div style={{ padding:"26px 24px 30px", display:"flex", flexDirection:"column", gap:18 }}>
                <SectionLabel icon="📍" text="עיר לתחזית מחר" />
                <FieldWrap label="עיר" error={errors.city}>
                  <TextInput value={form.city || profile.city} onChange={setF("city")} placeholder={profile.city} error={errors.city} />
                </FieldWrap>
                <button onClick={()=>useMyLocation(setF("city"))} disabled={locLoading} style={{
                  background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:10, color:"rgba(255,255,255,0.4)", fontSize:12, padding:"8px 14px",
                  cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6,
                  opacity: locLoading ? 0.5 : 1,
                }}>
                  {locLoading ? "⏳ מאתר מיקום..." : "📍 זהה מיקום אוטומטית"}
                </button>
                {globalError && <div style={{ background:"rgba(255,107,107,0.1)", border:"1px solid rgba(255,107,107,0.3)", borderRadius:12, padding:"12px 16px", fontSize:13, color:"#FF8080" }}>⚠ {globalError}</div>}
                <PrimaryBtn onClick={()=>fetchWeather(form.city || profile.city)} loading={loading}>
                  {loading ? loadingMsg || "טוען..." : "קבל את ההמלצה שלי 🌡️"}
                </PrimaryBtn>
              </div>
            </div>
          )
        )}

        <p style={{ textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.1)", marginTop:16, letterSpacing:"0.06em" }}>
          מבוסס על פיזיולוגיה תרמית · תנאי חוץ בלבד
        </p>
      </div>
    </div>
  );
}
