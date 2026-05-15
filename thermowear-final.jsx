import { useState } from "react";

// ─── LOGIC ENGINE ─────────────────────────────────────────────────────────────
function calcAge(birthdate) {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function calcBMI(weight, height_cm) {
  const h = height_cm / 100;
  return weight / (h * h);
}

function getOffsets(gender, bmi, age) {
  return {
    genderOffset: gender === "female" ? -2 : 0,
    bmiOffset: bmi < 18.5 ? -2 : bmi > 26 ? 2 : 0,
    ageOffset: age > 60 ? -1 : 0,
  };
}

function getRecommendation(feelTemp) {
  if (feelTemp >= 30) return { label: "חם מאוד", emoji: "☀️", clothes: "מכנסיים קצרים וחולצת טי דקה.", color: "#FF6B35", sky: ["#FF8C00","#FFB347","#FFA500"], sun: true };
  if (feelTemp >= 26) return { label: "חמים ונעים", emoji: "⛅", clothes: "מכנסיים קצרים/ארוכים דקים וחולצת טי.", color: "#F4A261", sky: ["#87CEEB","#FDB97D","#F4A261"], sun: true };
  if (feelTemp >= 21) return { label: "נעים", emoji: "🌤️", clothes: "מכנסיים ארוכים וחולצת טי. קח קרדיגן קל לצל.", color: "#2EC4B6", sky: ["#74B9FF","#0984E3","#2EC4B6"], sun: true };
  if (feelTemp >= 16) return { label: "קריר", emoji: "🌥️", clothes: "מכנסיים ארוכים, חולצה ארוכה וג׳קט קל.", color: "#74B9FF", sky: ["#636E72","#B2BEC3","#74B9FF"], sun: false };
  if (feelTemp >= 11) return { label: "קר מעט", emoji: "🌬️", clothes: "מכנסיים ארוכים, סוודר חם וג׳קט מעבר.", color: "#A29BFE", sky: ["#2D3436","#636E72","#A29BFE"], sun: false };
  return { label: "קר", emoji: "❄️", clothes: "ציוד חורף מלא: מעיל כבד, צעיף ושכבות חמות.", color: "#74B9FF", sky: ["#0F3460","#16213E","#74B9FF"], sun: false };
}

// ─── CLAUDE API — agentic loop with web_search ───────────────────────────────
async function fetchWeatherViaClaude(city) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const prompt = `Search for the weather forecast for "${city}" on ${dateStr}.
After searching, reply with ONLY a single-line JSON object, no markdown, no extra text:
{"min": <integer>, "max": <integer>, "city_he": "<city name in Hebrew>"}
If the city does not exist reply: {"error": "not_found"}`;

  const API = "https://api.anthropic.com/v1/messages";
  const HEADERS = { "Content-Type": "application/json", "anthropic-version": "2023-06-01" };
  const TOOLS = [{ type: "web_search_20250305", name: "web_search" }];

  let messages = [{ role: "user", content: prompt }];
  let finalData = null;

  for (let turn = 0; turn < 6; turn++) {
    const res = await fetch(API, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1024, tools: TOOLS, messages }),
    });

    if (!res.ok) throw new Error("שגיאת שרת: " + (await res.text()).slice(0, 120));

    const data = await res.json();

    if (data.stop_reason === "end_turn") { finalData = data; break; }

    if (data.stop_reason === "tool_use") {
      const toolResults = (data.content || [])
        .filter(b => b.type === "tool_use")
        .map(b => ({ type: "tool_result", tool_use_id: b.id, content: "Search executed." }));
      messages = [
        ...messages,
        { role: "assistant", content: data.content },
        { role: "user", content: toolResults },
      ];
      continue;
    }

    finalData = data;
    break;
  }

  if (!finalData) throw new Error("לא הצלחנו לקבל תחזית. נסה שנית.");

  const allText = (finalData.content || [])
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("\n");

  const matches = allText.match(/\{[^{}]+\}/g) || [];
  let parsed = null;
  for (const candidate of matches) {
    try {
      const p = JSON.parse(candidate);
      if (p.error === "not_found") throw new Error(`לא מצאנו את העיר "${city}". נסה שם עיר אחר.`);
      if (typeof p.min === "number" && typeof p.max === "number") { parsed = p; break; }
    } catch (e) { if (e.message.includes("לא מצאנו")) throw e; }
  }
  if (!parsed) throw new Error("לא הצלחנו לפענח את התחזית. נסה שנית.");

  return {
    min: parsed.min,
    max: parsed.max,
    avg: Math.round((parsed.min + parsed.max) / 2),
    cityHe: parsed.city_he || city,
  };
}

// ─── SKY + CLOUDS ─────────────────────────────────────────────────────────────
function SkyBackground({ colors, sun }) {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", zIndex:0 }}>
      <div style={{ position:"absolute", inset:0, background:`linear-gradient(180deg,${colors[0]} 0%,${colors[1]} 55%,${colors[2]} 100%)`, transition:"background 1.2s ease" }} />
      {!sun && [1,2,3,4,5,6,7,8].map(i=>(
        <div key={i} style={{ position:"absolute", width:i%3===0?3:2, height:i%3===0?3:2, borderRadius:"50%", background:"rgba(255,255,255,0.8)", top:`${6+i*9}%`, left:`${8+i*12}%`, animation:`twinkle ${1+i*0.3}s ease-in-out infinite alternate` }} />
      ))}
      {sun && <div style={{ position:"absolute", top:20, left:28, width:60, height:60, borderRadius:"50%", background:"radial-gradient(circle,#FFE066,#FF9F1C)", boxShadow:"0 0 48px 22px rgba(255,200,50,0.4)", animation:"sunPulse 3s ease-in-out infinite" }} />}
      <Cloud top="14%" left="52%" scale={1.2} speed={32} opacity={0.88} />
      <Cloud top="30%" left="8%"  scale={0.75} speed={46} opacity={0.75} />
      <Cloud top="8%"  left="28%" scale={0.55} speed={58} opacity={0.65} />
    </div>
  );
}

function Cloud({ top, left, scale, speed, opacity }) {
  return (
    <div style={{ position:"absolute", top, left, opacity, animation:`drift ${speed}s linear infinite`, transform:`scale(${scale})`, transformOrigin:"left center" }}>
      <div style={{ position:"relative", width:84, height:32 }}>
        <div style={{ position:"absolute", bottom:0, left:10, width:64, height:22, borderRadius:22, background:"rgba(255,255,255,0.92)" }} />
        <div style={{ position:"absolute", bottom:10, left:22, width:38, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.92)" }} />
        <div style={{ position:"absolute", bottom:10, left:8,  width:30, height:24, borderRadius:"50%", background:"rgba(255,255,255,0.88)" }} />
      </div>
    </div>
  );
}

// ─── RESULT ───────────────────────────────────────────────────────────────────
function ResultCard({ result, name, onReset, onCopy, copied }) {
  const { rec, feelTemp, weather, dateStr, bmi, genderOffset, bmiOffset, ageOffset, age } = result;
  return (
    <div style={{ animation:"slideUp .6s cubic-bezier(.23,1,.32,1) both" }}>
      {/* Sky hero */}
      <div style={{ position:"relative", borderRadius:"24px 24px 0 0", overflow:"hidden", minHeight:230, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", padding:"0 24px 28px" }}>
        <SkyBackground colors={rec.sky} sun={rec.sun} />
        <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
          <div style={{ fontSize:54, filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.35))", animation:"float 3s ease-in-out infinite" }}>{rec.emoji}</div>
          <div style={{ fontSize:76, fontWeight:900, color:"#fff", lineHeight:1, textShadow:"0 4px 28px rgba(0,0,0,0.45)", marginTop:4 }}>{feelTemp}°</div>
          <div style={{ fontSize:16, color:"rgba(255,255,255,0.9)", fontWeight:700, textShadow:"0 2px 8px rgba(0,0,0,0.3)" }}>{rec.label}</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginTop:6 }}>{weather.cityHe} · {dateStr}</div>
        </div>
      </div>

      {/* Temp strip */}
      <div style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(12px)", padding:"12px 20px", display:"flex", justifyContent:"space-around", borderRight:`4px solid ${rec.color}` }}>
        {[["מינ׳",`${weather.min}°`],["ממוצע",`${weather.avg}°`],["מקס׳",`${weather.max}°`],["תחושה אישית",`${feelTemp}°`]].map(([l,v],i)=>(
          <div key={l} style={{ textAlign:"center" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", letterSpacing:"0.07em", textTransform:"uppercase" }}>{l}</div>
            <div style={{ fontSize:20, fontWeight:800, color: i===3 ? rec.color : "#fff" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Info body */}
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
          onMouseOver={e=>e.currentTarget.style.borderColor="#2a3545"}
          onMouseOut={e=>e.currentTarget.style.borderColor="#1a2535"}>
          ← מלא טופס חדש
        </button>
      </div>
    </div>
  );
}

function Chip({ label, value }) {
  const color = value > 0 ? "#F4A261" : value < 0 ? "#74B9FF" : "#445";
  const bg    = value > 0 ? "rgba(244,162,97,0.1)" : value < 0 ? "rgba(116,185,255,0.1)" : "rgba(255,255,255,0.03)";
  return (
    <span style={{ padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:700, color, background:bg, border:`1px solid ${color}44` }}>
      {label}: {value > 0 ? "+" : ""}{value}°
    </span>
  );
}

// ─── FORM COMPONENTS ──────────────────────────────────────────────────────────
function SectionLabel({ icon, text }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
      <span style={{ fontSize:14 }}>{icon}</span>
      <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{text}</span>
      <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
    </div>
  );
}

function FieldWrap({ label, error, required, children }) {
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

function TextInput({ value, onChange, type="text", placeholder, unit, ltr, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <input
        type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        max={type==="date" ? new Date().toISOString().split("T")[0] : undefined}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{
          width:"100%", padding: unit ? "13px 14px 13px 44px" : "13px 14px",
          background:"rgba(255,255,255,0.05)",
          border:`1.5px solid ${error?"#FF6B6B": focused?"#F4A261": value?"rgba(244,162,97,0.4)":"rgba(255,255,255,0.08)"}`,
          borderRadius:12, fontSize:15, color:"#fff", fontFamily:"inherit",
          outline:"none", transition:"border-color .2s",
          direction: ltr?"ltr":"rtl", textAlign: ltr?"left":"right",
          WebkitAppearance:"none", MozAppearance:"textfield",
        }}
      />
      {unit && <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.25)", fontSize:12, pointerEvents:"none" }}>{unit}</span>}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const EMPTY = { name:"", email:"", phone:"", gender:"", birthdate:"", height:"", weight:"", city:"" };

export default function App() {
  const [form, setForm]           = useState(EMPTY);
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [result, setResult]       = useState(null);
  const [copied, setCopied]       = useState(false);

  const set = k => v => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); setGlobalError(""); };

  function validate() {
    const e = {};
    if (!form.name.trim())    e.name     = "שדה חובה";
    if (!form.email.trim())   e.email    = "שדה חובה";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "מייל לא תקין";
    if (!form.gender)         e.gender   = "יש לבחור מגדר";
    if (!form.birthdate)      e.birthdate = "שדה חובה";
    else { const a = calcAge(form.birthdate); if (a < 5 || a > 110) e.birthdate = "תאריך לא תקין"; }
    if (!form.height || +form.height < 50)  e.height = "ערך לא תקין";
    if (!form.weight || +form.weight < 10)  e.weight = "ערך לא תקין";
    if (!form.city.trim())    e.city     = "יש להזין עיר";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setGlobalError("");

    try {
      setLoadingMsg("🔍 מחפש תחזית מזג אוויר...");
      const weather = await fetchWeatherViaClaude(form.city);

      setLoadingMsg("🧮 מחשב תחושה אישית...");
      const age = calcAge(form.birthdate);
      const bmi = calcBMI(+form.weight, +form.height);
      const { genderOffset, bmiOffset, ageOffset } = getOffsets(form.gender, bmi, age);
      const feelTemp = weather.avg + genderOffset + bmiOffset + ageOffset;
      const rec = getRecommendation(feelTemp);

      const tom = new Date(); tom.setDate(tom.getDate() + 1);
      const dateStr = tom.toLocaleDateString("he-IL", { weekday:"long", day:"numeric", month:"long" });

      setResult({ age, bmi:bmi.toFixed(1), genderOffset, bmiOffset, ageOffset, feelTemp, rec, weather, dateStr });
    } catch(err) {
      setGlobalError(err.message || "אירעה שגיאה, נסה שוב.");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }

  function copyNotification() {
    if (!result) return;
    const { weather, feelTemp, rec, dateStr } = result;
    const msg = `היי ${form.name}! מחר ${dateStr} ב${weather.cityHe} יהיו ${weather.avg}°C, אבל בשבילך זה ירגיש כמו ${feelTemp}°C. ההמלצה שלנו: ${rec.clothes}`;
    navigator.clipboard.writeText(msg).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false), 2500); });
  }

  function reset() { setForm(EMPTY); setErrors({}); setResult(null); setGlobalError(""); }

  const bgColors = result ? result.rec.sky : ["#1a2a4a","#0d1b2e","#2a3a5a"];
  const bgSun    = result ? result.rec.sun : false;

  return (
    <div dir="rtl" style={{ minHeight:"100vh", fontFamily:"'Heebo', sans-serif", position:"relative", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"28px 16px 48px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes slideUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes drift{from{transform:translateX(-140px)}to{transform:translateX(calc(100vw + 140px))}}
        @keyframes twinkle{from{opacity:0.2}to{opacity:1}}
        @keyframes sunPulse{0%,100%{box-shadow:0 0 40px 20px rgba(255,200,50,0.35)}50%{box-shadow:0 0 65px 30px rgba(255,200,50,0.55)}}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input::placeholder{color:rgba(255,255,255,0.18);}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.4) sepia(1) hue-rotate(180deg);}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}
      `}</style>

      {/* Fixed animated sky */}
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
            {result ? `היי ${form.name} 👋` : "מה ללבוש מחר?"}
          </h1>
          {!result && <p style={{ marginTop:6, fontSize:13, color:"rgba(255,255,255,0.4)" }}>המלצת לבוש אישית לפי מזג האוויר</p>}
        </div>

        {/* RESULT or FORM */}
        {result ? (
          <ResultCard result={result} name={form.name} onReset={reset} onCopy={copyNotification} copied={copied} />
        ) : (
          <div style={{ background:"rgba(10,18,30,0.78)", backdropFilter:"blur(22px)", borderRadius:24, border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 32px 80px rgba(0,0,0,0.55)", overflow:"hidden", animation:"slideUp .5s cubic-bezier(.23,1,.32,1) both" }}>
            <div style={{ height:3, background:"linear-gradient(90deg,#74B9FF,#F4A261,#FF6B35)" }} />
            <div style={{ padding:"26px 24px 30px" }}>

              {/* Personal */}
              <SectionLabel icon="👤" text="פרטים אישיים" />
              <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:22 }}>
                <FieldWrap label="שם מלא" error={errors.name} required>
                  <TextInput value={form.name} onChange={set("name")} placeholder="ישראל ישראלי" error={errors.name} />
                </FieldWrap>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <FieldWrap label="מייל" error={errors.email} required>
                    <TextInput value={form.email} onChange={set("email")} type="email" placeholder="you@example.com" ltr error={errors.email} />
                  </FieldWrap>
                  <FieldWrap label="טלפון" error={errors.phone}>
                    <TextInput value={form.phone} onChange={set("phone")} type="tel" placeholder="050-0000000" ltr />
                  </FieldWrap>
                </div>
              </div>

              <div style={{ height:1, background:"rgba(255,255,255,0.06)", marginBottom:20 }} />

              {/* Body */}
              <SectionLabel icon="📊" text="נתוני גוף" />
              <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:22 }}>
                <FieldWrap label="מגדר" error={errors.gender} required>
                  <div style={{ display:"flex", gap:10 }}>
                    {[["male","♂ זכר"],["female","♀ נקבה"]].map(([val,lbl])=>(
                      <button key={val} onClick={()=>set("gender")(val)} style={{
                        flex:1, padding:"13px 0", borderRadius:12, cursor:"pointer",
                        fontSize:15, fontWeight:700, fontFamily:"inherit", border:"1.5px solid",
                        transition:"all .2s",
                        borderColor: form.gender===val ? "#F4A261" : errors.gender ? "#FF6B6B" : "rgba(255,255,255,0.08)",
                        background: form.gender===val ? "rgba(244,162,97,0.15)" : "rgba(255,255,255,0.03)",
                        color: form.gender===val ? "#F4A261" : "rgba(255,255,255,0.3)",
                      }}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </FieldWrap>
                <FieldWrap label="תאריך לידה" error={errors.birthdate} required>
                  <TextInput value={form.birthdate} onChange={set("birthdate")} type="date" error={errors.birthdate} />
                </FieldWrap>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <FieldWrap label="גובה" error={errors.height} required>
                    <TextInput value={form.height} onChange={set("height")} type="number" placeholder="170" unit='ס"מ' error={errors.height} />
                  </FieldWrap>
                  <FieldWrap label="משקל" error={errors.weight} required>
                    <TextInput value={form.weight} onChange={set("weight")} type="number" placeholder="70" unit='ק"ג' error={errors.weight} />
                  </FieldWrap>
                </div>
              </div>

              <div style={{ height:1, background:"rgba(255,255,255,0.06)", marginBottom:20 }} />

              {/* City */}
              <SectionLabel icon="📍" text="מיקום" />
              <div style={{ marginBottom:22 }}>
                <FieldWrap label="עיר" error={errors.city} required>
                  <TextInput value={form.city} onChange={set("city")} placeholder="תל אביב / חדרה / ירושלים..." error={errors.city} />
                </FieldWrap>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.18)", marginTop:6 }}>נשלוף תחזית מזג אוויר מחר לעיר זו</p>
              </div>

              {/* Error */}
              {globalError && (
                <div style={{ background:"rgba(255,107,107,0.1)", border:"1px solid rgba(255,107,107,0.3)", borderRadius:12, padding:"12px 16px", marginBottom:16, fontSize:13, color:"#FF8080", lineHeight:1.5 }}>
                  ⚠ {globalError}
                </div>
              )}

              {/* Submit */}
              <button onClick={handleSubmit} disabled={loading} style={{
                width:"100%", padding:"16px", border:"none", borderRadius:14,
                background: loading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#F4A261,#E85D04)",
                color: loading ? "rgba(255,255,255,0.35)" : "#fff",
                fontSize:16, fontWeight:800, cursor: loading?"not-allowed":"pointer",
                fontFamily:"inherit", transition:"all .25s",
                boxShadow: loading ? "none" : "0 8px 28px rgba(244,162,97,0.4)",
                display:"flex", alignItems:"center", justifyContent:"center", gap:12,
              }}
                onMouseOver={e=>{ if(!loading) e.currentTarget.style.transform="translateY(-1px)"; }}
                onMouseOut={e=>{ e.currentTarget.style.transform="translateY(0)"; }}
              >
                {loading ? (
                  <>
                    <span style={{ width:18, height:18, borderRadius:"50%", border:"2.5px solid rgba(255,255,255,0.15)", borderTopColor:"#F4A261", display:"inline-block", animation:"spin .7s linear infinite" }} />
                    {loadingMsg || "טוען..."}
                  </>
                ) : "קבל את ההמלצה שלי 🌡️"}
              </button>
            </div>
          </div>
        )}

        <p style={{ textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.1)", marginTop:16, letterSpacing:"0.06em" }}>
          מבוסס על פיזיולוגיה תרמית · תנאי חוץ בלבד
        </p>
      </div>
    </div>
  );
}
