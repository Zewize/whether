"use client";
import { useState, useEffect } from "react";
import type { UserProfile } from "@/lib/excel-db";

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
type Lang = "he" | "en";
const TR = {
  he: {
    appName:"What2wear", tagline:"המלצת לבוש אישית לפי מזג האוויר",
    whatToWear:"מה ללבוש?", enterOtp:"הזן קוד אימות", register:"ספר לנו קצת עליך",
    hello:(n:string)=>`שלום ${n} 👋`,
    emailLabel:"כתובת מייל", emailPlaceholder:"you@example.com", invalidEmail:"מייל לא תקין",
    sendOtp:"שלח קוד אימות 📨",
    codeSentTo:"שלחנו קוד ל-", otpLabel:"קוד אימות (6 ספרות)", otpPlaceholder:"123456",
    otpRequired:"יש להזין את הקוד שנשלח", verifyBtn:"אמת והיכנס ✓", changeEmail:"← שנה מייל",
    otpHint:"הקוד תקף ל-10 דקות", firstTimeHint:"פעם ראשונה? תמלא פרטים קצרים אחרי האימות.",
    savedHint:"פרטים אלה יישמרו לשימוש הבא",
    personalInfo:"פרטים אישיים", fullName:"שם מלא", namePlaceholder:"ישראל ישראלי", nameRequired:"שדה חובה",
    phone:"טלפון", phonePlaceholder:"050-0000000",
    bodyData:"נתוני גוף", gender:"מגדר", male:"♂ זכר", female:"♀ נקבה", genderRequired:"יש לבחור מגדר",
    birthdate:"תאריך לידה", birthdateRequired:"שדה חובה", invalidDate:"תאריך לא תקין",
    height:"גובה", heightUnit:'ס"מ', heightInvalid:"ערך לא תקין",
    weight:"משקל", weightUnit:'ק"ג', weightInvalid:"ערך לא תקין",
    locationSection:"מיקום", city:"עיר", cityPlaceholder:"תל אביב / ירושלים...", cityRequired:"יש להזין עיר",
    detectLocation:"📍 זהה מיקום אוטומטית", detecting:"⏳ מאתר...",
    saveBtn:"שמור והמשך 🌡️", getRecommendation:"קבל את ההמלצה שלי 🌡️",
    loading:"טוען...", searching:"🔍 מחפש תחזית מזג אוויר...", calculating:"🧮 מחשב תחושה אישית...",
    signOut:"← התנתק", changeCity:"📍 שנה עיר לתחזית", cityForForecast:"עיר לתחזית",
    todayTab:"היום", tomorrowTab:"מחר",
    clothingRec:"המלצת לבוש", uvIndex:"אינדקס UV", wind:"רוח",
    low:"נמוך", medium:"בינוני", high:"גבוה",
    pants:"מכנסיים", pantsShort:"קצרים", pantsLong:"ארוכים",
    shoes:"נעליים", shoesOpen:"פתוחות", shoesClosed:"סגורות",
    shirt:"חולצה", shirtShort:"קצרה", shirtLong:"ארוכה",
    outerLight:"עליונית דקה", outerCoat:"מעיל", noOuter:"ללא שכבה עליונה",
    accessories:"כובע צמר וכפפות",
    min:"מינ׳", avg:"ממוצע", max:"מקס׳", feel:"תחושה",
    rateTitle:"איך הייתה ההמלצה?", rateSaved:"תודה על הדירוג! ✓",
    profileMenu:"הפרופיל שלי", editProfile:"ערוך פרטים", saveProfile:"שמור", cancelEdit:"ביטול",
    profileUpdated:"הפרופיל עודכן ✓",
    locationDenied:"יש לאשר גישה למיקום בדפדפן", locationFailed:"לא הצלחנו לאתר מיקום",
    cityNotFound:(c:string)=>`לא מצאנו את העיר "${c}"`,
    weatherError:"שגיאה בקבלת תחזית", saveError:"שגיאה בשמירה",
    otpError:"קוד שגוי, נסה שוב", sendError:"שגיאה בשליחת קוד",
    footer:"מבוסס על פיזיולוגיה תרמית · תנאי חוץ בלבד",
    recLabels:{ hot:"חם מאוד", warm:"חמים ונעים", pleasant:"נעים", cool:"קריר", chilly:"קר מעט", cold:"קר" },
  },
  en: {
    appName:"What2wear", tagline:"Personal clothing recommendation by weather",
    whatToWear:"What to wear?", enterOtp:"Enter verification code", register:"Tell us about yourself",
    hello:(n:string)=>`Hello ${n} 👋`,
    emailLabel:"Email address", emailPlaceholder:"you@example.com", invalidEmail:"Invalid email",
    sendOtp:"Send verification code 📨",
    codeSentTo:"We sent a code to ", otpLabel:"Verification code (6 digits)", otpPlaceholder:"123456",
    otpRequired:"Please enter the code sent to you", verifyBtn:"Verify & Login ✓", changeEmail:"← Change email",
    otpHint:"Code valid for 10 minutes", firstTimeHint:"First time? You'll fill in details after verification.",
    savedHint:"These details will be saved for next time",
    personalInfo:"Personal details", fullName:"Full name", namePlaceholder:"John Doe", nameRequired:"Required",
    phone:"Phone", phonePlaceholder:"+1-555-0000",
    bodyData:"Body data", gender:"Gender", male:"♂ Male", female:"♀ Female", genderRequired:"Please select a gender",
    birthdate:"Date of birth", birthdateRequired:"Required", invalidDate:"Invalid date",
    height:"Height", heightUnit:"cm", heightInvalid:"Invalid value",
    weight:"Weight", weightUnit:"kg", weightInvalid:"Invalid value",
    locationSection:"Location", city:"City", cityPlaceholder:"New York / London...", cityRequired:"Please enter a city",
    detectLocation:"📍 Detect my location", detecting:"⏳ Detecting...",
    saveBtn:"Save & Continue 🌡️", getRecommendation:"Get my recommendation 🌡️",
    loading:"Loading...", searching:"🔍 Searching weather forecast...", calculating:"🧮 Calculating personal feel...",
    signOut:"Sign out →", changeCity:"📍 Change city for forecast", cityForForecast:"City for forecast",
    todayTab:"Today", tomorrowTab:"Tomorrow",
    clothingRec:"Clothing recommendation", uvIndex:"UV Index", wind:"Wind",
    low:"Low", medium:"Medium", high:"High",
    pants:"Pants", pantsShort:"Short", pantsLong:"Long",
    shoes:"Shoes", shoesOpen:"Open", shoesClosed:"Closed",
    shirt:"Shirt", shirtShort:"Short sleeve", shirtLong:"Long sleeve",
    outerLight:"Light jacket", outerCoat:"Coat", noOuter:"No outer layer",
    accessories:"Wool hat & gloves",
    min:"Min", avg:"Avg", max:"Max", feel:"Feel",
    rateTitle:"How was the recommendation?", rateSaved:"Thanks for rating! ✓",
    profileMenu:"My Profile", editProfile:"Edit details", saveProfile:"Save", cancelEdit:"Cancel",
    profileUpdated:"Profile updated ✓",
    locationDenied:"Please allow location access in your browser", locationFailed:"Could not detect location",
    cityNotFound:(c:string)=>`City "${c}" not found`,
    weatherError:"Error fetching forecast", saveError:"Error saving",
    otpError:"Wrong code, try again", sendError:"Error sending code",
    footer:"Based on thermal physiology · Outdoor conditions only",
    recLabels:{ hot:"Very Hot", warm:"Warm & Pleasant", pleasant:"Pleasant", cool:"Cool", chilly:"Slightly Cold", cold:"Cold" },
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
function calcBMI(weight: number, height_cm: number) { const h = height_cm/100; return weight/(h*h); }
function getOffsets(gender: string, bmi: number, age: number) {
  return { genderOffset: gender==="female"?-2:0, bmiOffset: bmi<18.5?-2:bmi>26?2:0, ageOffset: age>60?-1:0 };
}
function getVisual(feelTemp: number, lang: Lang) {
  const L = TR[lang].recLabels;
  if (feelTemp>=30) return { label:L.hot, emoji:"☀️", color:"#FF6B35", sky:["#FF8C00","#FFB347","#FFA500"] as [string,string,string], sun:true };
  if (feelTemp>=26) return { label:L.warm, emoji:"⛅", color:"#F4A261", sky:["#87CEEB","#FDB97D","#F4A261"] as [string,string,string], sun:true };
  if (feelTemp>=21) return { label:L.pleasant, emoji:"🌤️", color:"#2EC4B6", sky:["#74B9FF","#0984E3","#2EC4B6"] as [string,string,string], sun:true };
  if (feelTemp>=16) return { label:L.cool, emoji:"🌥️", color:"#74B9FF", sky:["#636E72","#B2BEC3","#74B9FF"] as [string,string,string], sun:false };
  if (feelTemp>=11) return { label:L.chilly, emoji:"🌬️", color:"#A29BFE", sky:["#2D3436","#636E72","#A29BFE"] as [string,string,string], sun:false };
  return { label:L.cold, emoji:"❄️", color:"#74B9FF", sky:["#0F3460","#16213E","#74B9FF"] as [string,string,string], sun:false };
}

type ClothingItems = { pants:"long"|"short"; shoes:"closed"|"open"; shirt:"long"|"short"; outer:"coat"|"light"|null; accessories:boolean };
function getClothingItems(feelTemp: number): ClothingItems {
  return {
    pants: feelTemp>=24?"short":"long",
    shoes: feelTemp>=26?"open":"closed",
    shirt: feelTemp>=22?"short":"long",
    outer: feelTemp>=22?null:feelTemp>=14?"light":"coat",
    accessories: feelTemp<=8,
  };
}

// ─── GEOLOCATION ──────────────────────────────────────────────────────────────
async function getCityFromCoords(lat: number, lon: number): Promise<string> {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=he`, { headers:{"User-Agent":"What2wear/1.0"} });
  const data = await res.json();
  return data.address?.city||data.address?.town||data.address?.village||data.address?.county||"";
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

// ─── SKY ──────────────────────────────────────────────────────────────────────
function Cloud({top,left,scale,speed,opacity}:{top:string;left:string;scale:number;speed:number;opacity:number}) {
  return (
    <div style={{position:"absolute",top,left,opacity,animation:`drift ${speed}s linear infinite`,transform:`scale(${scale})`,transformOrigin:"left center"}}>
      <div style={{position:"relative",width:84,height:32}}>
        <div style={{position:"absolute",bottom:0,left:10,width:64,height:22,borderRadius:22,background:"rgba(255,255,255,0.92)"}}/>
        <div style={{position:"absolute",bottom:10,left:22,width:38,height:30,borderRadius:"50%",background:"rgba(255,255,255,0.92)"}}/>
        <div style={{position:"absolute",bottom:10,left:8,width:30,height:24,borderRadius:"50%",background:"rgba(255,255,255,0.88)"}}/>
      </div>
    </div>
  );
}
function SkyBackground({colors,sun}:{colors:[string,string,string];sun:boolean}) {
  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",zIndex:0}}>
      <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,${colors[0]} 0%,${colors[1]} 55%,${colors[2]} 100%)`,transition:"background 1.2s ease"}}/>
      {!sun&&[1,2,3,4,5,6,7,8].map(i=>(
        <div key={i} style={{position:"absolute",width:i%3===0?3:2,height:i%3===0?3:2,borderRadius:"50%",background:"rgba(255,255,255,0.8)",top:`${6+i*9}%`,left:`${8+i*12}%`,animation:`twinkle ${1+i*0.3}s ease-in-out infinite alternate`}}/>
      ))}
      {sun&&<div style={{position:"absolute",top:20,left:28,width:60,height:60,borderRadius:"50%",background:"radial-gradient(circle,#FFE066,#FF9F1C)",boxShadow:"0 0 48px 22px rgba(255,200,50,0.4)",animation:"sunPulse 3s ease-in-out infinite"}}/>}
      <Cloud top="14%" left="52%" scale={1.2} speed={32} opacity={0.88}/>
      <Cloud top="30%" left="8%" scale={0.75} speed={46} opacity={0.75}/>
      <Cloud top="8%" left="28%" scale={0.55} speed={58} opacity={0.65}/>
    </div>
  );
}

// ─── UI HELPERS ───────────────────────────────────────────────────────────────
function SectionLabel({icon,text}:{icon:string;text:string}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
      <span style={{fontSize:14}}>{icon}</span>
      <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",textTransform:"uppercase"}}>{text}</span>
      <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
    </div>
  );
}
function FieldWrap({label,error,required,children}:{label:string;error?:string;required?:boolean;children:React.ReactNode}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <label style={{fontSize:11,fontWeight:700,color:error?"#FF6B6B":"rgba(255,255,255,0.3)",letterSpacing:"0.08em",textTransform:"uppercase"}}>
        {label}{required&&<span style={{color:"#F4A261",marginRight:3}}>*</span>}
      </label>
      {children}
      {error&&<p style={{fontSize:11,color:"#FF6B6B"}}>⚠ {error}</p>}
    </div>
  );
}
function TextInput({value,onChange,type="text",placeholder,unit,ltr,error}:{value:string;onChange:(v:string)=>void;type?:string;placeholder?:string;unit?:string;ltr?:boolean;error?:string}) {
  const [focused,setFocused]=useState(false);
  return (
    <div style={{position:"relative"}}>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        max={type==="date"?new Date().toISOString().split("T")[0]:undefined}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{width:"100%",padding:unit?"13px 14px 13px 44px":"13px 14px",background:"rgba(255,255,255,0.05)",
          border:`1.5px solid ${error?"#FF6B6B":focused?"#F4A261":value?"rgba(244,162,97,0.4)":"rgba(255,255,255,0.08)"}`,
          borderRadius:12,fontSize:15,color:"#fff",fontFamily:"inherit",outline:"none",transition:"border-color .2s",
          direction:ltr?"ltr":"rtl",textAlign:ltr?"left":"right",WebkitAppearance:"none"}}
      />
      {unit&&<span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.25)",fontSize:12,pointerEvents:"none"}}>{unit}</span>}
    </div>
  );
}
function PrimaryBtn({onClick,loading,children}:{onClick:()=>void;loading?:boolean;children:React.ReactNode}) {
  return (
    <button onClick={onClick} disabled={loading} style={{width:"100%",padding:"16px",border:"none",borderRadius:14,
      background:loading?"rgba(255,255,255,0.06)":"linear-gradient(135deg,#F4A261,#E85D04)",
      color:loading?"rgba(255,255,255,0.35)":"#fff",fontSize:16,fontWeight:800,cursor:loading?"not-allowed":"pointer",
      fontFamily:"inherit",transition:"all .25s",boxShadow:loading?"none":"0 8px 28px rgba(244,162,97,0.4)",
      display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
      {loading?(<><span style={{width:18,height:18,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,0.15)",borderTopColor:"#F4A261",display:"inline-block",animation:"spin .7s linear infinite"}}/>טוען...</>):children}
    </button>
  );
}
function Card({children}:{children:React.ReactNode}) {
  return (
    <div style={{background:"rgba(10,18,30,0.78)",backdropFilter:"blur(22px)",borderRadius:24,border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 32px 80px rgba(0,0,0,0.55)",overflow:"hidden",animation:"slideUp .5s cubic-bezier(.23,1,.32,1) both"}}>
      <div style={{height:3,background:"linear-gradient(90deg,#74B9FF,#F4A261,#FF6B35)"}}/>
      <div style={{padding:"26px 24px 30px"}}>{children}</div>
    </div>
  );
}
function ErrorBox({children,style}:{children:React.ReactNode;style?:React.CSSProperties}) {
  return <div style={{background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.3)",borderRadius:12,padding:"12px 16px",fontSize:13,color:"#FF8080",...style}}>⚠ {children}</div>;
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({label,level,lang}:{label:string;level:"low"|"medium"|"high";lang:Lang}) {
  const t=TR[lang];
  const colors = {low:"#2EC4B6",medium:"#F4A261",high:"#FF6B35"};
  const c = colors[level];
  const txt = level==="low"?t.low:level==="medium"?t.medium:t.high;
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:20,background:`${c}18`,border:`1px solid ${c}55`}}>
      <span style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>{label}</span>
      <span style={{fontSize:12,fontWeight:800,color:c}}>{txt}</span>
    </div>
  );
}

// ─── CLOTHING DISPLAY ─────────────────────────────────────────────────────────
function ClothingDisplay({items,lang}:{items:ClothingItems;lang:Lang}) {
  const t=TR[lang];
  const rows=[
    {icon:"👖",label:t.pants,value:items.pants==="short"?t.pantsShort:t.pantsLong},
    {icon:"👟",label:t.shoes,value:items.shoes==="open"?t.shoesOpen:t.shoesClosed},
    {icon:"👕",label:t.shirt,value:items.shirt==="short"?t.shirtShort:t.shirtLong},
    ...(items.outer?[{icon:items.outer==="coat"?"🧥":"🫧",label:items.outer==="coat"?t.outerCoat:t.outerLight,value:""}]:[]),
    ...(items.accessories?[{icon:"🧤",label:t.accessories,value:""}]:[]),
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {rows.map((r,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 12px",background:"rgba(255,255,255,0.03)",borderRadius:10}}>
          <span style={{fontSize:16}}>{r.icon}</span>
          <span style={{flex:1,fontSize:13,color:"rgba(255,255,255,0.7)"}}>{r.label}</span>
          {r.value&&<span style={{fontSize:12,fontWeight:700,color:"#F4A261"}}>{r.value}</span>}
        </div>
      ))}
    </div>
  );
}

// ─── STAR RATING ──────────────────────────────────────────────────────────────
function StarRating({value,onChange,saved}:{value:number;onChange:(v:number)=>void;saved:boolean}) {
  const [hover,setHover]=useState(0);
  return (
    <div style={{display:"flex",gap:4,justifyContent:"center"}}>
      {[1,2,3,4,5].map(s=>(
        <button key={s} onClick={()=>!saved&&onChange(s)} onMouseEnter={()=>!saved&&setHover(s)} onMouseLeave={()=>setHover(0)}
          style={{background:"none",border:"none",fontSize:28,cursor:saved?"default":"pointer",transition:"transform .15s",
            transform:(hover||value)>=s?"scale(1.2)":"scale(1)",
            filter:(hover||value)>=s?"drop-shadow(0 0 6px #F4A261)":"none"}}>
          {(hover||value)>=s?"⭐":"☆"}
        </button>
      ))}
    </div>
  );
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
type DayWeather = { min:number; max:number; avg:number; uv:"low"|"medium"|"high"; wind:"low"|"medium"|"high" };
type WeatherResult = {
  today: DayWeather; tomorrow: DayWeather; cityHe: string;
  todayFeel:number; tomorrowFeel:number;
  todayDateStr:string; tomorrowDateStr:string;
};

// ─── RESULT CARD ──────────────────────────────────────────────────────────────
function ResultCard({result,onChangCity,lang,email,onRateSubmit}:{result:WeatherResult;onChangCity:()=>void;lang:Lang;email:string;onRateSubmit:(day:"today"|"tomorrow",rating:number)=>void}) {
  const t=TR[lang];
  const [activeDay,setActiveDay]=useState<"today"|"tomorrow">("today");
  const [ratings,setRatings]=useState<{today?:number;tomorrow?:number}>({});
  const [rateSaved,setRateSaved]=useState<{today?:boolean;tomorrow?:boolean}>({});
  const [ratingDir,setRatingDir]=useState<{today?:string;tomorrow?:string}>({});

  const dayData = activeDay==="today"?result.today:result.tomorrow;
  const feelTemp = activeDay==="today"?result.todayFeel:result.tomorrowFeel;
  const dateStr = activeDay==="today"?result.todayDateStr:result.tomorrowDateStr;
  const vis = getVisual(feelTemp, lang);
  const clothing = getClothingItems(feelTemp);

  async function submitRating(v:number) {
    setRatings(r=>({...r,[activeDay]:v}));
    setRateSaved(s=>({...s,[activeDay]:true}));
    try {
      await fetch("/api/ratings/save",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,city:result.cityHe,day:activeDay,rating:v,feel_temp:feelTemp,direction:""})});
      onRateSubmit(activeDay,v);
    } catch {}
  }

  async function submitDirection(dir:"too_hot"|"too_cold") {
    setRatingDir(d=>({...d,[activeDay]:dir}));
    try {
      await fetch("/api/ratings/save",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,city:result.cityHe,day:activeDay,rating:ratings[activeDay],feel_temp:feelTemp,direction:dir})});
    } catch {}
  }

  return (
    <div style={{animation:"slideUp .6s cubic-bezier(.23,1,.32,1) both"}}>
      {/* Day tabs */}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {(["today","tomorrow"] as const).map(d=>(
          <button key={d} onClick={()=>setActiveDay(d)} style={{flex:1,padding:"10px",border:"none",borderRadius:14,cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:700,transition:"all .2s",
            background:activeDay===d?"linear-gradient(135deg,#F4A261,#E85D04)":"rgba(255,255,255,0.06)",
            color:activeDay===d?"#fff":"rgba(255,255,255,0.4)",
            boxShadow:activeDay===d?"0 4px 16px rgba(244,162,97,0.35)":"none"}}>
            {d==="today"?t.todayTab:t.tomorrowTab}
          </button>
        ))}
      </div>

      <div style={{position:"relative",borderRadius:"24px 24px 0 0",overflow:"hidden",minHeight:220,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",padding:"0 24px 28px"}}>
        <SkyBackground colors={vis.sky} sun={vis.sun}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
          <div style={{fontSize:54,filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.35))",animation:"float 3s ease-in-out infinite"}}>{vis.emoji}</div>
          <div style={{fontSize:76,fontWeight:900,color:"#fff",lineHeight:1,textShadow:"0 4px 28px rgba(0,0,0,0.45)",marginTop:4}}>{feelTemp}°</div>
          <div style={{fontSize:16,color:"rgba(255,255,255,0.9)",fontWeight:700}}>{vis.label}</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginTop:6}}>{result.cityHe} · {dateStr}</div>
        </div>
      </div>

      {/* Temp strip */}
      <div style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(12px)",padding:"12px 20px",display:"flex",justifyContent:"space-around",borderRight:`4px solid ${vis.color}`}}>
        {([["min",`${dayData.min}°`],["avg",`${dayData.avg}°`],["max",`${dayData.max}°`],["feel",`${feelTemp}°`]] as [keyof typeof t,string][]).map(([k,v],i)=>(
          <div key={k} style={{textAlign:"center"}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",letterSpacing:"0.07em",textTransform:"uppercase"}}>{t[k] as string}</div>
            <div style={{fontSize:20,fontWeight:800,color:i===3?vis.color:"#fff"}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{background:"#0f1923",padding:"20px 22px 26px",borderRadius:"0 0 24px 24px"}}>
        {/* UV + Wind badges */}
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <Badge label={`☀️ ${t.uvIndex}`} level={dayData.uv} lang={lang}/>
          <Badge label={`💨 ${t.wind}`} level={dayData.wind} lang={lang}/>
        </div>

        {/* Clothing */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:vis.color,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,marginBottom:8}}>👕 {t.clothingRec}</div>
          <ClothingDisplay items={clothing} lang={lang}/>
        </div>

        {/* Star rating */}
        <div style={{background:"rgba(255,255,255,0.03)",borderRadius:16,padding:"14px 16px",marginBottom:16}}>
          {!rateSaved[activeDay] ? (
            <>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",textAlign:"center",marginBottom:8}}>{t.rateTitle}</div>
              <StarRating value={ratings[activeDay]||0} onChange={submitRating} saved={false}/>
            </>
          ) : (ratings[activeDay]||5) <= 3 && !ratingDir[activeDay] ? (
            <>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",textAlign:"center",marginBottom:10}}>
                {lang==="he"?"מה הייתה הבעיה?":"What was the issue?"}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>submitDirection("too_hot")} style={{flex:1,padding:"10px",borderRadius:12,border:"1px solid rgba(255,107,53,0.4)",background:"rgba(255,107,53,0.1)",color:"#FF6B35",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  🥵 {lang==="he"?"חם מדי":"Too hot"}
                </button>
                <button onClick={()=>submitDirection("too_cold")} style={{flex:1,padding:"10px",borderRadius:12,border:"1px solid rgba(116,185,255,0.4)",background:"rgba(116,185,255,0.1)",color:"#74B9FF",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  🥶 {lang==="he"?"קר מדי":"Too cold"}
                </button>
              </div>
            </>
          ) : (
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",textAlign:"center"}}>{t.rateSaved}</div>
          )}
        </div>

        <button onClick={onChangCity} style={{width:"100%",padding:"13px",background:"transparent",border:"1px solid #1a2535",borderRadius:14,color:"#778",fontSize:14,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}
          onMouseOver={e=>(e.currentTarget.style.borderColor="#2a3545")}
          onMouseOut={e=>(e.currentTarget.style.borderColor="#1a2535")}>
          {t.changeCity}
        </button>
      </div>
    </div>
  );
}

// ─── PROFILE MENU (side drawer) ───────────────────────────────────────────────
function ProfileMenu({profile,lang,onClose,onSaved}:{profile:UserProfile;lang:Lang;onClose:()=>void;onSaved:(p:UserProfile)=>void}) {
  const t=TR[lang];
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({name:profile.name,phone:profile.phone,city:profile.city,height:profile.height,weight:profile.weight});
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [locLoading,setLocLoading]=useState(false);

  async function save() {
    setSaving(true);
    try {
      const updated:UserProfile={...profile,...form};
      await fetch("/api/users/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(updated)});
      onSaved(updated); setSaved(true); setEditing(false);
      setTimeout(()=>setSaved(false),3000);
    } catch {}
    setSaving(false);
  }

  async function detectLoc() {
    setLocLoading(true);
    try { const c=await detectCity(); if(c) setForm(f=>({...f,city:c})); } catch {}
    setLocLoading(false);
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex"}}>
      <div style={{flex:1,background:"rgba(0,0,0,0.5)"}} onClick={onClose}/>
      <div style={{width:320,background:"#0d1b2e",borderLeft:"1px solid rgba(255,255,255,0.08)",height:"100%",overflowY:"auto",padding:"28px 24px",animation:"slideInRight .3s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <span style={{fontSize:16,fontWeight:800,color:"#fff"}}>👤 {t.profileMenu}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>

        {saved&&<div style={{background:"rgba(46,196,182,0.1)",border:"1px solid rgba(46,196,182,0.3)",borderRadius:12,padding:"10px 14px",fontSize:13,color:"#2EC4B6",marginBottom:16}}>✓ {t.profileUpdated}</div>}

        {!editing?(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[
              {label:t.fullName,val:profile.name},
              {label:t.emailLabel,val:profile.email},
              {label:t.phone,val:profile.phone||"–"},
              {label:t.city,val:profile.city},
              {label:t.height,val:`${profile.height} ${t.heightUnit}`},
              {label:t.weight,val:`${profile.weight} ${t.weightUnit}`},
              {label:t.gender,val:profile.gender==="male"?t.male:t.female},
              {label:t.birthdate,val:profile.birthdate},
            ].map(({label,val})=>(
              <div key={label} style={{padding:"10px 14px",background:"rgba(255,255,255,0.04)",borderRadius:12}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div>
                <div style={{fontSize:14,color:"#fff"}}>{val}</div>
              </div>
            ))}
            <button onClick={()=>setEditing(true)} style={{marginTop:8,padding:"13px",background:"linear-gradient(135deg,#F4A261,#E85D04)",border:"none",borderRadius:14,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              ✏️ {t.editProfile}
            </button>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <FieldWrap label={t.fullName}><TextInput value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder={t.namePlaceholder}/></FieldWrap>
            <FieldWrap label={t.phone}><TextInput value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} placeholder={t.phonePlaceholder} ltr/></FieldWrap>
            <FieldWrap label={t.city}>
              <TextInput value={form.city} onChange={v=>setForm(f=>({...f,city:v}))} placeholder={t.cityPlaceholder}/>
              <button onClick={detectLoc} disabled={locLoading} style={{marginTop:6,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"rgba(255,255,255,0.4)",fontSize:12,padding:"7px 12px",cursor:"pointer",fontFamily:"inherit",opacity:locLoading?0.5:1}}>
                {locLoading?t.detecting:t.detectLocation}
              </button>
            </FieldWrap>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <FieldWrap label={t.height}><TextInput value={form.height} onChange={v=>setForm(f=>({...f,height:v}))} type="number" placeholder="170" unit={t.heightUnit}/></FieldWrap>
              <FieldWrap label={t.weight}><TextInput value={form.weight} onChange={v=>setForm(f=>({...f,weight:v}))} type="number" placeholder="70" unit={t.weightUnit}/></FieldWrap>
            </div>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button onClick={()=>setEditing(false)} style={{flex:1,padding:"12px",background:"rgba(255,255,255,0.06)",border:"none",borderRadius:12,color:"rgba(255,255,255,0.5)",fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>{t.cancelEdit}</button>
              <button onClick={save} disabled={saving} style={{flex:2,padding:"12px",background:"linear-gradient(135deg,#F4A261,#E85D04)",border:"none",borderRadius:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",opacity:saving?0.7:1}}>{saving?"...":t.saveProfile}</button>
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
        if (data?.email){
          setProfile(data);
          setEmail(saved);
          setView("weather");
          setTimeout(()=>fetchWeatherForProfile(data),100);
        }
      }).catch(()=>{});
    }
  },[]);

  function switchLang(l:Lang){setLang(l);localStorage.setItem("tw_lang",l);}

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
      const [weatherRes, corrRes] = await Promise.all([
        fetch("/api/weather",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({city:fetchCity})}),
        fetch(`/api/ratings/correction?email=${encodeURIComponent(p.email)}`).then(r=>r.json()).catch(()=>({correction:0})),
      ]);
      const weather=await weatherRes.json();
      if(!weatherRes.ok) throw new Error(
        weather.error==="rate_limit" ? (lang==="he"?"עומס זמני – נסה שוב בעוד כמה שניות":"Server busy – please try again in a few seconds") :
        weather.error==="city_not_found" ? t.cityNotFound(fetchCity) :
        weather.detail || t.weatherError
      );
      setLoadingMsg(t.calculating);
      const age=calcAge(p.birthdate);
      const bmi=calcBMI(+p.weight,+p.height);
      const{genderOffset,bmiOffset,ageOffset}=getOffsets(p.gender,bmi,age);
      const ratingOffset=corrRes.correction||0;
      const offset=genderOffset+bmiOffset+ageOffset+ratingOffset;
      const todayFeel=weather.today.avg+offset;
      const tomorrowFeel=weather.tomorrow.avg+offset;

      const now=new Date();
      const tom=new Date();tom.setDate(tom.getDate()+1);
      const loc=lang==="he"?"he-IL":"en-US";
      const opts:Intl.DateTimeFormatOptions={weekday:"long",day:"numeric",month:"long"};

      setResult({
        today:{...weather.today,avg:weather.today.avg},
        tomorrow:{...weather.tomorrow,avg:weather.tomorrow.avg},
        cityHe:weather.cityHe,
        todayFeel,tomorrowFeel,
        todayDateStr:now.toLocaleDateString(loc,opts),
        tomorrowDateStr:tom.toLocaleDateString(loc,opts),
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

  const bgColors=result?(getVisual(result.tomorrowFeel,lang).sky):(["#1a2a4a","#0d1b2e","#2a3a5a"] as [string,string,string]);

  return (
    <div dir={isRtl?"rtl":"ltr"} style={{minHeight:"100vh",fontFamily:"'Heebo', sans-serif",position:"relative",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"28px 16px 48px"}}>
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes drift{from{transform:translateX(-140px)}to{transform:translateX(calc(100vw + 140px))}}
        @keyframes twinkle{from{opacity:0.2}to{opacity:1}}
        @keyframes sunPulse{0%,100%{box-shadow:0 0 40px 20px rgba(255,200,50,0.35)}50%{box-shadow:0 0 65px 30px rgba(255,200,50,0.55)}}
        @keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
        *{box-sizing:border-box;margin:0;padding:0;}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input::placeholder{color:rgba(255,255,255,0.18);}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.4) sepia(1) hue-rotate(180deg);}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}
      `}</style>

      <div style={{position:"fixed",inset:0,zIndex:0}}>
        <SkyBackground colors={bgColors} sun={result?getVisual(result.tomorrowFeel,lang).sun:false}/>
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/>
      </div>

      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:460}}>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:22,animation:"fadeIn .5s ease both"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"7px 20px",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(12px)",borderRadius:40,border:"1px solid rgba(255,255,255,0.12)"}}>
              <span>🌡️</span>
              <span style={{fontSize:12,fontWeight:800,letterSpacing:"0.14em",color:"rgba(255,255,255,0.8)",textTransform:"uppercase"}}>What2wear</span>
            </div>
            {/* Lang toggle */}
            <div style={{display:"flex",background:"rgba(255,255,255,0.08)",borderRadius:30,padding:3,gap:2}}>
              {(["he","en"] as Lang[]).map(l=>(
                <button key={l} onClick={()=>switchLang(l)} style={{padding:"4px 12px",borderRadius:24,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",transition:"all .2s",
                  background:lang===l?"rgba(244,162,97,0.8)":"transparent",color:lang===l?"#fff":"rgba(255,255,255,0.4)"}}>
                  {l==="he"?"עב":"EN"}
                </button>
              ))}
            </div>
          </div>

          <h1 style={{fontSize:28,fontWeight:900,color:"#fff",lineHeight:1.2,textShadow:"0 2px 20px rgba(0,0,0,0.5)"}}>
            {view==="weather"&&profile?t.hello(profile.name):view==="auth_otp"?t.enterOtp:view==="auth_register"?t.register:t.whatToWear}
          </h1>
          {view==="auth_email"&&<p style={{marginTop:6,fontSize:13,color:"rgba(255,255,255,0.4)"}}>{t.tagline}</p>}
          {profile&&view==="weather"&&(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:8}}>
              <button onClick={()=>setSideMenuOpen(true)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"6px 14px",color:"rgba(255,255,255,0.6)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>👤 {t.profileMenu}</button>
              <button onClick={signOut} style={{background:"none",border:"none",color:"rgba(255,255,255,0.25)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{t.signOut}</button>
            </div>
          )}
        </div>

        {/* EMAIL */}
        {view==="auth_email"&&(
          <Card>
            <div style={{display:"flex",flexDirection:"column",gap:18}}>
              <FieldWrap label={t.emailLabel} error={errors.email} required>
                <TextInput value={email} onChange={v=>{setEmail(v);setErrors({});setGlobalError("");}} type="email" placeholder={t.emailPlaceholder} ltr error={errors.email}/>
              </FieldWrap>
              {globalError&&<ErrorBox>{globalError}</ErrorBox>}
              <PrimaryBtn onClick={sendOtp} loading={loading}>{t.sendOtp}</PrimaryBtn>
              <p style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.2)",lineHeight:1.6}}>
                {t.otpHint}<br/>{t.firstTimeHint}
              </p>
            </div>
          </Card>
        )}

        {/* OTP */}
        {view==="auth_otp"&&(
          <Card>
            <div style={{display:"flex",flexDirection:"column",gap:18}}>
              <p style={{fontSize:14,color:"rgba(255,255,255,0.5)",textAlign:"center"}}>
                {t.codeSentTo}<strong style={{color:"#F4A261"}}>{email}</strong>
              </p>
              <FieldWrap label={t.otpLabel} error={errors.otp} required>
                <TextInput value={otp} onChange={v=>{setOtp(v);setErrors({});setGlobalError("");}} type="text" placeholder={t.otpPlaceholder} ltr error={errors.otp}/>
              </FieldWrap>
              {globalError&&<ErrorBox>{globalError}</ErrorBox>}
              <PrimaryBtn onClick={verifyOtp} loading={loading}>{t.verifyBtn}</PrimaryBtn>
              <button onClick={()=>{setView("auth_email");setOtp("");setGlobalError("");}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.25)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                {t.changeEmail}
              </button>
            </div>
          </Card>
        )}

        {/* REGISTER */}
        {view==="auth_register"&&(
          <Card>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.3)",marginBottom:20,textAlign:"center"}}>{t.savedHint}</p>
            <SectionLabel icon="👤" text={t.personalInfo}/>
            <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:22}}>
              <FieldWrap label={t.fullName} error={errors.name} required>
                <TextInput value={form.name} onChange={setF("name")} placeholder={t.namePlaceholder} error={errors.name}/>
              </FieldWrap>
              <FieldWrap label={t.phone}>
                <TextInput value={form.phone} onChange={setF("phone")} type="tel" placeholder={t.phonePlaceholder} ltr/>
              </FieldWrap>
            </div>
            <div style={{height:1,background:"rgba(255,255,255,0.06)",marginBottom:20}}/>
            <SectionLabel icon="📊" text={t.bodyData}/>
            <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:22}}>
              <FieldWrap label={t.gender} error={errors.gender} required>
                <div style={{display:"flex",gap:10}}>
                  {([["male",t.male],["female",t.female]] as [string,string][]).map(([val,lbl])=>(
                    <button key={val} onClick={()=>setF("gender")(val)} style={{flex:1,padding:"13px 0",borderRadius:12,cursor:"pointer",fontSize:15,fontWeight:700,fontFamily:"inherit",border:"1.5px solid",transition:"all .2s",
                      borderColor:form.gender===val?"#F4A261":errors.gender?"#FF6B6B":"rgba(255,255,255,0.08)",
                      background:form.gender===val?"rgba(244,162,97,0.15)":"rgba(255,255,255,0.03)",
                      color:form.gender===val?"#F4A261":"rgba(255,255,255,0.3)"}}>{lbl}</button>
                  ))}
                </div>
              </FieldWrap>
              <FieldWrap label={t.birthdate} error={errors.birthdate} required>
                <TextInput value={form.birthdate} onChange={setF("birthdate")} type="date" error={errors.birthdate}/>
              </FieldWrap>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <FieldWrap label={t.height} error={errors.height} required>
                  <TextInput value={form.height} onChange={setF("height")} type="number" placeholder="170" unit={t.heightUnit} error={errors.height}/>
                </FieldWrap>
                <FieldWrap label={t.weight} error={errors.weight} required>
                  <TextInput value={form.weight} onChange={setF("weight")} type="number" placeholder="70" unit={t.weightUnit} error={errors.weight}/>
                </FieldWrap>
              </div>
            </div>
            <div style={{height:1,background:"rgba(255,255,255,0.06)",marginBottom:20}}/>
            <SectionLabel icon="📍" text={t.locationSection}/>
            <div style={{marginBottom:22}}>
              <FieldWrap label={t.city} error={errors.city} required>
                <TextInput value={city} onChange={v=>{setCity(v);setErrors(e=>({...e,city:""}));}} placeholder={t.cityPlaceholder} error={errors.city}/>
              </FieldWrap>
              <button onClick={()=>useMyLocation(setCity)} disabled={locLoading} style={{marginTop:8,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"rgba(255,255,255,0.4)",fontSize:12,padding:"8px 14px",cursor:"pointer",fontFamily:"inherit",opacity:locLoading?0.5:1}}>
                {locLoading?t.detecting:t.detectLocation}
              </button>
            </div>
            {globalError&&<ErrorBox style={{marginBottom:16}}>{globalError}</ErrorBox>}
            <PrimaryBtn onClick={saveProfile} loading={loading}>{t.saveBtn}</PrimaryBtn>
          </Card>
        )}

        {/* WEATHER */}
        {view==="weather"&&profile&&(
          result?(
            <ResultCard result={result} onChangCity={()=>{setResult(null);setGlobalError("");setChangingCity(true);}} lang={lang} email={email} onRateSubmit={()=>{}}/>
          ): loading?(
            <Card>
              <div style={{textAlign:"center",padding:"48px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>
                <span style={{width:40,height:40,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.1)",borderTopColor:"#F4A261",display:"inline-block",animation:"spin .7s linear infinite"}}/>
                <p style={{color:"rgba(255,255,255,0.5)",fontSize:14}}>{loadingMsg||t.loading}</p>
              </div>
            </Card>
          ): changingCity?(
            <Card>
              <SectionLabel icon="📍" text={t.cityForForecast}/>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <FieldWrap label={t.city} error={errors.city}>
                  <TextInput value={city} onChange={v=>{setCity(v);setErrors(e=>({...e,city:""}));setGlobalError("");}} placeholder={profile.city} error={errors.city}/>
                </FieldWrap>
                <button onClick={()=>useMyLocation(setCity)} disabled={locLoading} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"rgba(255,255,255,0.4)",fontSize:12,padding:"8px 14px",cursor:"pointer",fontFamily:"inherit",opacity:locLoading?0.5:1,display:"flex",alignItems:"center",gap:6}}>
                  {locLoading?t.detecting:t.detectLocation}
                </button>
                {globalError&&<ErrorBox>{globalError}</ErrorBox>}
                <PrimaryBtn onClick={()=>fetchWeather(city||profile.city)} loading={loading}>
                  {t.getRecommendation}
                </PrimaryBtn>
              </div>
            </Card>
          ):(
            <Card>
              <div style={{textAlign:"center",padding:"32px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
                {globalError?(
                  <>
                    <div style={{fontSize:36}}>⚠️</div>
                    <p style={{color:"#FF8080",fontSize:14,lineHeight:1.6}}>{globalError}</p>
                    <PrimaryBtn onClick={()=>fetchWeatherForProfile(profile)} loading={false}>{t.getRecommendation}</PrimaryBtn>
                  </>
                ):(
                  <span style={{width:40,height:40,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.1)",borderTopColor:"#F4A261",display:"inline-block",animation:"spin .7s linear infinite"}}/>
                )}
              </div>
            </Card>
          )
        )}

        <p style={{textAlign:"center",fontSize:10,color:"rgba(255,255,255,0.1)",marginTop:16,letterSpacing:"0.06em"}}>{t.footer}</p>
      </div>

      {sideMenuOpen&&profile&&(
        <ProfileMenu profile={profile} lang={lang} onClose={()=>setSideMenuOpen(false)}
          onSaved={p=>{setProfile(p);if(result)doFetchWeather(p.city,p);}}/>
      )}
    </div>
  );
}
