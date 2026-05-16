"use client";
import { useState, useEffect, useRef } from "react";
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
    detectLocation:"זהה מיקום אוטומטית", detecting:"מאתר...",
    saveBtn:"שמור והמשך", getRecommendation:"קבל המלצה",
    loading:"טוען...", searching:"מאחזר תחזית...", calculating:"מחשב תחושה אישית...",
    signOut:"התנתק", changeCity:"שנה עיר", cityForForecast:"עיר לתחזית",
    todayTab:"היום", tomorrowTab:"מחר",
    clothingRec:"המלצת לבוש", uvIndex:"UV", wind:"רוח",
    low:"נמוך", medium:"בינוני", high:"גבוה",
    pants:"מכנסיים", pantsShort:"קצרים", pantsLong:"ארוכים",
    shoes:"נעליים", shoesOpen:"פתוחות", shoesClosed:"סגורות",
    shirt:"חולצה", shirtShort:"קצרה", shirtLong:"ארוכה",
    outerLight:"עליונית דקה", outerCoat:"מעיל",
    accessories:"כובע וכפפות",
    min:"מינ׳", avg:"ממוצע", max:"מקס׳", feel:"תחושה",
    rateTitle:"דרג את ההמלצה", rateSaved:"תודה על הדירוג",
    profileMenu:"פרופיל", editProfile:"ערוך פרטים", saveProfile:"שמור", cancelEdit:"ביטול",
    profileUpdated:"הפרופיל עודכן",
    locationDenied:"יש לאשר גישה למיקום", locationFailed:"לא הצלחנו לאתר מיקום",
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
    emailLabel:"Email address", emailPlaceholder:"you@example.com", invalidEmail:"Invalid email",
    sendOtp:"Send verification code",
    codeSentTo:"We sent a code to ", otpLabel:"Verification code (6 digits)", otpPlaceholder:"123456",
    otpRequired:"Please enter the code", verifyBtn:"Verify & Login", changeEmail:"Change email",
    otpHint:"Code valid for 10 minutes", firstTimeHint:"First time? Fill in details after verification.",
    savedHint:"Details saved for next time",
    personalInfo:"Personal details", fullName:"Full name", namePlaceholder:"John Doe", nameRequired:"Required",
    phone:"Phone", phonePlaceholder:"+1-555-0000",
    bodyData:"Body data", gender:"Gender", male:"Male", female:"Female", genderRequired:"Select a gender",
    birthdate:"Date of birth", birthdateRequired:"Required", invalidDate:"Invalid date",
    height:"Height", heightUnit:"cm", heightInvalid:"Invalid",
    weight:"Weight", weightUnit:"kg", weightInvalid:"Invalid",
    locationSection:"Location", city:"City", cityPlaceholder:"New York / London", cityRequired:"Enter a city",
    detectLocation:"Detect my location", detecting:"Detecting...",
    saveBtn:"Save & Continue", getRecommendation:"Get recommendation",
    loading:"Loading...", searching:"Fetching forecast...", calculating:"Calculating...",
    signOut:"Sign out", changeCity:"Change city", cityForForecast:"City for forecast",
    todayTab:"Today", tomorrowTab:"Tomorrow",
    clothingRec:"Clothing", uvIndex:"UV", wind:"Wind",
    low:"Low", medium:"Med", high:"High",
    pants:"Pants", pantsShort:"Short", pantsLong:"Long",
    shoes:"Shoes", shoesOpen:"Open", shoesClosed:"Closed",
    shirt:"Shirt", shirtShort:"Short sleeve", shirtLong:"Long sleeve",
    outerLight:"Light jacket", outerCoat:"Coat",
    accessories:"Hat & gloves",
    min:"Min", avg:"Avg", max:"Max", feel:"Feel",
    rateTitle:"Rate this recommendation", rateSaved:"Thanks for rating",
    profileMenu:"Profile", editProfile:"Edit details", saveProfile:"Save", cancelEdit:"Cancel",
    profileUpdated:"Profile updated",
    locationDenied:"Allow location access in browser", locationFailed:"Could not detect location",
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

type SkyTheme = { sky1:string; sky2:string; sky3:string; sun:boolean; cold:boolean };
function getSkyTheme(feel: number): SkyTheme {
  if (feel>=28) return { sky1:"#FF8C42", sky2:"#FFB347", sky3:"#87CEEB", sun:true, cold:false };
  if (feel>=22) return { sky1:"#4A90D9", sky2:"#74B9FF", sky3:"#B8D9F8", sun:true, cold:false };
  if (feel>=16) return { sky1:"#6B8CAE", sky2:"#8FAFC8", sky3:"#C2D4E3", sun:false, cold:false };
  if (feel>=10) return { sky1:"#4A5568", sky2:"#718096", sky3:"#A0AEC0", sun:false, cold:false };
  return { sky1:"#2D3748", sky2:"#4A5568", sky3:"#718096", sun:false, cold:true };
}
function getConditionLabel(feel: number, lang: Lang): string {
  const L = TR[lang].recLabels;
  if (feel>=28) return L.hot; if (feel>=22) return L.warm; if (feel>=16) return L.pleasant;
  if (feel>=10) return L.cool; if (feel>=5) return L.chilly; return L.cold;
}
type ClothingItems = { pants:"long"|"short"; shoes:"closed"|"open"; shirt:"long"|"short"; outer:"coat"|"light"|null; accessories:boolean };
function getClothingItems(feel: number): ClothingItems {
  return {
    pants: feel>=24?"short":"long", shoes: feel>=26?"open":"closed",
    shirt: feel>=22?"short":"long", outer: feel>=22?null:feel>=14?"light":"coat",
    accessories: feel<=8,
  };
}

function getRecommendationText(feel: number, uv: "low"|"medium"|"high", wind: "low"|"medium"|"high", lang: Lang): string {
  const parts: string[] = [];
  if (lang === "he") {
    if (uv === "high") parts.push(feel >= 20 ? "בשמש חם מאוד – מומלץ להישאר בצל ולמרוח קרם הגנה" : "קרינת UV גבוהה – מומלץ קרם הגנה");
    else if (uv === "medium" && feel >= 16) parts.push("בשמש תרגיש חום, בצל יהיה נעים יותר");
    if (wind === "high") parts.push("רוח חזקה – תרגיש קריר יותר מהטמפרטורה בפועל");
    else if (wind === "medium") parts.push("רוח בינונית – עדיף לקחת שכבה קלה");
    if (!parts.length) {
      if (feel >= 28) parts.push("יום חם – שתה הרבה מים");
      else if (feel <= 5) parts.push("קור עז – התלבש בשכבות");
      else if (feel >= 18 && uv === "low" && wind === "low") parts.push("מזג אוויר נעים, מתאים לפעילות בחוץ");
    }
  } else {
    if (uv === "high") parts.push(feel >= 20 ? "Very strong sun – seek shade and apply sunscreen" : "High UV – apply sunscreen");
    else if (uv === "medium" && feel >= 16) parts.push("Sun feels warm; shade is noticeably cooler");
    if (wind === "high") parts.push("Strong wind – will feel colder than the actual temperature");
    else if (wind === "medium") parts.push("Moderate breeze – consider a light layer");
    if (!parts.length) {
      if (feel >= 28) parts.push("Hot day – stay hydrated");
      else if (feel <= 5) parts.push("Very cold – dress in layers");
      else if (feel >= 18 && uv === "low" && wind === "low") parts.push("Pleasant weather – great for outdoor activities");
    }
  }
  return parts.join(" · ");
}

// ─── GEOLOCATION ──────────────────────────────────────────────────────────────
async function getCityFromCoords(lat: number, lon: number): Promise<string> {
  const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=he`, { headers:{"User-Agent":"What2wear/1.0"} });
  const d = await r.json();
  return d.address?.city||d.address?.town||d.address?.village||"";
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

// ─── SKY ANIMATION ────────────────────────────────────────────────────────────
function Cloud({ top, delay, scale, opacity }: { top:string; delay:number; scale:number; opacity:number }) {
  return (
    <div style={{ position:"absolute", top, left:0, width:"100%", animation:`cloudDrift ${18+delay*4}s ${delay}s linear infinite`, opacity, transform:`scale(${scale})`, transformOrigin:"left center" }}>
      <div style={{ position:"relative", width:110, height:36 }}>
        <div style={{ position:"absolute", bottom:0, left:8, width:94, height:26, borderRadius:26, background:"rgba(255,255,255,0.75)" }}/>
        <div style={{ position:"absolute", bottom:14, left:20, width:50, height:38, borderRadius:"50%", background:"rgba(255,255,255,0.8)" }}/>
        <div style={{ position:"absolute", bottom:14, left:52, width:38, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.72)" }}/>
      </div>
    </div>
  );
}

function SkyHero({ sky, feel, cityHe, dateStr, lang }: { sky:SkyTheme; feel:number; cityHe:string; dateStr:string; lang:Lang }) {
  return (
    <div style={{ position:"relative", height:210, overflow:"hidden", borderRadius:"20px 20px 0 0" }}>
      {/* Gradient sky */}
      <div style={{ position:"absolute", inset:0, background:`linear-gradient(180deg, ${sky.sky1} 0%, ${sky.sky2} 55%, ${sky.sky3} 100%)`, transition:"background 1.2s ease" }}/>

      {/* Sun */}
      {sky.sun && (
        <div style={{ position:"absolute", top:22, right:28, width:54, height:54, borderRadius:"50%",
          background: feel>=28?"radial-gradient(circle, #FFE566, #FFAA00)":"radial-gradient(circle, #FFF0AA, #FFD060)",
          boxShadow: feel>=28?"0 0 40px 16px rgba(255,180,0,0.4)":"0 0 28px 10px rgba(255,200,60,0.3)",
          animation:"sunPulse 4s ease-in-out infinite" }}/>
      )}
      {/* Moon / stars for cold */}
      {sky.cold && (
        <>
          <div style={{ position:"absolute", top:20, right:32, width:36, height:36, borderRadius:"50%", background:"rgba(200,220,255,0.9)", boxShadow:"0 0 20px 6px rgba(180,200,255,0.4)" }}/>
          {[1,2,3,4,5,6].map(i=>(
            <div key={i} style={{ position:"absolute", width:2, height:2, borderRadius:"50%", background:"rgba(255,255,255,0.9)", top:`${8+i*10}%`, right:`${10+i*14}%`, animation:`twinkle ${1+i*0.4}s ease-in-out infinite alternate` }}/>
          ))}
        </>
      )}

      {/* Clouds */}
      {!sky.cold && <>
        <Cloud top="12%" delay={0} scale={1} opacity={0.9}/>
        <Cloud top="38%" delay={3} scale={0.7} opacity={0.7}/>
        <Cloud top="20%" delay={7} scale={0.5} opacity={0.55}/>
      </>}

      {/* Text overlay */}
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 22px 20px" }}>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", fontWeight:500, marginBottom:2, letterSpacing:"0.02em" }}>{cityHe} · {dateStr}</div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:12 }}>
          <div style={{ fontSize:82, fontWeight:200, color:"#fff", lineHeight:1, letterSpacing:"-0.04em", textShadow:"0 2px 20px rgba(0,0,0,0.2)" }}>{feel}°</div>
          <div style={{ paddingBottom:10 }}>
            <div style={{ fontSize:16, fontWeight:600, color:"rgba(255,255,255,0.95)" }}>{getConditionLabel(feel, lang)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── WHITE CARD COMPONENTS ────────────────────────────────────────────────────
const C = {
  text: "#1e293b",
  textSec: "#64748b",
  textMuted: "#94a3b8",
  border: "rgba(0,0,0,0.07)",
  inputBg: "rgba(0,0,0,0.04)",
  card: "rgba(255,255,255,0.97)",
};

function Card({ children, style }: { children:React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:C.card, borderRadius:20, border:`1px solid ${C.border}`, boxShadow:"0 4px 24px rgba(0,0,0,0.12)", animation:"fadeUp .4s cubic-bezier(.23,1,.32,1) both", overflow:"hidden", ...style }}>
      <div style={{ padding:"24px 22px 26px" }}>{children}</div>
    </div>
  );
}

function FieldLabel({ text, error, required }: { text:string; error?:string; required?:boolean }) {
  return (
    <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" as const, color:error?"#ef4444":C.textMuted, marginBottom:8 }}>
      {text}{required&&<span style={{ color:"#f59e0b", marginRight:3 }}>*</span>}
    </div>
  );
}
function FieldGroup({ label, error, required, children }: { label:string; error?:string; required?:boolean; children:React.ReactNode }) {
  return (
    <div>
      <FieldLabel text={label} error={error} required={required}/>
      {children}
      {error&&<div style={{ fontSize:11, color:"#ef4444", marginTop:5 }}>{error}</div>}
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
        style={{ width:"100%", padding:unit?"11px 14px 11px 38px":"11px 14px", background:C.inputBg,
          border:`1.5px solid ${error?"#fca5a5":f?"#93c5fd":C.border}`,
          borderRadius:10, fontSize:14, color:C.text, fontFamily:"inherit", outline:"none", transition:"border .15s",
          direction:ltr?"ltr":"rtl", textAlign:ltr?"left":"right", WebkitAppearance:"none", boxSizing:"border-box" as const }}
      />
      {unit&&<span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:C.textMuted, fontSize:11, pointerEvents:"none" }}>{unit}</span>}
    </div>
  );
}

function PrimaryBtn({ onClick, loading, children }: { onClick:()=>void; loading?:boolean; children:React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={loading} style={{ width:"100%", padding:"13px", border:"none", borderRadius:12,
      background:loading?"#e2e8f0":"#1e3a6e", color:loading?C.textMuted:"#fff",
      fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit",
      transition:"all .2s", letterSpacing:"0.02em", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
      {loading?<><Spin/> {typeof children==="string"?children:"טוען..."}</>:children}
    </button>
  );
}

function GhostBtn({ onClick, children }: { onClick:()=>void; children:React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ background:"none", border:"none", color:C.textSec, fontSize:13, cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.01em", padding:"4px 0" }}>
      {children}
    </button>
  );
}

function OutlineBtn({ onClick, loading, children }: { onClick:()=>void; loading?:boolean; children:React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={loading} style={{ width:"100%", padding:"10px 14px", border:`1.5px solid ${C.border}`, borderRadius:10, background:C.inputBg, color:C.textSec, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all .2s", letterSpacing:"0.04em", textTransform:"uppercase" as const }}>
      {loading?"...":children}
    </button>
  );
}

function Spin() {
  return <span style={{ width:14, height:14, borderRadius:"50%", border:"2px solid #cbd5e1", borderTopColor:"#1e3a6e", display:"inline-block", animation:"spin .7s linear infinite" }}/>;
}

function ErrBox({ children }: { children:React.ReactNode }) {
  return <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#dc2626" }}>{children}</div>;
}

function Divider() {
  return <div style={{ height:1, background:C.border, margin:"20px 0" }}/>;
}

function SectionHead({ text }: { text:string }) {
  return <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" as const, color:C.textMuted, marginBottom:14 }}>{text}</div>;
}

// ─── CLOTHING DISPLAY ─────────────────────────────────────────────────────────
function ClothingRow({ label, value }: { label:string; value?:string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
      <span style={{ fontSize:13, color:C.textSec }}>{label}</span>
      {value&&<span style={{ fontSize:12, fontWeight:600, color:C.text, background:"rgba(30,58,110,0.07)", padding:"3px 10px", borderRadius:20 }}>{value}</span>}
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
  const map = { low:{ dot:"#10b981", bg:"#ecfdf5", text:"#065f46" }, medium:{ dot:"#f59e0b", bg:"#fffbeb", text:"#92400e" }, high:{ dot:"#ef4444", bg:"#fef2f2", text:"#991b1b" } };
  const m = map[level];
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:20, background:m.bg, border:`1px solid ${m.dot}30` }}>
      <div style={{ width:6, height:6, borderRadius:"50%", background:m.dot, flexShrink:0 }}/>
      <span style={{ fontSize:11, fontWeight:600, color:m.text, letterSpacing:"0.08em" }}>{label} · {level==="low"?t.low:level==="medium"?t.medium:t.high}</span>
    </div>
  );
}

// ─── STAR RATING ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange, saved }: { value:number; onChange:(v:number)=>void; saved:boolean }) {
  const [hover,setHover]=useState(0);
  return (
    <div style={{ display:"flex", gap:4, justifyContent:"center" }}>
      {[1,2,3,4,5].map(s=>(
        <button key={s} onClick={()=>!saved&&onChange(s)} onMouseEnter={()=>!saved&&setHover(s)} onMouseLeave={()=>setHover(0)}
          style={{ background:"none", border:"none", fontSize:24, cursor:saved?"default":"pointer", transition:"all .15s",
            color:(hover||value)>=s?"#f59e0b":"#e2e8f0", transform:(hover||value)>=s?"scale(1.15)":"scale(1)" }}>
          ★
        </button>
      ))}
    </div>
  );
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
type DayWeather = { min:number; max:number; avg:number; uv:"low"|"medium"|"high"; wind:"low"|"medium"|"high" };
type HourData = { localHour:number; temp:number; code:number; isDay:boolean };
type WeatherResult = {
  today:DayWeather; tomorrow:DayWeather; cityHe:string;
  todayFeel:number; tomorrowFeel:number;
  todayDateStr:string; tomorrowDateStr:string;
  todayHourly:HourData[]; tomorrowHourly:HourData[];
  feelOffset:number;
};

// ─── WEATHER SVG ICONS ────────────────────────────────────────────────────────
function SunIcon({size=22}:{size?:number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4.5" fill="#FBBF24"/>
      <g stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round">
        <line x1="12" y1="2.5" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21.5"/>
        <line x1="2.5" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21.5" y2="12"/>
        <line x1="5.4" y1="5.4" x2="7.1" y2="7.1"/><line x1="16.9" y1="16.9" x2="18.6" y2="18.6"/>
        <line x1="18.6" y1="5.4" x2="16.9" y2="7.1"/><line x1="7.1" y1="16.9" x2="5.4" y2="18.6"/>
      </g>
    </svg>
  );
}
function MoonIcon({size=22}:{size?:number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#FCD34D"/>
    </svg>
  );
}
function CloudIcon({size=22,color="#94A3B8"}:{size?:number;color?:string}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M18 10h-.3C17.1 7.2 14.8 5 12 5A6 6 0 0 0 6.3 9.2 4.5 4.5 0 0 0 7.5 18h10.5A4 4 0 0 0 18 10z" fill={color}/>
    </svg>
  );
}
function PartlyCloudyIcon({size=22}:{size?:number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="10" cy="9" r="4" fill="#FBBF24"/>
      <g stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round">
        <line x1="10" y1="3" x2="10" y2="4.5"/><line x1="3" y1="9" x2="4.5" y2="9"/>
        <line x1="15.5" y1="9" x2="17" y2="9"/>
        <line x1="5.4" y1="4.4" x2="6.5" y2="5.5"/><line x1="14.6" y1="4.4" x2="13.5" y2="5.5"/>
      </g>
      <path d="M19 14h-.2c-.4-1.8-2-3-3.8-3A4 4 0 0 0 11 14.2 3.5 3.5 0 0 0 12 21h7A2.5 2.5 0 0 0 19 14z" fill="#CBD5E1"/>
    </svg>
  );
}
function RainIcon({size=22}:{size?:number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 10h-.3C17.1 7.2 14.8 5 12 5A6 6 0 0 0 6.3 9.2 4.5 4.5 0 0 0 7.5 18h10.5A4 4 0 0 0 18 10z" fill="#94A3B8"/>
      <g stroke="#60A5FA" strokeWidth="1.6" strokeLinecap="round">
        <line x1="8" y1="19.5" x2="7" y2="21.5"/><line x1="12" y1="19.5" x2="11" y2="21.5"/><line x1="16" y1="19.5" x2="15" y2="21.5"/>
      </g>
    </svg>
  );
}
function SnowIcon({size=22}:{size?:number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 10h-.3C17.1 7.2 14.8 5 12 5A6 6 0 0 0 6.3 9.2 4.5 4.5 0 0 0 7.5 18h10.5A4 4 0 0 0 18 10z" fill="#CBD5E1"/>
      <g stroke="#BAE6FD" strokeWidth="1.5" strokeLinecap="round">
        <line x1="9" y1="20" x2="9" y2="22"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/>
      </g>
    </svg>
  );
}
function WeatherIcon({code,isDay,size=22}:{code:number;isDay:boolean;size?:number}) {
  if (code === 0) return isDay ? <SunIcon size={size}/> : <MoonIcon size={size}/>;
  if (code <= 2) return isDay ? <PartlyCloudyIcon size={size}/> : <MoonIcon size={size}/>;
  if (code <= 3) return <CloudIcon size={size}/>;
  if (code <= 48) return <CloudIcon size={size} color="#B0BEC5"/>;
  if (code <= 77) return code <= 67 ? <RainIcon size={size}/> : <SnowIcon size={size}/>;
  return <RainIcon size={size}/>;
}

// ─── CLOTHING STRIP ICON ──────────────────────────────────────────────────────
function ClothingStripIcon({ feel }: { feel: number }) {
  if (feel >= 24) return (
    <svg width={26} height={28} viewBox="0 0 26 28" fill="none">
      <path d="M9 2L5 6L9 9V24H17V9L21 6L17 2L15 4.5C14.3 5.4 13.7 5.8 13 5.8S11.7 5.4 11 4.5Z" fill="#4ADE80"/>
    </svg>
  );
  if (feel >= 18) return (
    <svg width={26} height={28} viewBox="0 0 26 28" fill="none">
      <path d="M9 2L4 6L9 10V24H17V10L22 6L17 2L15 4.5C14.3 5.4 13.7 5.8 13 5.8S11.7 5.4 11 4.5Z" fill="#60A5FA"/>
    </svg>
  );
  if (feel >= 12) return (
    <svg width={26} height={28} viewBox="0 0 26 28" fill="none">
      <path d="M9 2L4 6L9 10V24H13V17H13V24H17V10L22 6L17 2L15 4.5C14.3 5.4 13.7 5.8 13 5.8S11.7 5.4 11 4.5Z" fill="#FB923C"/>
      <line x1="13" y1="10" x2="13" y2="24" stroke="rgba(255,255,255,0.55)" strokeWidth="1"/>
    </svg>
  );
  return (
    <svg width={26} height={28} viewBox="0 0 26 28" fill="none">
      <path d="M8 2L3 6L8 10V26H13V18H13V26H18V10L23 6L18 2L15.5 4.5C14.7 5.4 13.9 5.8 13 5.8S11.3 5.4 10.5 4.5Z" fill="#818CF8"/>
      <line x1="13" y1="10" x2="13" y2="26" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
    </svg>
  );
}

// ─── HOURLY STRIP ─────────────────────────────────────────────────────────────
function HourlyStrip({ hourly, feelOffset, lang, currentHour }: { hourly:HourData[]; feelOffset:number; lang:Lang; currentHour:number }) {
  const [selHour,setSelHour]=useState(currentHour);
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(ref.current){
      const idx=hourly.findIndex(h=>h.localHour>=currentHour);
      if(idx>0) ref.current.scrollLeft=Math.max(0,(idx-1)*64);
    }
  },[]);

  const selData=hourly.find(h=>h.localHour===selHour)||hourly[0];
  const selFeel=(selData?.temp||0)+feelOffset;
  const selClothing=getClothingItems(selFeel);
  const t=TR[lang];

  return (
    <div style={{ background:C.card, borderRadius:16, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.1)", marginBottom:8 }}>
      {/* Scroll arrows + strip */}
      <div style={{ position:"relative" as const }}>
        <button dir="ltr" onClick={()=>ref.current&&(ref.current.scrollLeft-=200)} style={{ position:"absolute" as const, left:0, top:0, bottom:0, zIndex:2, background:"linear-gradient(to right,rgba(255,255,255,1) 60%,transparent)", border:"none", cursor:"pointer", padding:"0 14px 0 8px", fontSize:18, color:"#64748b", lineHeight:1 }}>‹</button>
        <button dir="ltr" onClick={()=>ref.current&&(ref.current.scrollLeft+=200)} style={{ position:"absolute" as const, right:0, top:0, bottom:0, zIndex:2, background:"linear-gradient(to left,rgba(255,255,255,1) 60%,transparent)", border:"none", cursor:"pointer", padding:"0 8px 0 14px", fontSize:18, color:"#64748b", lineHeight:1 }}>›</button>
      {/* Scrollable strip */}
      <div ref={ref} dir="ltr" style={{ overflowX:"auto", display:"flex", padding:"10px 28px 8px", scrollbarWidth:"none" as const }}>
        {hourly.map((h,i)=>{
          const isSel=h.localHour===selHour;
          return (
            <div key={i} onClick={()=>setSelHour(h.localHour)}
              style={{ display:"flex", flexDirection:"column" as const, alignItems:"center", gap:5, padding:"10px 10px", borderRadius:12, minWidth:62, flexShrink:0, cursor:"pointer",
                background:isSel?"rgba(30,58,110,0.1)":"transparent",
                borderBottom:isSel?"2.5px solid #1e3a6e":"2.5px solid transparent",
                transition:"all .15s" }}>
              <div style={{ fontSize:10, fontWeight:isSel?700:500, color:isSel?"#1e3a6e":"#64748b" }}>
                {String(h.localHour).padStart(2,"0")}:00
              </div>
              <WeatherIcon code={h.code} isDay={h.isDay} size={24}/>
              <div style={{ fontSize:13, fontWeight:700, color:isSel?"#1e3a6e":"#1e293b" }}>{h.temp}°</div>
            </div>
          );
        })}
      </div>
      </div>{/* end scroll wrapper */}

      {/* Recommendation panel for selected hour */}
      {selData && (
        <div style={{ borderTop:`1px solid ${C.border}`, padding:"12px 16px" }}>
          <div style={{ fontSize:11, color:C.textMuted, marginBottom:10, display:"flex", alignItems:"center", gap:6, direction:"ltr" }}>
            <span style={{ fontWeight:700, color:"#1e3a6e", fontSize:13 }}>{String(selHour).padStart(2,"0")}:00</span>
            <span>·</span>
            <span>{lang==="he"?"תחושה":"Feel"} {selFeel}°</span>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap" as const, gap:6 }}>
            {[
              `${t.pants}: ${selClothing.pants==="short"?t.pantsShort:t.pantsLong}`,
              `${t.shoes}: ${selClothing.shoes==="open"?t.shoesOpen:t.shoesClosed}`,
              `${t.shirt}: ${selClothing.shirt==="short"?t.shirtShort:t.shirtLong}`,
              ...(selClothing.outer?[selClothing.outer==="coat"?t.outerCoat:t.outerLight]:[]),
              ...(selClothing.accessories?[t.accessories]:[]),
            ].map((item,i)=>(
              <span key={i} style={{ padding:"4px 11px", background:"rgba(30,58,110,0.07)", borderRadius:20, fontSize:12, color:"#1e293b", fontWeight:500 }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RESULT CARD ──────────────────────────────────────────────────────────────
function ResultCard({ result, onChangCity, lang, email, onRateSubmit, onSkyChange }: {
  result:WeatherResult; onChangCity:()=>void; lang:Lang; email:string; onRateSubmit:(d:"today"|"tomorrow",r:number)=>void; onSkyChange:(sky:SkyTheme)=>void;
}) {
  const t=TR[lang];
  const [activeDay,setActiveDay]=useState<"today"|"tomorrow">("today");
  const [ratings,setRatings]=useState<{today?:number;tomorrow?:number}>({});
  const [rateSaved,setRateSaved]=useState<{today?:boolean;tomorrow?:boolean}>({});
  const [ratingDir,setRatingDir]=useState<{today?:string;tomorrow?:string}>({});

  const dayData=activeDay==="today"?result.today:result.tomorrow;
  const feel=activeDay==="today"?result.todayFeel:result.tomorrowFeel;
  const sky=getSkyTheme(feel);
  const _now=new Date(); const _tom=new Date(); _tom.setDate(_tom.getDate()+1);
  const _loc=lang==="he"?"he-IL":"en-US";
  const _opts:Intl.DateTimeFormatOptions={weekday:"long",day:"numeric",month:"long"};
  const dateStr=activeDay==="today"?_now.toLocaleDateString(_loc,_opts):_tom.toLocaleDateString(_loc,_opts);

  useEffect(()=>{ onSkyChange(sky); },[feel]);
  const clothing=getClothingItems(feel);

  async function submitRating(v:number) {
    setRatings(r=>({...r,[activeDay]:v})); setRateSaved(s=>({...s,[activeDay]:true}));
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
    <div style={{ animation:"fadeUp .4s cubic-bezier(.23,1,.32,1) both" }}>
      {/* Day tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:10, background:"rgba(255,255,255,0.15)", borderRadius:14, padding:4 }}>
        {(["today","tomorrow"] as const).map(d=>(
          <button key={d} onClick={()=>setActiveDay(d)} style={{ flex:1, padding:"9px", border:"none", borderRadius:10, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, transition:"all .2s", letterSpacing:"0.01em",
            background:activeDay===d?C.card:"transparent", color:activeDay===d?C.text:"rgba(255,255,255,0.65)",
            boxShadow:activeDay===d?"0 2px 8px rgba(0,0,0,0.12)":"none" }}>
            {d==="today"?t.todayTab:t.tomorrowTab}
          </button>
        ))}
      </div>

      {/* Sky hero */}
      <div style={{ borderRadius:20, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.15)", marginBottom:8 }}>
        <SkyHero sky={sky} feel={feel} cityHe={result.cityHe} dateStr={dateStr} lang={lang}/>

        {/* Temp strip */}
        <div style={{ background:C.card, display:"flex", justifyContent:"space-around", padding:"12px 16px", borderTop:`1px solid ${C.border}` }}>
          {([["min",`${dayData.min}°`],["avg",`${dayData.avg}°`],["max",`${dayData.max}°`],["feel",`${feel}°`]] as [keyof typeof t,string][]).map(([k,v],i)=>(
            <div key={k} style={{ textAlign:"center" }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" as const, color:C.textMuted, marginBottom:4 }}>{t[k] as string}</div>
              <div style={{ fontSize:17, fontWeight:700, color:i===3?"#1e3a6e":C.text }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly strip */}
      {(() => {
        const hourly = activeDay==="today" ? result.todayHourly : result.tomorrowHourly;
        if (!hourly?.length) return null;
        const currentHour = activeDay==="today" ? new Date().getHours() : 0;
        return <HourlyStrip hourly={hourly} feelOffset={result.feelOffset} lang={lang} currentHour={currentHour}/>;
      })()}

      {/* Details card */}
      <Card style={{ marginBottom:8 }}>
        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" as const }}>
          <LevelBadge label={t.uvIndex} level={dayData.uv} lang={lang}/>
          <LevelBadge label={t.wind} level={dayData.wind} lang={lang}/>
        </div>
        {(() => {
          const rec = getRecommendationText(feel, dayData.uv, dayData.wind, lang);
          return rec ? (
            <div style={{ fontSize:13, color:C.textSec, lineHeight:1.7, padding:"10px 12px", background:"rgba(30,58,110,0.05)", borderRadius:10, marginBottom:16, borderRight:`3px solid rgba(30,58,110,0.25)` }}>
              {rec}
            </div>
          ) : null;
        })()}
      </Card>

      {/* Rating card */}
      <Card style={{ marginBottom:8 }}>
        {!rateSaved[activeDay] ? (
          <>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" as const, color:C.textMuted, textAlign:"center", marginBottom:10 }}>{t.rateTitle}</div>
            <StarRating value={ratings[activeDay]||0} onChange={submitRating} saved={false}/>
          </>
        ) : (ratings[activeDay]||5)<=3 && !ratingDir[activeDay] ? (
          <>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" as const, color:C.textMuted, textAlign:"center", marginBottom:12 }}>
              {lang==="he"?"מה הייתה הבעיה?":"What was the issue?"}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>submitDirection("too_hot")} style={{ flex:1, padding:"10px", borderRadius:10, border:"1.5px solid #fed7aa", background:"#fff7ed", color:"#c2410c", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                {lang==="he"?"חם מדי":"Too hot"}
              </button>
              <button onClick={()=>submitDirection("too_cold")} style={{ flex:1, padding:"10px", borderRadius:10, border:"1.5px solid #bfdbfe", background:"#eff6ff", color:"#1d4ed8", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                {lang==="he"?"קר מדי":"Too cold"}
              </button>
            </div>
          </>
        ) : (
          <div style={{ fontSize:12, color:C.textMuted, textAlign:"center" }}>{t.rateSaved}</div>
        )}
      </Card>

      <button onClick={onChangCity} style={{ width:"100%", padding:"11px", background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:12, color:"rgba(255,255,255,0.65)", fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all .2s", letterSpacing:"0.02em" }}>
        {t.changeCity}
      </button>
    </div>
  );
}

// ─── PROFILE DRAWER ───────────────────────────────────────────────────────────
type AdminStats = { userCount:number; ratingCount:number; avgRating:number; tokenCostNis:number };

function AdminPanel() {
  const [stats,setStats]=useState<AdminStats|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    fetch("/api/admin/stats").then(r=>r.json()).then(d=>setStats(d)).finally(()=>setLoading(false));
  },[]);
  const row=(label:string,value:string)=>(
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid rgba(0,0,0,0.06)` }}>
      <span style={{ fontSize:12, color:"#64748b" }}>{label}</span>
      <span style={{ fontSize:14, fontWeight:700, color:"#1e293b" }}>{value}</span>
    </div>
  );
  return (
    <div style={{ marginTop:24 }}>
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:"#94a3b8", marginBottom:12 }}>Admin Dashboard</div>
      {loading ? <div style={{ fontSize:12, color:"#94a3b8", textAlign:"center", padding:"16px 0" }}>טוען...</div> : stats ? (
        <>
          <div style={{ background:"#f8fafc", borderRadius:12, padding:"4px 14px", border:"1px solid rgba(0,0,0,0.06)" }}>
            {row("משתמשים רשומים", String(stats.userCount))}
            {row("דירוגים שנשמרו", String(stats.ratingCount))}
            {row("ממוצע דירוג", stats.ratingCount ? `${stats.avgRating} / 5 ★` : "אין עדיין")}
            {row("עלות AI", "₪0 — ללא שימוש ב-AI")}
          </div>
        </>
      ) : <div style={{ fontSize:12, color:"#ef4444" }}>שגיאה בטעינה</div>}
    </div>
  );
}

function ProfileDrawer({ profile, lang, onClose, onSaved }: { profile:UserProfile; lang:Lang; onClose:()=>void; onSaved:(p:UserProfile)=>void }) {
  const t=TR[lang];
  const isAdmin=profile.email==="ofek@zewize.com";
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
      onSaved(u); setSaved(true); setEditing(false); setTimeout(()=>setSaved(false),3000);
    } catch {} setSaving(false);
  }
  async function detectLoc() {
    setLocLoading(true);
    try { const c=await detectCity(); if(c) setForm(f=>({...f,city:c})); } catch {} setLocLoading(false);
  }

  const rows=[{l:t.fullName,v:profile.name},{l:t.emailLabel,v:profile.email},{l:t.phone,v:profile.phone||"—"},{l:t.city,v:profile.city},{l:t.height,v:`${profile.height} ${t.heightUnit}`},{l:t.weight,v:`${profile.weight} ${t.weightUnit}`},{l:t.gender,v:profile.gender==="male"?t.male:t.female},{l:t.birthdate,v:profile.birthdate}];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex" }}>
      <div style={{ flex:1, background:"rgba(0,0,0,0.35)", backdropFilter:"blur(4px)" }} onClick={onClose}/>
      <div style={{ width:320, background:"#f8fafc", borderLeft:"1px solid #e2e8f0", height:"100%", overflowY:"auto", padding:"28px 22px", animation:"slideInRight .3s cubic-bezier(.23,1,.32,1)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <span style={{ fontSize:15, fontWeight:700, color:C.text }}>{t.profileMenu}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.textMuted, fontSize:18, cursor:"pointer" }}>✕</button>
        </div>
        {saved&&<div style={{ background:"#ecfdf5", border:"1px solid #a7f3d0", borderRadius:10, padding:"9px 14px", fontSize:12, color:"#065f46", marginBottom:16, textAlign:"center" }}>{t.profileUpdated}</div>}
        {!editing ? (
          <div>
            {rows.map(({l,v})=>(
              <div key={l} style={{ padding:"11px 0", borderBottom:`1px solid ${C.border}` }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" as const, color:C.textMuted, marginBottom:3 }}>{l}</div>
                <div style={{ fontSize:14, color:C.text }}>{v}</div>
              </div>
            ))}
            <button onClick={()=>setEditing(true)} style={{ width:"100%", marginTop:20, padding:"12px", background:"#1e3a6e", border:"none", borderRadius:12, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              {t.editProfile}
            </button>
            {isAdmin && <AdminPanel/>}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <FieldGroup label={t.fullName}><Input value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder={t.namePlaceholder}/></FieldGroup>
            <FieldGroup label={t.phone}><Input value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} placeholder={t.phonePlaceholder} ltr/></FieldGroup>
            <FieldGroup label={t.city}>
              <Input value={form.city} onChange={v=>setForm(f=>({...f,city:v}))} placeholder={t.cityPlaceholder}/>
              <button onClick={detectLoc} disabled={locLoading} style={{ marginTop:6, background:"none", border:`1px solid ${C.border}`, borderRadius:8, color:C.textSec, fontSize:11, padding:"7px 12px", cursor:"pointer", fontFamily:"inherit", textTransform:"uppercase" as const, letterSpacing:"0.06em" }}>
                {locLoading?t.detecting:t.detectLocation}
              </button>
            </FieldGroup>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <FieldGroup label={t.height}><Input value={form.height} onChange={v=>setForm(f=>({...f,height:v}))} type="number" placeholder="170" unit={t.heightUnit}/></FieldGroup>
              <FieldGroup label={t.weight}><Input value={form.weight} onChange={v=>setForm(f=>({...f,weight:v}))} type="number" placeholder="70" unit={t.weightUnit}/></FieldGroup>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:4 }}>
              <button onClick={()=>setEditing(false)} style={{ flex:1, padding:"11px", background:"#f1f5f9", border:"none", borderRadius:10, color:C.textSec, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>{t.cancelEdit}</button>
              <button onClick={save} disabled={saving} style={{ flex:2, padding:"11px", background:"#1e3a6e", border:"none", borderRadius:10, color:saving?"rgba(255,255,255,0.5)":"#fff", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{saving?"...":t.saveProfile}</button>
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
  const [activeSky,setActiveSky]=useState<SkyTheme>(getSkyTheme(20));

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
        weather.error==="city_not_found"?t.cityNotFound(fetchCity):weather.detail||t.weatherError
      );
      setLoadingMsg(t.calculating);
      const age=calcAge(p.birthdate); const bmi=calcBMI(+p.weight,+p.height);
      const{genderOffset,bmiOffset,ageOffset}=getOffsets(p.gender,bmi,age);
      const offset=genderOffset+bmiOffset+ageOffset+(corrRes.correction||0);
      const now=new Date(); const tom=new Date(); tom.setDate(tom.getDate()+1);
      const loc=lang==="he"?"he-IL":"en-US";
      const opts:Intl.DateTimeFormatOptions={weekday:"long",day:"numeric",month:"long"};
      const todayFeel=weather.today.avg+offset;
      setActiveSky(getSkyTheme(todayFeel));
      setResult({ today:{...weather.today}, tomorrow:{...weather.tomorrow}, cityHe:weather.cityHe,
        todayFeel, tomorrowFeel:weather.tomorrow.avg+offset,
        todayDateStr:now.toLocaleDateString(loc,opts), tomorrowDateStr:tom.toLocaleDateString(loc,opts),
        todayHourly:weather.todayHourly||[], tomorrowHourly:weather.tomorrowHourly||[],
        feelOffset:offset });
    }catch(e:unknown){setGlobalError(e instanceof Error?e.message:t.weatherError);}
    finally{setLoading(false);setLoadingMsg("");}
  }

  async function fetchWeather(fc:string){await doFetchWeather(fc,profile!);}
  async function fetchWeatherForProfile(p:UserProfile){await doFetchWeather(p.city,p);}

  async function useMyLocation(setter:(v:string)=>void){
    setLocLoading(true);
    try{const c=await detectCity();if(c)setter(c);else setGlobalError(t.locationFailed);}
    catch(e:unknown){const msg=e instanceof Error?e.message:"";setGlobalError(msg==="location_denied"?t.locationDenied:t.locationFailed);}
    finally{setLocLoading(false);}
  }

  function signOut(){localStorage.removeItem("tw_email");setProfile(null);setEmail("");setOtp("");setResult(null);setForm(EMPTY);setCity("");setView("auth_email");}

  const LoadingCard = (
    <Card>
      <div style={{ textAlign:"center", padding:"36px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
        <Spin/>
        {loadingMsg&&<div style={{ fontSize:12, color:C.textMuted, letterSpacing:"0.06em" }}>{loadingMsg}</div>}
      </div>
    </Card>
  );

  return (
    <div dir={isRtl?"rtl":"ltr"} style={{ minHeight:"100vh", fontFamily:"'Heebo', sans-serif",
      background:`linear-gradient(180deg, ${activeSky.sky1} 0%, ${activeSky.sky2} 55%, ${activeSky.sky3} 100%)`,
      transition:"background 1.5s ease",
      display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"28px 16px 56px" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes cloudDrift{from{transform:translateX(-160px)}to{transform:translateX(calc(100vw + 160px))}}
        @keyframes sunPulse{0%,100%{box-shadow:0 0 28px 10px rgba(255,200,60,0.3)}50%{box-shadow:0 0 44px 18px rgba(255,200,60,0.5)}}
        @keyframes twinkle{from{opacity:0.2}to{opacity:1}}
        @keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
        *{box-sizing:border-box;margin:0;padding:0;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input::placeholder{color:#94a3b8;}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:opacity(0.4);}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;}
        button{outline:none;}
      `}</style>

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:440 }}>

        {/* ── TOP BAR ── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, animation:"fadeIn .4s ease" }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.2em", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", marginBottom:4 }}>What2wear</div>
            <div style={{ fontSize:22, fontWeight:700, color:"#fff", letterSpacing:"-0.02em", lineHeight:1.2 }}>
              {view==="weather"&&profile ? t.hello(profile.name) : view==="auth_otp" ? t.enterOtp : view==="auth_register" ? t.register : t.whatToWear}
            </div>
            {view==="auth_email"&&<div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:3 }}>{t.tagline}</div>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, paddingTop:2 }}>
            <div style={{ display:"flex", background:"rgba(255,255,255,0.12)", borderRadius:20, padding:3, gap:2 }}>
              {(["he","en"] as Lang[]).map(l=>(
                <button key={l} onClick={()=>switchLang(l)} style={{ padding:"4px 10px", borderRadius:16, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"inherit", transition:"all .2s",
                  background:lang===l?"rgba(255,255,255,0.9)":"transparent", color:lang===l?"#1e3a6e":"rgba(255,255,255,0.5)" }}>
                  {l==="he"?"עב":"EN"}
                </button>
              ))}
            </div>
            {profile&&view==="weather"&&(
              <button onClick={()=>setSideMenuOpen(true)} style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:20, padding:"5px 12px", color:"rgba(255,255,255,0.75)", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.06em", textTransform:"uppercase" }}>
                {t.profileMenu}
              </button>
            )}
          </div>
        </div>

        {view==="weather"&&profile&&(
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10, marginTop:-12 }}>
            <button onClick={signOut} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.06em", textTransform:"uppercase" }}>
              {t.signOut}
            </button>
          </div>
        )}

        {/* ── EMAIL ── */}
        {view==="auth_email"&&(
          <Card>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <FieldGroup label={t.emailLabel} error={errors.email} required>
                <Input value={email} onChange={v=>{setEmail(v);setErrors({});setGlobalError("");}} type="email" placeholder={t.emailPlaceholder} ltr error={errors.email}/>
              </FieldGroup>
              {globalError&&<ErrBox>{globalError}</ErrBox>}
              <PrimaryBtn onClick={sendOtp} loading={loading}>{t.sendOtp}</PrimaryBtn>
              <div style={{ fontSize:11, color:C.textMuted, textAlign:"center", lineHeight:1.7 }}>{t.otpHint} · {t.firstTimeHint}</div>
            </div>
          </Card>
        )}

        {/* ── OTP ── */}
        {view==="auth_otp"&&(
          <Card>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ fontSize:13, color:C.textSec, textAlign:"center" }}>
                {t.codeSentTo}<strong style={{ color:C.text }}>{email}</strong>
              </div>
              <FieldGroup label={t.otpLabel} error={errors.otp} required>
                <Input value={otp} onChange={v=>{setOtp(v);setErrors({});setGlobalError("");}} type="text" placeholder={t.otpPlaceholder} ltr error={errors.otp}/>
              </FieldGroup>
              {globalError&&<ErrBox>{globalError}</ErrBox>}
              <PrimaryBtn onClick={verifyOtp} loading={loading}>{t.verifyBtn}</PrimaryBtn>
              <div style={{ textAlign:"center" }}><GhostBtn onClick={()=>{setView("auth_email");setOtp("");setGlobalError("");}}>{t.changeEmail}</GhostBtn></div>
            </div>
          </Card>
        )}

        {/* ── REGISTER ── */}
        {view==="auth_register"&&(
          <Card>
            <div style={{ fontSize:12, color:C.textMuted, marginBottom:18 }}>{t.savedHint}</div>
            <SectionHead text={t.personalInfo}/>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:4 }}>
              <FieldGroup label={t.fullName} error={errors.name} required>
                <Input value={form.name} onChange={setF("name")} placeholder={t.namePlaceholder} error={errors.name}/>
              </FieldGroup>
              <FieldGroup label={t.phone}>
                <Input value={form.phone} onChange={setF("phone")} type="tel" placeholder={t.phonePlaceholder} ltr/>
              </FieldGroup>
            </div>
            <Divider/>
            <SectionHead text={t.bodyData}/>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:4 }}>
              <FieldGroup label={t.gender} error={errors.gender} required>
                <div style={{ display:"flex", gap:8 }}>
                  {([["male",t.male],["female",t.female]] as [string,string][]).map(([val,lbl])=>(
                    <button key={val} onClick={()=>setF("gender")(val)} style={{ flex:1, padding:"11px", borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit", border:"1.5px solid", transition:"all .2s",
                      borderColor:form.gender===val?"#1e3a6e":errors.gender?"#fca5a5":C.border,
                      background:form.gender===val?"#eff6ff":C.inputBg, color:form.gender===val?"#1e3a6e":C.textSec }}>{lbl}</button>
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
            <SectionHead text={t.locationSection}/>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
              <FieldGroup label={t.city} error={errors.city} required>
                <Input value={city} onChange={v=>{setCity(v);setErrors(e=>({...e,city:""}));}} placeholder={t.cityPlaceholder} error={errors.city}/>
              </FieldGroup>
              <OutlineBtn onClick={()=>useMyLocation(setCity)} loading={locLoading}>{locLoading?t.detecting:t.detectLocation}</OutlineBtn>
            </div>
            {globalError&&<><ErrBox>{globalError}</ErrBox><div style={{ height:14 }}/></>}
            <PrimaryBtn onClick={saveProfile} loading={loading}>{t.saveBtn}</PrimaryBtn>
          </Card>
        )}

        {/* ── WEATHER ── */}
        {view==="weather"&&profile&&(
          result ? (
            <ResultCard result={result} onChangCity={()=>{setResult(null);setGlobalError("");setChangingCity(true);setActiveSky(getSkyTheme(20));}} lang={lang} email={email} onRateSubmit={()=>{}} onSkyChange={setActiveSky}/>
          ) : loading ? LoadingCard
          : changingCity ? (
            <Card>
              <SectionHead text={t.cityForForecast}/>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <FieldGroup label={t.city} error={errors.city}>
                  <Input value={city} onChange={v=>{setCity(v);setErrors(e=>({...e,city:""}));setGlobalError("");}} placeholder={profile.city} error={errors.city}/>
                </FieldGroup>
                <OutlineBtn onClick={()=>useMyLocation(setCity)} loading={locLoading}>{locLoading?t.detecting:t.detectLocation}</OutlineBtn>
                {globalError&&<ErrBox>{globalError}</ErrBox>}
                <PrimaryBtn onClick={()=>fetchWeather(city||profile.city)}>{t.getRecommendation}</PrimaryBtn>
              </div>
            </Card>
          ) : globalError ? (
            <Card>
              <div style={{ textAlign:"center", padding:"20px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" as const, color:"#dc2626" }}>שגיאה</div>
                <div style={{ fontSize:14, color:"#ef4444", lineHeight:1.6 }}>{globalError}</div>
                <PrimaryBtn onClick={()=>fetchWeatherForProfile(profile)}>{t.getRecommendation}</PrimaryBtn>
              </div>
            </Card>
          ) : LoadingCard
        )}

        <div style={{ textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.2)", marginTop:20, letterSpacing:"0.12em", textTransform:"uppercase" }}>{t.footer}</div>
      </div>

      {sideMenuOpen&&profile&&(
        <ProfileDrawer profile={profile} lang={lang} onClose={()=>setSideMenuOpen(false)}
          onSaved={p=>{setProfile(p);if(result)doFetchWeather(p.city,p);}}/>
      )}
    </div>
  );
}
