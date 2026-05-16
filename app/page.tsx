"use client";
import { useState, useEffect } from "react";
import type { UserProfile } from "@/lib/excel-db";

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
type Lang = "he" | "en";
const TR = {
  he: {
    appName:"What2wear", tagline:"המלצת לבוש מותאמת אישית",
    whatToWear:"מה ללבוש?", enterOtp:"קוד אימות", register:"פרטים אישיים",
    hello:(n:string)=>`שלום, ${n}`,
    emailLabel:"כתובת מייל", emailPlaceholder:"you@example.com", invalidEmail:"כתובת מייל לא תקינה",
    sendOtp:"שלח קוד אימות",
    codeSentTo:"שלחנו קוד ל-", otpLabel:"קוד אימות (6 ספרות)", otpPlaceholder:"123456",
    otpRequired:"יש להזין את הקוד שנשלח", verifyBtn:"אמת כניסה", changeEmail:"שנה כתובת מייל",
    otpHint:"הקוד תקף ל-10 דקות", firstTimeHint:"פעם ראשונה? תמלא פרטים קצרים אחרי האימות.",
    savedHint:"הפרטים ישמרו לשימוש הבא",
    personalInfo:"פרטים אישיים", fullName:"שם מלא", namePlaceholder:"ישראל ישראלי", nameRequired:"שדה חובה",
    phone:"טלפון", phonePlaceholder:"050-0000000",
    bodyData:"נתוני גוף", gender:"מגדר", male:"זכר", female:"נקבה", genderRequired:"יש לבחור מגדר",
    birthdate:"תאריך לידה", birthdateRequired:"שדה חובה", invalidDate:"תאריך לא תקין",
    height:"גובה", heightUnit:"ס\"מ", heightInvalid:"ערך לא תקין",
    weight:"משקל", weightUnit:"ק\"ג", weightInvalid:"ערך לא תקין",
    locationSection:"מיקום", city:"עיר", cityPlaceholder:"תל אביב / ירושלים", cityRequired:"יש להזין עיר",
    detectLocation:"זהה מיקום אוטומטית", detecting:"מאתר מיקום...",
    saveBtn:"שמור והמשך", getRecommendation:"קבל המלצה",
    loading:"טוען...", searching:"מאחזר תחזית מזג אוויר...", calculating:"מחשב תחושה אישית...",
    signOut:"התנתק", changeCity:"שנה עיר לתחזית", cityForForecast:"עיר לתחזית",
    todayTab:"היום", tomorrowTab:"מחר",
    clothingRec:"המלצת לבוש", uvIndex:"UV", wind:"רוח",
    low:"נמוך", medium:"בינוני", high:"גבוה",
    pants:"מכנסיים", pantsShort:"קצרים", pantsLong:"ארוכים",
    shoes:"נעליים", shoesOpen:"פתוחות", shoesClosed:"סגורות",
    shirt:"חולצה", shirtShort:"קצרה", shirtLong:"ארוכה",
    outerLight:"עליונית דקה", outerCoat:"מעיל",
    accessories:"כובע צמר וכפפות",
    min:"מינ׳", avg:"ממוצע", max:"מקס׳", feel:"תחושה",
    rateTitle:"דרג את ההמלצה", rateSaved:"תודה על הדירוג",
    profileMenu:"פרופיל", editProfile:"ערוך פרטים", saveProfile:"שמור", cancelEdit:"ביטול",
    profileUpdated:"הפרופיל עודכן",
    locationDenied:"יש לאשר גישה למיקום בדפדפן", locationFailed:"לא הצלחנו לאתר מיקום",
    cityNotFound:(c:string)=>`העיר "${c}" לא נמצאה`,
    weatherError:"שגיאה בקבלת תחזית", saveError:"שגיאה בשמירה",
    otpError:"קוד שגוי, נסה שוב", sendError:"שגיאה בשליחת קוד",
    footer:"מותאם אישית לפי פרופיל גוף",
    recLabels:{ hot:"חם מאוד", warm:"חמים", pleasant:"נעים", cool:"קריר", chilly:"קר מעט", cold:"קר" },
  },
  en: {
    appName:"What2wear", tagline:"Personalized clothing recommendations",
    whatToWear:"What to wear?", enterOtp:"Verification", register:"Personal details",
    hello:(n:string)=>`Hello, ${n}`,
    emailLabel:"Email address", emailPlaceholder:"you@example.com", invalidEmail:"Invalid email address",
    sendOtp:"Send verification code",
    codeSentTo:"We sent a code to ", otpLabel:"Verification code (6 digits)", otpPlaceholder:"123456",
    otpRequired:"Please enter the code sent to you", verifyBtn:"Verify & Login", changeEmail:"Change email",
    otpHint:"Code valid for 10 minutes", firstTimeHint:"First time? You'll fill in details after verification.",
    savedHint:"These details will be saved for next time",
    personalInfo:"Personal details", fullName:"Full name", namePlaceholder:"John Doe", nameRequired:"Required",
    phone:"Phone", phonePlaceholder:"+1-555-0000",
    bodyData:"Body data", gender:"Gender", male:"Male", female:"Female", genderRequired:"Please select a gender",
    birthdate:"Date of birth", birthdateRequired:"Required", invalidDate:"Invalid date",
    height:"Height", heightUnit:"cm", heightInvalid:"Invalid value",
    weight:"Weight", weightUnit:"kg", weightInvalid:"Invalid value",
    locationSection:"Location", city:"City", cityPlaceholder:"New York / London", cityRequired:"Please enter a city",
    detectLocation:"Detect my location", detecting:"Detecting...",
    saveBtn:"Save & Continue", getRecommendation:"Get recommendation",
    loading:"Loading...", searching:"Fetching weather forecast...", calculating:"Calculating personal feel...",
    signOut:"Sign out", changeCity:"Change city", cityForForecast:"City for forecast",
    todayTab:"Today", tomorrowTab:"Tomorrow",
    clothingRec:"Clothing", uvIndex:"UV", wind:"Wind",
    low:"Low", medium:"Med", high:"High",
    pants:"Pants", pantsShort:"Short", pantsLong:"Long",
    shoes:"Shoes", shoesOpen:"Open", shoesClosed:"Closed",
    shirt:"Shirt", shirtShort:"Short sleeve", shirtLong:"Long sleeve",
    outerLight:"Light jacket", outerCoat:"Coat",
    accessories:"Wool hat & gloves",
    min:"Min", avg:"Avg", max:"Max", feel:"Feel",
    rateTitle:"Rate this recommendation", rateSaved:"Thanks for the rating",
    profileMenu:"Profile", editProfile:"Edit details", saveProfile:"Save", cancelEdit:"Cancel",
    profileUpdated:"Profile updated",
    locationDenied:"Please allow location access in your browser", locationFailed:"Could not detect location",
    cityNotFound:(c:string)=>`City "${c}" not found`,
    weatherError:"Error fetching forecast", saveError:"Error saving",
    otpError:"Wrong code, try again", sendError:"Error sending code",
    footer:"Personalized to your body profile",
    recLabels:{ hot:"Very Hot", warm:"Warm", pleasant:"Pleasant", cool:"Cool", chilly:"Chilly", cold:"Cold" },
  },
};

// ─── LOGIC ────────────────────────────────────────────────────────────────────
function calcAge(birthdate: string) {
  const today = new Date(); const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
function calcBMI(weight: number, h: number) { const hm = h/100; return weight/(hm*hm); }
function getOffsets(gender: string, bmi: number, age: number) {
  return { genderOffset: gender==="female"?-2:0, bmiOffset: bmi<18.5?-2:bmi>26?2:0, ageOffset: age>60?-1:0 };
}

function getTempColor(feel: number): string {
  if (feel>=28) return "#E8734A";
  if (feel>=22) return "#F0A850";
  if (feel>=17) return "#4ECDC4";
  if (feel>=12) return "#4A90E2";
  return "#7B8CDE";
}
function getConditionLabel(feel: number, lang: Lang): string {
  const L = TR[lang].recLabels;
  if (feel>=28) return L.hot;
  if (feel>=22) return L.warm;
  if (feel>=17) return L.pleasant;
  if (feel>=12) return L.cool;
  if (feel>=7) return L.chilly;
  return L.cold;
}

type ClothingItems = { pants:"long"|"short"; shoes:"closed"|"open"; shirt:"long"|"short"; outer:"coat"|"light"|null; accessories:boolean };
function getClothingItems(feel: number): ClothingItems {
  return {
    pants: feel>=24?"short":"long",
    shoes: feel>=26?"open":"closed",
    shirt: feel>=22?"short":"long",
    outer: feel>=22?null:feel>=14?"light":"coat",
    accessories: feel<=8,
  };
}

// ─── GEOLOCATION ──────────────────────────────────────────────────────────────
async function getCityFromCoords(lat: number, lon: number): Promise<string> {
  const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=he`, { headers:{"User-Agent":"What2wear/1.0"} });
  const d = await r.json();
  return d.address?.city||d.address?.town||d.address?.village||d.address?.county||"";
}
async function detectCity(): Promise<string> {
  return new Promise((resolve,reject)=>{
    if (!navigator.geolocation) return reject(new Error("geolocation_unsupported"));
    navigator.geolocation.getCurrentPosition(
      async pos=>{ try{resolve(await getCityFromCoords(pos.coords.latitude,pos.coords.longitude))}catch{reject(new Error("geocode_failed"))} },
      ()=>reject(new Error("location_denied"))
    );
  });
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const G = {
  glass: { background:"rgba(255,255,255,0.05)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.09)" } as React.CSSProperties,
  glassDark: { background:"rgba(0,0,0,0.25)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.06)" } as React.CSSProperties,
  label: { fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" as const, color:"rgba(255,255,255,0.3)" },
  divider: { height:1, background:"rgba(255,255,255,0.06)", margin:"20px 0" } as React.CSSProperties,
};

// ─── BASE UI ──────────────────────────────────────────────────────────────────
function GlassCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ ...G.glass, borderRadius:24, overflow:"hidden", animation:"fadeUp .45s cubic-bezier(.23,1,.32,1) both", ...style }}>
      <div style={{ padding:"28px 26px 32px" }}>{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ ...G.label, marginBottom:10 }}>{children}</div>;
}

function FieldGroup({ label, error, required, children }: { label:string; error?:string; required?:boolean; children:React.ReactNode }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ ...G.label, color: error?"#FF6B6B":"rgba(255,255,255,0.3)" }}>
        {label}{required&&<span style={{ color:"#F0A850", marginRight:3 }}>*</span>}
      </div>
      {children}
      {error&&<div style={{ fontSize:11, color:"#FF6B6B", marginTop:2 }}>{error}</div>}
    </div>
  );
}

function Input({ value, onChange, type="text", placeholder, unit, ltr, error }: {
  value:string; onChange:(v:string)=>void; type?:string; placeholder?:string; unit?:string; ltr?:boolean; error?:string;
}) {
  const [f,setF]=useState(false);
  return (
    <div style={{ position:"relative" }}>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        max={type==="date"?new Date().toISOString().split("T")[0]:undefined}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{ width:"100%", padding: unit?"12px 14px 12px 40px":"12px 14px",
          background: f?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.03)",
          border:`1px solid ${error?"rgba(255,107,107,0.6)":f?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.07)"}`,
          borderRadius:12, fontSize:14, color:"#fff", fontFamily:"inherit", outline:"none", transition:"all .2s",
          direction:ltr?"ltr":"rtl", textAlign:ltr?"left":"right", WebkitAppearance:"none", boxSizing:"border-box" as const }}
      />
      {unit&&<span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.2)", fontSize:11 }}>{unit}</span>}
    </div>
  );
}

function Btn({ onClick, loading, disabled, children, variant="primary", size="md" }: {
  onClick:()=>void; loading?:boolean; disabled?:boolean; children:React.ReactNode; variant?:"primary"|"ghost"|"outline"; size?:"md"|"sm";
}) {
  const pad = size==="sm" ? "9px 16px" : "14px 20px";
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: loading||disabled?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.12)", color: loading||disabled?"rgba(255,255,255,0.3)":"#fff", border:"1px solid rgba(255,255,255,0.15)" },
    ghost: { background:"transparent", color:"rgba(255,255,255,0.35)", border:"none" },
    outline: { background:"transparent", color:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.12)" },
  };
  return (
    <button onClick={onClick} disabled={loading||disabled} style={{ ...styles[variant], width: size==="sm"?"auto":"100%", padding:pad, borderRadius:12, fontSize: size==="sm"?12:14, fontWeight:600, cursor:loading||disabled?"not-allowed":"pointer", fontFamily:"inherit", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8, letterSpacing:"0.02em" }}>
      {loading?<><span style={{ width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.15)",borderTopColor:"rgba(255,255,255,0.6)",display:"inline-block",animation:"spin .7s linear infinite" }}/>טוען</>:children}
    </button>
  );
}

function ErrorMsg({ children }: { children:React.ReactNode }) {
  return <div style={{ background:"rgba(255,80,80,0.08)", border:"1px solid rgba(255,80,80,0.2)", borderRadius:10, padding:"10px 14px", fontSize:13, color:"rgba(255,130,130,0.9)" }}>{children}</div>;
}

function Divider() { return <div style={G.divider} />; }

// ─── CLOTHING DISPLAY ─────────────────────────────────────────────────────────
function ClothingRow({ label, value }: { label:string; value?:string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ fontSize:13, color:"rgba(255,255,255,0.55)", fontWeight:400 }}>{label}</span>
      {value&&<span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.85)", background:"rgba(255,255,255,0.07)", padding:"3px 10px", borderRadius:20 }}>{value}</span>}
    </div>
  );
}

function ClothingDisplay({ items, lang }: { items:ClothingItems; lang:Lang }) {
  const t=TR[lang];
  return (
    <div>
      <ClothingRow label={t.pants} value={items.pants==="short"?t.pantsShort:t.pantsLong}/>
      <ClothingRow label={t.shoes} value={items.shoes==="open"?t.shoesOpen:t.shoesClosed}/>
      <ClothingRow label={t.shirt} value={items.shirt==="short"?t.shirtShort:t.shirtLong}/>
      {items.outer&&<ClothingRow label={items.outer==="coat"?t.outerCoat:t.outerLight}/>}
      {items.accessories&&<ClothingRow label={t.accessories}/>}
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
function LevelBadge({ label, level, lang }: { label:string; level:"low"|"medium"|"high"; lang:Lang }) {
  const t=TR[lang];
  const colors = { low:"rgba(78,205,196,0.8)", medium:"rgba(240,168,80,0.8)", high:"rgba(232,115,74,0.8)" };
  const bgs = { low:"rgba(78,205,196,0.1)", medium:"rgba(240,168,80,0.1)", high:"rgba(232,115,74,0.1)" };
  const txt = level==="low"?t.low:level==="medium"?t.medium:t.high;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px", borderRadius:20, background:bgs[level], border:`1px solid ${colors[level]}33` }}>
      <div style={{ width:5, height:5, borderRadius:"50%", background:colors[level], flexShrink:0 }}/>
      <span style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.45)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:700, color:colors[level] }}>{txt}</span>
    </div>
  );
}

// ─── STAR RATING ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange, saved }: { value:number; onChange:(v:number)=>void; saved:boolean }) {
  const [hover,setHover]=useState(0);
  return (
    <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
      {[1,2,3,4,5].map(s=>(
        <button key={s} onClick={()=>!saved&&onChange(s)} onMouseEnter={()=>!saved&&setHover(s)} onMouseLeave={()=>setHover(0)}
          style={{ background:"none", border:"none", fontSize:22, cursor:saved?"default":"pointer", transition:"all .15s", color:(hover||value)>=s?"#F0A850":"rgba(255,255,255,0.15)", transform:(hover||value)>=s?"scale(1.15)":"scale(1)" }}>
          {(hover||value)>=s?"★":"★"}
        </button>
      ))}
    </div>
  );
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
type DayWeather = { min:number; max:number; avg:number; uv:"low"|"medium"|"high"; wind:"low"|"medium"|"high" };
type WeatherResult = {
  today:DayWeather; tomorrow:DayWeather; cityHe:string;
  todayFeel:number; tomorrowFeel:number;
  todayDateStr:string; tomorrowDateStr:string;
};

// ─── RESULT CARD ──────────────────────────────────────────────────────────────
function ResultCard({ result, onChangCity, lang, email, onRateSubmit }: {
  result:WeatherResult; onChangCity:()=>void; lang:Lang; email:string; onRateSubmit:(d:"today"|"tomorrow",r:number)=>void;
}) {
  const t=TR[lang];
  const [activeDay,setActiveDay]=useState<"today"|"tomorrow">("today");
  const [ratings,setRatings]=useState<{today?:number;tomorrow?:number}>({});
  const [rateSaved,setRateSaved]=useState<{today?:boolean;tomorrow?:boolean}>({});
  const [ratingDir,setRatingDir]=useState<{today?:string;tomorrow?:string}>({});

  const dayData = activeDay==="today"?result.today:result.tomorrow;
  const feel = activeDay==="today"?result.todayFeel:result.tomorrowFeel;
  const dateStr = activeDay==="today"?result.todayDateStr:result.tomorrowDateStr;
  const color = getTempColor(feel);
  const clothing = getClothingItems(feel);

  async function submitRating(v:number) {
    setRatings(r=>({...r,[activeDay]:v}));
    setRateSaved(s=>({...s,[activeDay]:true}));
    try {
      await fetch("/api/ratings/save",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,city:result.cityHe,day:activeDay,rating:v,feel_temp:feel,direction:""})});
      onRateSubmit(activeDay,v);
    } catch {}
  }
  async function submitDirection(dir:"too_hot"|"too_cold") {
    setRatingDir(d=>({...d,[activeDay]:dir}));
    try {
      await fetch("/api/ratings/save",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,city:result.cityHe,day:activeDay,rating:ratings[activeDay],feel_temp:feel,direction:dir})});
    } catch {}
  }

  return (
    <div style={{ animation:"fadeUp .45s cubic-bezier(.23,1,.32,1) both" }}>
      {/* Day tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:12, ...G.glass, borderRadius:14, padding:4 }}>
        {(["today","tomorrow"] as const).map(d=>(
          <button key={d} onClick={()=>setActiveDay(d)} style={{ flex:1, padding:"9px", border:"none", borderRadius:10, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, transition:"all .2s", letterSpacing:"0.02em",
            background: activeDay===d?"rgba(255,255,255,0.1)":"transparent",
            color: activeDay===d?"#fff":"rgba(255,255,255,0.35)" }}>
            {d==="today"?t.todayTab:t.tomorrowTab}
          </button>
        ))}
      </div>

      {/* Main temperature card */}
      <div style={{ ...G.glass, borderRadius:24, marginBottom:8, overflow:"hidden" }}>
        {/* Accent line based on temp */}
        <div style={{ height:2, background:`linear-gradient(90deg, transparent, ${color}, transparent)` }}/>
        <div style={{ padding:"28px 26px 24px" }}>
          {/* City + date */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div>
              <div style={{ fontSize:16, fontWeight:600, color:"#fff", letterSpacing:"-0.01em" }}>{result.cityHe}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{dateStr}</div>
            </div>
            <div style={{ textAlign:"end" }}>
              <div style={{ ...G.label, marginBottom:2 }}>{t.feel}</div>
              <div style={{ fontSize:13, fontWeight:700, color }}>{feel}°</div>
            </div>
          </div>

          {/* Big temperature */}
          <div style={{ display:"flex", alignItems:"flex-end", gap:16, marginBottom:20 }}>
            <div style={{ fontSize:88, fontWeight:200, color:"#fff", lineHeight:1, letterSpacing:"-0.04em" }}>{dayData.avg}°</div>
            <div style={{ paddingBottom:10 }}>
              <div style={{ fontSize:15, fontWeight:500, color:"rgba(255,255,255,0.7)", marginBottom:4 }}>{getConditionLabel(feel,lang)}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>{dayData.min}° – {dayData.max}°</div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:"flex", gap:0, borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,0.06)" }}>
            {([["min",`${dayData.min}°`],["avg",`${dayData.avg}°`],["max",`${dayData.max}°`],["feel",`${feel}°`]] as [keyof typeof t, string][]).map(([k,v],i)=>(
              <div key={k} style={{ flex:1, padding:"10px 0", textAlign:"center", background: i===3?`${color}15`:"transparent", borderLeft: i>0?"1px solid rgba(255,255,255,0.06)":undefined }}>
                <div style={{ ...G.label, marginBottom:4 }}>{t[k] as string}</div>
                <div style={{ fontSize:16, fontWeight:600, color: i===3?color:"rgba(255,255,255,0.85)" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details card */}
      <div style={{ ...G.glass, borderRadius:24, marginBottom:8, overflow:"hidden" }}>
        <div style={{ padding:"22px 26px 24px" }}>
          {/* UV + Wind */}
          <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" as const }}>
            <LevelBadge label={t.uvIndex} level={dayData.uv} lang={lang}/>
            <LevelBadge label={t.wind} level={dayData.wind} lang={lang}/>
          </div>

          {/* Clothing */}
          <Label>{t.clothingRec}</Label>
          <ClothingDisplay items={clothing} lang={lang}/>
        </div>
      </div>

      {/* Rating card */}
      <div style={{ ...G.glass, borderRadius:24, marginBottom:8, overflow:"hidden" }}>
        <div style={{ padding:"18px 26px 20px" }}>
          {!rateSaved[activeDay] ? (
            <>
              <div style={{ ...G.label, textAlign:"center", marginBottom:12 }}>{t.rateTitle}</div>
              <StarRating value={ratings[activeDay]||0} onChange={submitRating} saved={false}/>
            </>
          ) : (ratings[activeDay]||5) <= 3 && !ratingDir[activeDay] ? (
            <>
              <div style={{ ...G.label, textAlign:"center", marginBottom:12 }}>{lang==="he"?"מה הייתה הבעיה?":"What was the issue?"}</div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>submitDirection("too_hot")} style={{ flex:1, padding:"10px", borderRadius:10, border:"1px solid rgba(232,115,74,0.3)", background:"rgba(232,115,74,0.08)", color:"rgba(232,115,74,0.9)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.02em" }}>
                  {lang==="he"?"חם מדי":"Too hot"}
                </button>
                <button onClick={()=>submitDirection("too_cold")} style={{ flex:1, padding:"10px", borderRadius:10, border:"1px solid rgba(74,144,226,0.3)", background:"rgba(74,144,226,0.08)", color:"rgba(74,144,226,0.9)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.02em" }}>
                  {lang==="he"?"קר מדי":"Too cold"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ ...G.label, textAlign:"center" }}>{t.rateSaved}</div>
          )}
        </div>
      </div>

      {/* Change city */}
      <button onClick={onChangCity} style={{ width:"100%", padding:"12px", ...G.glassDark, borderRadius:12, color:"rgba(255,255,255,0.3)", fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all .2s", letterSpacing:"0.02em" }}>
        {t.changeCity}
      </button>
    </div>
  );
}

// ─── PROFILE DRAWER ───────────────────────────────────────────────────────────
function ProfileDrawer({ profile, lang, onClose, onSaved }: { profile:UserProfile; lang:Lang; onClose:()=>void; onSaved:(p:UserProfile)=>void }) {
  const t=TR[lang];
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({ name:profile.name, phone:profile.phone, city:profile.city, height:profile.height, weight:profile.weight });
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [locLoading,setLocLoading]=useState(false);

  async function save() {
    setSaving(true);
    try {
      const u:UserProfile={...profile,...form};
      await fetch("/api/users/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(u)});
      onSaved(u); setSaved(true); setEditing(false);
      setTimeout(()=>setSaved(false),3000);
    } catch {}
    setSaving(false);
  }

  async function detectLoc() {
    setLocLoading(true);
    try { const c=await detectCity(); if(c) setForm(f=>({...f,city:c})); } catch {}
    setLocLoading(false);
  }

  const rows = [
    {label:t.fullName, val:profile.name},
    {label:t.emailLabel, val:profile.email},
    {label:t.phone, val:profile.phone||"—"},
    {label:t.city, val:profile.city},
    {label:t.height, val:`${profile.height} ${t.heightUnit}`},
    {label:t.weight, val:`${profile.weight} ${t.weightUnit}`},
    {label:t.gender, val:profile.gender==="male"?t.male:t.female},
    {label:t.birthdate, val:profile.birthdate},
  ];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex" }}>
      <div style={{ flex:1, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(4px)" }} onClick={onClose}/>
      <div style={{ width:320, background:"#080e1c", borderLeft:"1px solid rgba(255,255,255,0.07)", height:"100%", overflowY:"auto", padding:"28px 22px", animation:"slideInRight .3s cubic-bezier(.23,1,.32,1)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <span style={{ fontSize:15, fontWeight:600, color:"rgba(255,255,255,0.85)", letterSpacing:"-0.01em" }}>{t.profileMenu}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:18, cursor:"pointer", padding:"4px 8px" }}>✕</button>
        </div>

        {saved&&<div style={{ ...G.glass, borderRadius:10, padding:"10px 14px", fontSize:12, color:"rgba(78,205,196,0.9)", marginBottom:16, textAlign:"center" }}>{t.profileUpdated}</div>}

        {!editing ? (
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {rows.map(({label,val})=>(
              <div key={label} style={{ padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ ...G.label, marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:14, color:"rgba(255,255,255,0.75)" }}>{val}</div>
              </div>
            ))}
            <button onClick={()=>setEditing(true)} style={{ ...G.glass, border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, color:"rgba(255,255,255,0.7)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:"12px", marginTop:20, letterSpacing:"0.02em" }}>
              {t.editProfile}
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <FieldGroup label={t.fullName}><Input value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder={t.namePlaceholder}/></FieldGroup>
            <FieldGroup label={t.phone}><Input value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} placeholder={t.phonePlaceholder} ltr/></FieldGroup>
            <FieldGroup label={t.city}>
              <Input value={form.city} onChange={v=>setForm(f=>({...f,city:v}))} placeholder={t.cityPlaceholder}/>
              <button onClick={detectLoc} disabled={locLoading} style={{ marginTop:6, background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"rgba(255,255,255,0.35)", fontSize:11, padding:"7px 12px", cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.05em", textTransform:"uppercase" as const }}>
                {locLoading?t.detecting:t.detectLocation}
              </button>
            </FieldGroup>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <FieldGroup label={t.height}><Input value={form.height} onChange={v=>setForm(f=>({...f,height:v}))} type="number" placeholder="170" unit={t.heightUnit}/></FieldGroup>
              <FieldGroup label={t.weight}><Input value={form.weight} onChange={v=>setForm(f=>({...f,weight:v}))} type="number" placeholder="70" unit={t.weightUnit}/></FieldGroup>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <button onClick={()=>setEditing(false)} style={{ flex:1, padding:"11px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, color:"rgba(255,255,255,0.4)", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>{t.cancelEdit}</button>
              <button onClick={save} disabled={saving} style={{ flex:2, padding:"11px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, color:saving?"rgba(255,255,255,0.3)":"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{saving?"...":t.saveProfile}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
type View = "auth_email"|"auth_otp"|"auth_register"|"weather";
const EMPTY = {name:"",phone:"",gender:"",birthdate:"",height:"",weight:"",city:""};

export default function App() {
  const [lang,setLang]=useState<Lang>("he");
  const t=TR[lang];
  const isRtl=lang==="he";

  const [view,setView]=useState<View>("auth_email");
  const [email,setEmail]=useState("");
  const [otp,setOtp]=useState("");
  const [profile,setProfile]=useState<UserProfile|null>(null);
  const [form,setForm]=useState(EMPTY);
  const [city,setCity]=useState("");
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [loading,setLoading]=useState(false);
  const [loadingMsg,setLoadingMsg]=useState("");
  const [globalError,setGlobalError]=useState("");
  const [result,setResult]=useState<WeatherResult|null>(null);
  const [locLoading,setLocLoading]=useState(false);
  const [sideMenuOpen,setSideMenuOpen]=useState(false);
  const [changingCity,setChangingCity]=useState(false);

  const setF=(k:string)=>(v:string)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>({...e,[k]:""}));setGlobalError("");};

  useEffect(()=>{
    const saved=localStorage.getItem("tw_email");
    const savedLang=localStorage.getItem("tw_lang") as Lang|null;
    if (savedLang) setLang(savedLang);
    if (saved) {
      fetch(`/api/users/get?email=${encodeURIComponent(saved)}`).then(r=>r.json()).then(data=>{
        if (data?.email){ setProfile(data); setEmail(saved); setView("weather"); setTimeout(()=>fetchWeatherForProfile(data),100); }
      }).catch(()=>{});
    }
  },[]);

  function switchLang(l:Lang){ setLang(l); localStorage.setItem("tw_lang",l); }

  async function sendOtp(){
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setErrors({email:t.invalidEmail});return;}
    setLoading(true);setGlobalError("");
    try{
      const res=await fetch("/api/auth/send-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,lang})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.detail||data.error||t.sendError);
      setView("auth_otp");
    }catch(e:unknown){setGlobalError(e instanceof Error?e.message:t.sendError);}
    finally{setLoading(false);}
  }

  async function verifyOtp(){
    if(otp.length<4){setErrors({otp:t.otpRequired});return;}
    setLoading(true);setGlobalError("");
    try{
      const res=await fetch("/api/auth/verify-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,code:otp})});
      const data=await res.json();
      if(!res.ok) throw new Error(t.otpError);
      if(data.user){setProfile(data.user);localStorage.setItem("tw_email",email);setView("weather");setTimeout(()=>fetchWeatherForProfile(data.user),100);}
      else setView("auth_register");
    }catch(e:unknown){setGlobalError(e instanceof Error?e.message:t.otpError);}
    finally{setLoading(false);}
  }

  function validateRegister(){
    const e:Record<string,string>={};
    if(!form.name.trim()) e.name=t.nameRequired;
    if(!form.gender) e.gender=t.genderRequired;
    if(!form.birthdate) e.birthdate=t.birthdateRequired;
    else{const a=calcAge(form.birthdate);if(a<5||a>110)e.birthdate=t.invalidDate;}
    if(!form.height||+form.height<50) e.height=t.heightInvalid;
    if(!form.weight||+form.weight<10) e.weight=t.weightInvalid;
    if(!city.trim()) e.city=t.cityRequired;
    return e;
  }

  async function saveProfile(){
    const e=validateRegister();
    if(Object.keys(e).length){setErrors(e);return;}
    setLoading(true);setGlobalError("");
    try{
      const pd:UserProfile={email,name:form.name.trim(),phone:form.phone.trim(),gender:form.gender,birthdate:form.birthdate,height:form.height,weight:form.weight,city:city.trim()};
      const res=await fetch("/api/users/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(pd)});
      if(!res.ok) throw new Error(t.saveError);
      setProfile(pd);localStorage.setItem("tw_email",email);setView("weather");
      setTimeout(()=>fetchWeatherForProfile(pd),100);
    }catch(e:unknown){setGlobalError(e instanceof Error?e.message:t.saveError);}
    finally{setLoading(false);}
  }

  async function doFetchWeather(fetchCity:string,p:UserProfile){
    setLoading(true);setLoadingMsg(t.searching);setGlobalError("");setChangingCity(false);
    try{
      const [weatherRes,corrRes]=await Promise.all([
        fetch("/api/weather",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({city:fetchCity})}),
        fetch(`/api/ratings/correction?email=${encodeURIComponent(p.email)}`).then(r=>r.json()).catch(()=>({correction:0})),
      ]);
      const weather=await weatherRes.json();
      if(!weatherRes.ok) throw new Error(
        weather.error==="rate_limit"?(lang==="he"?"עומס זמני, נסה שוב":"Server busy, try again"):
        weather.error==="city_not_found"?t.cityNotFound(fetchCity):
        weather.detail||t.weatherError
      );
      setLoadingMsg(t.calculating);
      const age=calcAge(p.birthdate);
      const bmi=calcBMI(+p.weight,+p.height);
      const{genderOffset,bmiOffset,ageOffset}=getOffsets(p.gender,bmi,age);
      const offset=genderOffset+bmiOffset+ageOffset+(corrRes.correction||0);
      const now=new Date(); const tom=new Date(); tom.setDate(tom.getDate()+1);
      const loc=lang==="he"?"he-IL":"en-US";
      const opts:Intl.DateTimeFormatOptions={weekday:"long",day:"numeric",month:"long"};
      setResult({
        today:{...weather.today}, tomorrow:{...weather.tomorrow}, cityHe:weather.cityHe,
        todayFeel:weather.today.avg+offset, tomorrowFeel:weather.tomorrow.avg+offset,
        todayDateStr:now.toLocaleDateString(loc,opts), tomorrowDateStr:tom.toLocaleDateString(loc,opts),
      });
    }catch(e:unknown){setGlobalError(e instanceof Error?e.message:t.weatherError);}
    finally{setLoading(false);setLoadingMsg("");}
  }

  async function fetchWeather(fetchCity:string){await doFetchWeather(fetchCity,profile!);}
  async function fetchWeatherForProfile(p:UserProfile){await doFetchWeather(p.city,p);}

  async function useMyLocation(setter:(v:string)=>void){
    setLocLoading(true);
    try{const c=await detectCity();if(c)setter(c);else setGlobalError(t.locationFailed);}
    catch(e:unknown){const msg=e instanceof Error?e.message:"";setGlobalError(msg==="location_denied"?t.locationDenied:t.locationFailed);}
    finally{setLocLoading(false);}
  }

  function signOut(){localStorage.removeItem("tw_email");setProfile(null);setEmail("");setOtp("");setResult(null);setForm(EMPTY);setCity("");setView("auth_email");}

  // Loading spinner shared
  const Spinner = (
    <GlassCard>
      <div style={{ textAlign:"center", padding:"40px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <span style={{ width:32, height:32, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.08)", borderTopColor:"rgba(255,255,255,0.5)", display:"inline-block", animation:"spin .8s linear infinite" }}/>
        {loadingMsg&&<div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", letterSpacing:"0.06em" }}>{loadingMsg}</div>}
      </div>
    </GlassCard>
  );

  return (
    <div dir={isRtl?"rtl":"ltr"} style={{ minHeight:"100vh", fontFamily:"'Heebo', sans-serif", background:"radial-gradient(ellipse at 30% 0%, #0d1f3c 0%, #070d1a 60%)", position:"relative", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"32px 16px 56px" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
        *{box-sizing:border-box;margin:0;padding:0;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input::placeholder{color:rgba(255,255,255,0.15);}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.3);}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px;}
        button{outline:none;}
      `}</style>

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:440 }}>
        {/* ── TOP BAR ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, animation:"fadeIn .4s ease" }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.18em", color:"rgba(255,255,255,0.25)", textTransform:"uppercase" }}>What2wear</div>
            {view==="weather"&&profile&&<div style={{ fontSize:20, fontWeight:600, color:"#fff", marginTop:2, letterSpacing:"-0.02em" }}>{t.hello(profile.name)}</div>}
            {view!=="weather"&&<div style={{ fontSize:20, fontWeight:600, color:"#fff", marginTop:2, letterSpacing:"-0.02em" }}>
              {view==="auth_otp"?t.enterOtp:view==="auth_register"?t.register:t.whatToWear}
            </div>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {/* Lang toggle */}
            <div style={{ display:"flex", ...G.glass, borderRadius:20, padding:3, gap:2 }}>
              {(["he","en"] as Lang[]).map(l=>(
                <button key={l} onClick={()=>switchLang(l)} style={{ padding:"5px 10px", borderRadius:16, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"inherit", transition:"all .2s",
                  background:lang===l?"rgba(255,255,255,0.14)":"transparent", color:lang===l?"#fff":"rgba(255,255,255,0.3)" }}>
                  {l==="he"?"עב":"EN"}
                </button>
              ))}
            </div>
            {/* Profile/signout */}
            {profile&&view==="weather"&&(
              <button onClick={()=>setSideMenuOpen(true)} style={{ ...G.glass, border:"1px solid rgba(255,255,255,0.09)", borderRadius:20, padding:"6px 12px", color:"rgba(255,255,255,0.45)", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                {t.profileMenu}
              </button>
            )}
          </div>
        </div>

        {view==="weather"&&profile&&(
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12, marginTop:-16 }}>
            <button onClick={signOut} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.2)", fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.06em", textTransform:"uppercase" }}>
              {t.signOut}
            </button>
          </div>
        )}

        {/* ── EMAIL ── */}
        {view==="auth_email"&&(
          <GlassCard>
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginBottom:4 }}>{t.tagline}</div>
              <FieldGroup label={t.emailLabel} error={errors.email} required>
                <Input value={email} onChange={v=>{setEmail(v);setErrors({});setGlobalError("");}} type="email" placeholder={t.emailPlaceholder} ltr error={errors.email}/>
              </FieldGroup>
              {globalError&&<ErrorMsg>{globalError}</ErrorMsg>}
              <Btn onClick={sendOtp} loading={loading}>{t.sendOtp}</Btn>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.18)", textAlign:"center", lineHeight:1.7 }}>{t.otpHint} · {t.firstTimeHint}</div>
            </div>
          </GlassCard>
        )}

        {/* ── OTP ── */}
        {view==="auth_otp"&&(
          <GlassCard>
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", textAlign:"center" }}>
                {t.codeSentTo}<span style={{ color:"rgba(255,255,255,0.8)", fontWeight:600 }}>{email}</span>
              </div>
              <FieldGroup label={t.otpLabel} error={errors.otp} required>
                <Input value={otp} onChange={v=>{setOtp(v);setErrors({});setGlobalError("");}} type="text" placeholder={t.otpPlaceholder} ltr error={errors.otp}/>
              </FieldGroup>
              {globalError&&<ErrorMsg>{globalError}</ErrorMsg>}
              <Btn onClick={verifyOtp} loading={loading}>{t.verifyBtn}</Btn>
              <Btn onClick={()=>{setView("auth_email");setOtp("");setGlobalError("");}} variant="ghost" size="sm">{t.changeEmail}</Btn>
            </div>
          </GlassCard>
        )}

        {/* ── REGISTER ── */}
        {view==="auth_register"&&(
          <GlassCard>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.25)", marginBottom:20 }}>{t.savedHint}</div>

            <Label>{t.personalInfo}</Label>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:4 }}>
              <FieldGroup label={t.fullName} error={errors.name} required>
                <Input value={form.name} onChange={setF("name")} placeholder={t.namePlaceholder} error={errors.name}/>
              </FieldGroup>
              <FieldGroup label={t.phone}>
                <Input value={form.phone} onChange={setF("phone")} type="tel" placeholder={t.phonePlaceholder} ltr/>
              </FieldGroup>
            </div>
            <Divider/>

            <Label>{t.bodyData}</Label>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:4 }}>
              <FieldGroup label={t.gender} error={errors.gender} required>
                <div style={{ display:"flex", gap:8 }}>
                  {([["male",t.male],["female",t.female]] as [string,string][]).map(([val,lbl])=>(
                    <button key={val} onClick={()=>setF("gender")(val)} style={{ flex:1, padding:"11px", borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit", border:"1px solid", transition:"all .2s",
                      borderColor:form.gender===val?"rgba(255,255,255,0.2)":errors.gender?"rgba(255,107,107,0.4)":"rgba(255,255,255,0.07)",
                      background:form.gender===val?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.03)",
                      color:form.gender===val?"#fff":"rgba(255,255,255,0.3)" }}>{lbl}</button>
                  ))}
                </div>
              </FieldGroup>
              <FieldGroup label={t.birthdate} error={errors.birthdate} required>
                <Input value={form.birthdate} onChange={setF("birthdate")} type="date" error={errors.birthdate}/>
              </FieldGroup>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <FieldGroup label={t.height} error={errors.height} required>
                  <Input value={form.height} onChange={setF("height")} type="number" placeholder="170" unit={t.heightUnit} error={errors.height}/>
                </FieldGroup>
                <FieldGroup label={t.weight} error={errors.weight} required>
                  <Input value={form.weight} onChange={setF("weight")} type="number" placeholder="70" unit={t.weightUnit} error={errors.weight}/>
                </FieldGroup>
              </div>
            </div>
            <Divider/>

            <Label>{t.locationSection}</Label>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
              <FieldGroup label={t.city} error={errors.city} required>
                <Input value={city} onChange={v=>{setCity(v);setErrors(e=>({...e,city:""}));}} placeholder={t.cityPlaceholder} error={errors.city}/>
              </FieldGroup>
              <Btn onClick={()=>useMyLocation(setCity)} loading={locLoading} variant="outline" size="sm">
                {locLoading?t.detecting:t.detectLocation}
              </Btn>
            </div>

            {globalError&&<><ErrorMsg>{globalError}</ErrorMsg><div style={{ height:14 }}/></>}
            <Btn onClick={saveProfile} loading={loading}>{t.saveBtn}</Btn>
          </GlassCard>
        )}

        {/* ── WEATHER ── */}
        {view==="weather"&&profile&&(
          result ? (
            <ResultCard result={result} onChangCity={()=>{setResult(null);setGlobalError("");setChangingCity(true);}} lang={lang} email={email} onRateSubmit={()=>{}}/>
          ) : loading ? Spinner
          : changingCity ? (
            <GlassCard>
              <Label>{t.cityForForecast}</Label>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <FieldGroup label={t.city} error={errors.city}>
                  <Input value={city} onChange={v=>{setCity(v);setErrors(e=>({...e,city:""}));setGlobalError("");}} placeholder={profile.city} error={errors.city}/>
                </FieldGroup>
                <Btn onClick={()=>useMyLocation(setCity)} loading={locLoading} variant="outline" size="sm">
                  {locLoading?t.detecting:t.detectLocation}
                </Btn>
                {globalError&&<ErrorMsg>{globalError}</ErrorMsg>}
                <Btn onClick={()=>fetchWeather(city||profile.city)}>{t.getRecommendation}</Btn>
              </div>
            </GlassCard>
          ) : globalError ? (
            <GlassCard>
              <div style={{ textAlign:"center", padding:"24px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"rgba(255,130,130,0.6)", textTransform:"uppercase" }}>שגיאה</div>
                <div style={{ fontSize:14, color:"rgba(255,130,130,0.8)", lineHeight:1.6 }}>{globalError}</div>
                <Btn onClick={()=>fetchWeatherForProfile(profile)}>{t.getRecommendation}</Btn>
              </div>
            </GlassCard>
          ) : Spinner
        )}

        <div style={{ textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.1)", marginTop:20, letterSpacing:"0.1em", textTransform:"uppercase" }}>{t.footer}</div>
      </div>

      {sideMenuOpen&&profile&&(
        <ProfileDrawer profile={profile} lang={lang} onClose={()=>setSideMenuOpen(false)}
          onSaved={p=>{setProfile(p);if(result)doFetchWeather(p.city,p);}}/>
      )}
    </div>
  );
}
