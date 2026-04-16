"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";

const DAYS=["Mo","Di","Mi","Do","Fr","Sa","So"],DAYS_L=["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"],DIM={1:0,2:1,3:2,4:3,5:4,6:5,0:6};
const mkS=(o,c,cl=[])=>DAYS.map((_,i)=>cl.includes(i)?{closed:true,slots:[]}:{closed:false,slots:[{open:o,close:c}]});
const CATS=["Alle","Italienisch","Vietnamesisch","Türkisch","Japanisch","Indisch","Griechisch","Chinesisch","Mexikanisch","Deutsch","Vegan","Vegetarisch","Halal","Burger","Sonstiges"];
const CE={"Italienisch":"🍕","Vietnamesisch":"🍜","Türkisch":"🥙","Japanisch":"🍣","Indisch":"🍛","Griechisch":"🥗","Chinesisch":"🥡","Mexikanisch":"🌮","Deutsch":"🥨","Vegan":"🌱","Vegetarisch":"🥬","Halal":"☪️","Burger":"🍔","Sonstiges":"🍽️","Alle":"🔥"};
const CC=["#2D6A4F","#40916C","#52796F","#588157","#D4A373","#BC6C25","#DDA15E","#E9C46A"];
const TIMES=[];for(let h=0;h<24;h++){TIMES.push(`${String(h).padStart(2,"0")}:00`);TIMES.push(`${String(h).padStart(2,"0")}:30`);}
const DS=DAYS.map(()=>({closed:false,slots:[{open:"11:00",close:"22:00"}]}));
const P={lila:"#2D6A4F",mint:"#40916C",rosa:"#D4A373",peach:"#E9C46A",text:"#1B2A1D",textM:"#6B7E6F",border:"#D5CCBB",bg:"#F5F0E8",card:"#FFFDF8",hero:"#EAE2D4",heroBg:"#F5F0E8",section1:"#E8F0E8",section2:"#FFF5EB",accent:"#2D6A4F",warm:"#D4A373",gold:"#E9C46A"};

const Logo=({h=28,light=false,showTag=false})=>{const s=h/28;return(<div style={{display:"flex",alignItems:"center",gap:h*0.3}}>
  <svg width={h*1.1} height={h} viewBox="0 0 34 30" fill="none">
    <rect x="1" y="1" width="28" height="28" rx="7" stroke={light?"#FFF":"#2D6A4F"} strokeWidth="2.5" fill="none"/>
    <rect x="4" y="4" width="22" height="22" rx="5" fill={light?"rgba(255,255,255,0.15)":"#2D6A4F"} opacity="0.12"/>
    <path d="M12 22 C12 22 12 14 18 10" stroke={light?"rgba(255,255,255,0.3)":"#40916C"} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M10 20 C10 20 12 12 20 9" stroke={light?"rgba(255,255,255,0.2)":"#6BAF8D"} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="18" cy="10" r="4.5" fill={light?"#FFF":"#2D6A4F"}/>
    <circle cx="18" cy="10" r="2" fill={light?"#2D6A4F":"#FFFDF8"}/>
  </svg>
  <div>
    <div style={{fontSize:h*0.78,fontWeight:900,color:light?"#FFF":"#1B2A1D",letterSpacing:"-0.5px",lineHeight:1}}>
      <span style={{color:light?"#FFF":"#6B7E6F"}}>Deli</span><span style={{color:light?"#FFF":"#1B2A1D"}}>carto</span>
    </div>
    {showTag&&<div style={{fontSize:h*0.32,color:light?"rgba(255,255,255,0.5)":"#6B7E6F",fontWeight:600,marginTop:1}}>Restaurants einfach digital.</div>}
  </div>
</div>)};

const DATA=[
  {id:"1",name:"Pizzeria Da Luigi",cats:["Italienisch","Vegetarisch"],street:"Hauptstr.",nr:"12",plz:"10827",city:"Berlin",phone:"030 1234567",sched:mkS("11:00","22:00",[6]),min:"12€",prem:true,views:847,col:"#2D6A4F",
   zones:[{name:"Schöneberg",plz:"10827",cost:"1,50€"},{name:"Friedenau",plz:"12159",cost:"2,50€"},{name:"Tempelhof",plz:"12099",cost:"3,50€"}],added:"2026-03-28"},
  {id:"2",name:"Saigon Pho House",cats:["Vietnamesisch","Vegan"],street:"Sonnenallee",nr:"45",plz:"12045",city:"Berlin",phone:"030 9876543",sched:mkS("12:00","21:30"),min:"15€",prem:false,views:312,col:"#40916C",
   zones:[{name:"Neukölln",plz:"12045",cost:"0€"},{name:"Kreuzberg",plz:"10999",cost:"1,50€"},{name:"Treptow",plz:"12435",cost:"2€"}],added:"2026-04-01"},
  {id:"3",name:"Kebab König",cats:["Türkisch","Halal"],street:"Karl-Marx-Str.",nr:"88",plz:"12043",city:"Berlin",phone:"030 5551234",sched:mkS("10:00","23:00"),min:"8€",prem:true,views:1203,col:"#D4A373",
   zones:[{name:"Neukölln",plz:"12043",cost:"0€"},{name:"Neukölln-Nord",plz:"12045",cost:"0€"},{name:"Kreuzberg",plz:"10999",cost:"1€"},{name:"Schöneberg",plz:"10827",cost:"2€"},{name:"Tempelhof",plz:"12099",cost:"2,50€"}],added:"2026-03-15"},
  {id:"4",name:"Sushi Zen",cats:["Japanisch"],street:"Torstr.",nr:"77",plz:"10119",city:"Berlin",phone:"030 4449876",sched:mkS("12:00","22:30",[0,6]),min:"20€",prem:false,views:198,col:"#52796F",
   zones:[{name:"Mitte",plz:"10119",cost:"0€"},{name:"Prenzlauer Berg",plz:"10405",cost:"1,50€"},{name:"Friedrichshain",plz:"10245",cost:"2€"}],added:"2026-04-03"},
  {id:"5",name:"Curry & Tandoori",cats:["Indisch","Vegan","Halal"],street:"Oranienstr.",nr:"33",plz:"10999",city:"Berlin",phone:"030 6667890",sched:mkS("11:30","22:00",[1]),min:"10€",prem:false,views:456,col:"#E9C46A",
   zones:[{name:"Kreuzberg",plz:"10999",cost:"0€"},{name:"Neukölln",plz:"12043",cost:"1,50€"},{name:"Mitte",plz:"10119",cost:"3€"}],added:"2026-03-22"},
  {id:"6",name:"Olympia Grill",cats:["Griechisch","Vegetarisch"],street:"Gneisenaustr.",nr:"12",plz:"10961",city:"Berlin",phone:"030 7771234",sched:mkS("11:00","23:00",[0]),min:"14€",prem:false,views:289,col:"#588157",
   zones:[{name:"Kreuzberg",plz:"10961",cost:"0€"},{name:"Schöneberg",plz:"10827",cost:"2€"}],added:"2026-03-10"},
  {id:"7",name:"Taco Loco",cats:["Mexikanisch","Vegan"],street:"Wrangelstr.",nr:"44",plz:"10997",city:"Berlin",phone:"030 8885678",sched:(()=>{const s=mkS("17:00","01:00",[0,1]);s[4]={closed:false,slots:[{open:"17:00",close:"02:00"}]};s[5]={closed:false,slots:[{open:"17:00",close:"02:00"}]};return s;})(),min:"12€",prem:true,views:678,col:"#BC6C25",
   zones:[{name:"Kreuzberg SO",plz:"10997",cost:"0€"},{name:"Kreuzberg",plz:"10999",cost:"1€"},{name:"Neukölln",plz:"12045",cost:"2€"},{name:"Friedrichshain",plz:"10245",cost:"2,50€"}],added:"2026-04-05"},
  {id:"8",name:"China Palace",cats:["Chinesisch"],street:"Kantstr.",nr:"30",plz:"10623",city:"Berlin",phone:"030 3334567",sched:mkS("11:30","22:30"),min:"15€",prem:false,views:401,col:"#DDA15E",
   zones:[{name:"Charlottenburg",plz:"10623",cost:"0€"},{name:"Wilmersdorf",plz:"10707",cost:"1,50€"},{name:"Moabit",plz:"10551",cost:"3€"}],added:"2026-03-18"},
];

function isOpen(s){if(!s||!Array.isArray(s))return false;const n=new Date(),d=s[DIM[n.getDay()]];if(!d||d.closed||!d.slots)return false;const m=n.getHours()*60+n.getMinutes();return d.slots.some(sl=>{const[oh,om]=sl.open.split(":").map(Number),[ch,cm]=sl.close.split(":").map(Number),o=oh*60+om,c=ch*60+cm;return c<=o?m>=o||m<=c:m>=o&&m<=c;});}
function todayH(s){if(!s)return"—";const d=s[DIM[new Date().getDay()]];if(!d||d.closed||!d.slots||d.slots.length===0)return"Ruhetag";return d.slots.map(sl=>`${sl.open}–${sl.close}`).join(" + ");}
function schedSum(s){if(!s)return"—";const g=[];let i=0;while(i<7){const c=s[i];let j=i+1;while(j<7){const n=s[j];if(c.closed&&n.closed){j++;continue;}if(!c.closed&&!n.closed&&c.slots&&n.slots&&JSON.stringify(c.slots)===JSON.stringify(n.slots)){j++;continue;}break;}const label=i===j-1?DAYS[i]:`${DAYS[i]}–${DAYS[j-1]}`;g.push(c.closed?{days:label,text:"Ruhetag",closed:true}:{days:label,text:c.slots.map(sl=>`${sl.open}–${sl.close}`).join(" + "),closed:false});i=j;}return g;}
function getAddr(r){return `${r.street} ${r.nr}, ${r.plz} ${r.city}`;}
function findZone(r,plz){if(!plz||!r.zones)return null;return r.zones.find(z=>z.plz===plz)||null;}
function deliversTo(r,plz){return!!findZone(r,plz);}

const Inp=({label,ph,val,onChange,w})=>(<div style={{width:w||"100%"}}><label style={{fontSize:11,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:6}}>{label}</label><input type="text" placeholder={ph} value={val} onChange={onChange} style={{width:"100%",padding:"14px 16px",fontSize:15,fontWeight:500,border:`1.5px solid ${P.border}`,borderRadius:12,background:"#FFF",color:P.text,fontFamily:"inherit"}}/></div>);

const Overlay=({children,onClose})=>(<div style={{position:"fixed",inset:0,background:"rgba(27,42,29,0.4)",backdropFilter:"blur(12px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,animation:"fadeUp 0.25s ease"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div style={{background:P.card,borderRadius:24,width:"100%",maxWidth:600,maxHeight:"92vh",overflow:"auto",animation:"scaleIn 0.3s ease",boxShadow:"0 25px 80px rgba(27,42,29,0.2)"}}>{children}</div></div>);

const SchedEdit=({schedule,onChange})=>{
  const tog=i=>onChange(schedule.map((d,j)=>j===i?{...d,closed:!d.closed,slots:d.closed?[{open:"11:00",close:"22:00"}]:d.slots}:d));
  const updSlot=(i,si,f,v)=>onChange(schedule.map((d,j)=>j===i?{...d,slots:d.slots.map((sl,k)=>k===si?{...sl,[f]:v}:sl)}:d));
  const addSlot=i=>onChange(schedule.map((d,j)=>j===i?{...d,slots:[...d.slots,{open:"17:00",close:"22:00"}]}:d));
  const delSlot=(i,si)=>onChange(schedule.map((d,j)=>j===i?{...d,slots:d.slots.filter((_,k)=>k!==si)}:d));
  const cpy=i=>onChange(schedule.map(()=>({closed:schedule[i].closed,slots:schedule[i].slots.map(sl=>({...sl}))})));
  return (<div><label style={{fontSize:11,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:10}}>Öffnungszeiten pro Tag *</label><div style={{display:"flex",flexDirection:"column",gap:5}}>{DAYS_L.map((_,i)=>(<div key={i} style={{padding:"10px 14px",borderRadius:12,background:schedule[i].closed?"#FFF0F3":P.bg,border:`1.5px solid ${schedule[i].closed?"#FFD6E0":P.border}`}}>
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
      <div style={{width:30,fontWeight:800,fontSize:13,color:schedule[i].closed?P.textM:P.text,flexShrink:0}}>{DAYS[i]}</div>
      <button onClick={()=>tog(i)} style={{padding:"4px 10px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",border:"none",flexShrink:0,background:schedule[i].closed?"#FF8FA3":P.mint,color:schedule[i].closed?"#FFF":"#1B5E3B"}}>{schedule[i].closed?"Ruhetag":"Geöffnet"}</button>
      {!schedule[i].closed&&<button onClick={()=>cpy(i)} style={{marginLeft:"auto",padding:"3px 8px",borderRadius:6,fontSize:10,fontWeight:700,cursor:"pointer",border:`1.5px solid ${P.border}`,background:"#FFF",color:P.textM,whiteSpace:"nowrap"}}>📋 Auf alle</button>}
    </div>
    {!schedule[i].closed&&<div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>
      {(schedule[i].slots||[]).map((sl,si)=>(<div key={si} style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
        <select value={sl.open} onChange={e=>updSlot(i,si,"open",e.target.value)} style={{padding:"4px 6px",borderRadius:8,border:`1.5px solid ${P.border}`,fontSize:13,fontWeight:600,background:"#FFF",color:P.text,fontFamily:"inherit",cursor:"pointer"}}>{TIMES.map(t=><option key={t} value={t}>{t}</option>)}</select>
        <span style={{color:P.textM,fontSize:13}}>–</span>
        <select value={sl.close} onChange={e=>updSlot(i,si,"close",e.target.value)} style={{padding:"4px 6px",borderRadius:8,border:`1.5px solid ${P.border}`,fontSize:13,fontWeight:600,background:"#FFF",color:P.text,fontFamily:"inherit",cursor:"pointer"}}>{TIMES.map(t=><option key={t} value={t}>{t}</option>)}</select>
        {(schedule[i].slots||[]).length>1&&<button onClick={()=>delSlot(i,si)} style={{width:24,height:24,borderRadius:6,border:"none",background:"#FFF0F3",color:"#FF8FA3",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>}
      </div>))}
      {(schedule[i].slots||[]).length<3&&<button onClick={()=>addSlot(i)} style={{padding:"4px 10px",borderRadius:8,border:`1.5px dashed ${P.border}`,background:"transparent",color:P.accent,fontSize:11,fontWeight:700,cursor:"pointer",alignSelf:"flex-start"}}>+ Weitere Zeitspanne</button>}
    </div>}
  </div>))}</div></div>);
};
const SchedShow=({schedule})=>{const g=schedSum(schedule);if(!Array.isArray(g))return (<span>{g}</span>);return (<div style={{display:"flex",flexDirection:"column",gap:4}}>{g.map((x,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<g.length-1?`1px solid ${P.border}`:"none"}}><span style={{fontSize:14,fontWeight:600,color:P.textM}}>{x.days}</span>{x.closed?<span style={{fontSize:12,fontWeight:700,color:"#FF8FA3",background:"#FFF0F3",padding:"2px 10px",borderRadius:6}}>Ruhetag</span>:<span style={{fontSize:14,fontWeight:700,color:P.text}}>{x.text}</span>}</div>))}</div>);};

/* Zone Editor for business registration */
const ZoneEditor=({zones,onChange})=>{
  const add=()=>onChange([...zones,{name:"",plz:"",cost:"0€"}]);
  const upd=(i,f,v)=>onChange(zones.map((z,j)=>j===i?{...z,[f]:v}:z));
  const del=i=>onChange(zones.filter((_,j)=>j!==i));
  return(<div><label style={{fontSize:11,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:6}}>Liefergebiete * <span style={{fontWeight:500,textTransform:"none",letterSpacing:0,color:"#A0A890"}}>Orte/Stadtteile die du belieferst</span></label>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {zones.map((z,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"center",padding:"12px 14px",background:"#EDE6FA",borderRadius:12,border:`1.5px solid ${P.border}`,flexWrap:"wrap"}}>
        <input type="text" placeholder="Ort/Stadtteil" value={z.name} onChange={e=>upd(i,"name",e.target.value)} style={{flex:2,minWidth:100,padding:"8px 12px",fontSize:13,fontWeight:600,border:`1.5px solid ${P.border}`,borderRadius:8,background:"#FFF",fontFamily:"inherit"}}/>
        <input type="text" placeholder="PLZ" value={z.plz} onChange={e=>upd(i,"plz",e.target.value)} style={{width:70,padding:"8px 12px",fontSize:13,fontWeight:600,border:`1.5px solid ${P.border}`,borderRadius:8,background:"#FFF",fontFamily:"inherit"}}/>
        <input type="text" placeholder="Kosten" value={z.cost} onChange={e=>upd(i,"cost",e.target.value)} style={{width:70,padding:"8px 12px",fontSize:13,fontWeight:600,border:`1.5px solid ${P.border}`,borderRadius:8,background:"#FFF",fontFamily:"inherit"}}/>
        <button onClick={()=>del(i)} style={{width:30,height:30,borderRadius:8,border:"none",background:"#FFF0F3",color:"#FF8FA3",fontSize:14,cursor:"pointer",flexShrink:0}}>✕</button>
      </div>))}
      <button onClick={add} style={{padding:"10px",borderRadius:10,border:`2px dashed ${P.border}`,background:"transparent",color:P.accent,fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Weiteren Ort hinzufügen</button>
    </div>
  </div>);
};

function useInView(ref){const[v,setV]=useState(false);useEffect(()=>{if(!ref.current)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true)},{threshold:0.1});o.observe(ref.current);return()=>o.disconnect();},[]);return v;}
const Reveal=({children,style,id})=>{const r=useRef(null);const v=useInView(r);return (<div ref={r} id={id} style={{opacity:v?1:0,transform:v?"translateY(0)":"translateY(30px)",transition:"all 0.7s cubic-bezier(0.22,1,0.36,1)",...style}}>{children}</div>);};

export default function App(){
  const[page,setPage]=useState("home"); // "home" | "register"
  const[rests,setRests]=useState([]);
  const[loading,setLoading]=useState(true);
  const[plzSearch,setPlzSearch]=useState("");
  const[search,setSearch]=useState("");
  const[selCat,setSelCat]=useState("Alle");
  const[selRest,setSelRest]=useState(null);
  const[viewed,setViewed]=useState([]);
  const[showCatFade,setShowCatFade]=useState(true);
  const[uLoc,setULoc]=useState(null);
  const[locLoad,setLocLoad]=useState(false);
  const catRef=useRef(null),appRef=useRef(null);
  const[openFaq,setOpenFaq]=useState(null);
  const[mMenu,setMMenu]=useState(false);

  // Register state
  const[rStep,setRStep]=useState(1);
  const[rData,setRD]=useState({name:"",cats:[],street:"",nr:"",plz:"",city:"",phone:"",sched:DS.map(d=>({...d})),min:"",zones:[{name:"",plz:"",cost:"0€",minOrder:""}],file:null});
  const[rOk,setROk]=useState(false);
  const[dStep,setDStep]=useState(1);
  const[dData,setDD]=useState({name:"",phone:"",email:"",notes:"",pkg:"profi",photos:null});
  const[dOk,setDOk]=useState(false);
  const[modal,setModal]=useState(null);
  const fRef=useRef(null),diRef=useRef(null);

  // Auth state
  const[authMode,setAuthMode]=useState("landing");
  const[authEmail,setAuthEmail]=useState("");
  const[authPass,setAuthPass]=useState("");
  const[authName,setAuthName]=useState("");
  const[authErr,setAuthErr]=useState("");
  const[authLoading,setAuthLoading]=useState(false);
  const[user,setUser]=useState(null);
  const[selPkg,setSelPkg]=useState("kostenlos");

  // Load restaurants from Supabase
  const loadRestaurants=async()=>{
    const{data:restaurants,error}=await supabase.from("restaurants").select("*");
    if(error){console.error(error);setLoading(false);return;}
    // Load zones for each restaurant
    const{data:zones}=await supabase.from("delivery_zones").select("*");
    const merged=restaurants.map(r=>({
      ...r,
      cats:r.categories||[],
      street:r.street||"",nr:r.house_nr||"",plz:r.plz||"",city:r.city||"",
      sched:r.schedule||DS,min:r.min_order||"—",prem:r.is_premium,
      col:r.color||"#2D6A4F",
      pdfUrl:r.pdf_url||null,pdfName:r.pdf_name||"Speisekarte.pdf",
      zones:(zones||[]).filter(z=>z.restaurant_id===r.id).map(z=>({name:z.zone_name,plz:z.plz,cost:z.delivery_cost,minOrder:z.min_order||""})),
      added:r.created_at?.slice(0,10)||""
    }));
    setRests(merged);
    setLoading(false);
  };

  // Check auth on mount
  useEffect(()=>{
    loadRestaurants();
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){setUser(session.user);setAuthMode("loggedIn");}
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      if(session?.user){setUser(session.user);setAuthMode("loggedIn");}
      else{setUser(null);}
    });
    return()=>subscription.unsubscribe();
  },[]);

  // Real Supabase Auth
  const doRegister=async()=>{
    if(!authEmail||!authPass||!authName){setAuthErr("Bitte alle Felder ausfüllen.");return;}
    if(authPass.length<6){setAuthErr("Passwort muss mindestens 6 Zeichen haben.");return;}
    setAuthLoading(true);setAuthErr("");
    const{data,error}=await supabase.auth.signUp({
      email:authEmail,password:authPass,
      options:{data:{full_name:authName}}
    });
    setAuthLoading(false);
    if(error){setAuthErr(error.message);return;}
    if(data.user){setUser(data.user);setAuthMode("loggedIn");}
  };

  const doLogin=async()=>{
    if(!authEmail||!authPass){setAuthErr("Bitte alle Felder ausfüllen.");return;}
    setAuthLoading(true);setAuthErr("");
    const{data,error}=await supabase.auth.signInWithPassword({email:authEmail,password:authPass});
    setAuthLoading(false);
    if(error){setAuthErr("E-Mail oder Passwort falsch.");return;}
    if(data.user){setUser(data.user);setAuthMode("loggedIn");}
  };

  const doLogout=async()=>{
    await supabase.auth.signOut();
    setUser(null);setAuthMode("landing");setAuthEmail("");setAuthPass("");setAuthName("");
  };

  const openDetail=(r)=>{setSelRest(r);setViewed(prev=>[r,...prev.filter(x=>x.id!==r.id)].slice(0,4));};

  useEffect(()=>{const el=catRef.current;if(!el)return;const ck=()=>setShowCatFade(el.scrollWidth>el.clientWidth&&el.scrollLeft<el.scrollWidth-el.clientWidth-10);ck();el.addEventListener("scroll",ck);return()=>el.removeEventListener("scroll",ck);},[]);

  const reqLoc=()=>{if(locLoad)return;setLocLoad(true);navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>{const testPlzs=["10827","12045","12043","10119","10999","10961","10997","10623","12159","12099","12435","10405","10245","10707","10551"];const lat=p.coords.latitude,lng=p.coords.longitude;const closest=testPlzs[Math.floor(Math.random()*testPlzs.length)];setPlzSearch(closest);setLocLoad(false);appRef.current?.scrollIntoView({behavior:"smooth"});},()=>{setPlzSearch("10999");setLocLoad(false);appRef.current?.scrollIntoView({behavior:"smooth"});},{enableHighAccuracy:true,timeout:8000}):(()=>{setPlzSearch("10999");setLocLoad(false);})();};

  // Filter: by PLZ (delivery zone), by text search, by category
  const filtered=(()=>{let l=[...rests];
    if(plzSearch.length>=4){l=l.filter(r=>r.zones.some(z=>z.plz.startsWith(plzSearch)));}
    l=l.filter(r=>{const cs=r.cats.join(" ").toLowerCase();const m=r.name.toLowerCase().includes(search.toLowerCase())||cs.includes(search.toLowerCase());return m&&(selCat==="Alle"||r.cats.includes(selCat));});
    return l;
  })();

  const resetR=()=>{setRStep(1);setRD({name:"",cats:[],street:"",nr:"",plz:"",city:"",phone:"",sched:DS.map(d=>({...d})),min:"",zones:[{name:"",plz:"",cost:"0€",minOrder:""}],file:null});setROk(false);};
  const resetD=()=>{setModal(null);setDStep(1);setDD({name:"",phone:"",email:"",notes:"",pkg:"profi",photos:null});setDOk(false);};

  const submitR=async()=>{
    if(!rData.name||!rData.file||rData.cats.length===0||rData.zones.length===0||!user)return;
    try{
      // 1. Upload PDF to Supabase Storage
      const fileName=`${Date.now()}-${rData.file.name}`;
      const{data:fileData,error:fileErr}=await supabase.storage.from("menus").upload(fileName,rData.file);
      if(fileErr)throw fileErr;
      const{data:{publicUrl}}=supabase.storage.from("menus").getPublicUrl(fileName);

      // 2. Insert restaurant
      const{data:restaurant,error:restErr}=await supabase.from("restaurants").insert({
        name:rData.name,
        categories:rData.cats,
        street:rData.street,
        house_nr:rData.nr,
        plz:rData.plz,
        city:rData.city,
        phone:rData.phone||null,
        schedule:rData.sched,
        min_order:rData.min||null,
        pdf_url:publicUrl,
        pdf_name:rData.file.name,
        color:CC[Math.floor(Math.random()*CC.length)],
        owner_id:user.id,
        is_premium:selPkg==="premium"
      }).select().single();
      if(restErr)throw restErr;

      // 3. Insert delivery zones
      const validZones=rData.zones.filter(z=>z.name&&z.plz);
      if(validZones.length>0){
        const{error:zoneErr}=await supabase.from("delivery_zones").insert(
          validZones.map(z=>({
            restaurant_id:restaurant.id,
            zone_name:z.name,
            plz:z.plz,
            delivery_cost:z.cost||"0€",
            min_order:z.minOrder||null
          }))
        );
        if(zoneErr)throw zoneErr;
      }

      // 4. Reload and show success
      await loadRestaurants();
      setROk(true);
    }catch(err){
      console.error("Fehler beim Speichern:",err);
      alert("Fehler beim Speichern: "+err.message);
    }
  };

  // ═══════════════════════════════════════════
  // HOME PAGE (Customer view)
  // ═══════════════════════════════════════════
  if(page==="home")return(
    <div style={{fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",background:P.heroBg,color:P.text,overflowX:"hidden",minHeight:"100vh"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}input,select,textarea{font-family:inherit}::placeholder{color:#A0A890}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.card{transition:all 0.25s ease;cursor:pointer;border:1.5px solid ${P.border}}.card:hover{border-color:#B8C9B0;box-shadow:0 12px 40px rgba(27,42,29,0.06);transform:translateY(-4px)}.pill{transition:all 0.15s ease;cursor:pointer;white-space:nowrap}.pill:hover{opacity:0.85}.btn{transition:all 0.2s ease;cursor:pointer;border:none;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;gap:6px}.btn:hover{transform:translateY(-1px)}.btn:active{transform:scale(0.98)}.btn2{transition:all 0.2s ease;cursor:pointer;font-family:inherit}.btn2:hover{background:#F0EBE0}.clift{transition:all 0.25s ease}.clift:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(27,42,29,0.06)}input:focus,select:focus{outline:none;border-color:${P.accent};box-shadow:0 0 0 3px rgba(45,106,79,0.15)}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#C4B9A5;border-radius:3px}@media(max-width:768px){.nav-links{display:none!important}.mmb{display:flex!important}}`}</style>

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:"rgba(245,240,232,0.92)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${P.border}`}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{cursor:"pointer"}} onClick={()=>{setSelRest(null);setPlzSearch("");setSearch("");window.scrollTo({top:0,behavior:"smooth"});}}><Logo h={26}/></div>
          <div className="nav-links" style={{display:"flex",gap:24,alignItems:"center"}}>
            <a href="#how" style={{color:P.textM,textDecoration:"none",fontSize:14,fontWeight:600}}>So funktioniert's</a>
            <a href="#faq" style={{color:P.textM,textDecoration:"none",fontSize:14,fontWeight:600}}>FAQ</a>
            <button className="btn" onClick={()=>{setPage("register");resetR();}} style={{background:P.text,color:"#FFF",borderRadius:100,padding:"10px 22px",fontSize:13,fontWeight:700}}>Lieferdienst eintragen</button>
          </div>
          <button className="mmb" onClick={()=>setMMenu(!mMenu)} style={{display:"none",background:"none",border:"none",color:P.text,fontSize:24,cursor:"pointer"}}>☰</button>
        </div>
        {mMenu&&<div style={{padding:"8px 24px 20px",borderTop:`1px solid ${P.border}`}}><a href="#how" onClick={()=>setMMenu(false)} style={{display:"block",color:P.textM,textDecoration:"none",fontSize:15,fontWeight:600,padding:"8px 0"}}>So funktioniert's</a><a href="#faq" onClick={()=>setMMenu(false)} style={{display:"block",color:P.textM,textDecoration:"none",fontSize:15,fontWeight:600,padding:"8px 0"}}>FAQ</a><button className="btn" onClick={()=>{setMMenu(false);setPage("register");resetR();}} style={{background:P.text,color:"#FFF",borderRadius:100,padding:"12px",width:"100%",marginTop:8,fontSize:14,fontWeight:700}}>Lieferdienst eintragen</button></div>}
      </nav>

      {/* HERO */}
      <div style={{paddingTop:80,background:`linear-gradient(180deg,${P.hero} 0%,${P.heroBg} 100%)`,position:"relative",overflow:"hidden"}}>
        {/* Background logo watermark */}
        <svg style={{position:"absolute",right:"-2%",top:70,width:"35%",maxWidth:300,opacity:0.06}} viewBox="0 0 200 200"><rect x="20" y="20" width="160" height="160" rx="40" stroke="#2D6A4F" strokeWidth="8" fill="none"/><rect x="35" y="35" width="130" height="130" rx="30" fill="#2D6A4F" opacity="0.15"/><path d="M80 150 C80 150 80 100 120 70" stroke="#40916C" strokeWidth="8" fill="none" strokeLinecap="round"/><path d="M65 140 C65 140 80 85 130 60" stroke="#6BAF8D" strokeWidth="6" fill="none" strokeLinecap="round"/><circle cx="120" cy="70" r="22" fill="#2D6A4F"/><circle cx="120" cy="70" r="10" fill="#F5F0E8"/></svg>
        <div style={{maxWidth:700,margin:"0 auto",padding:"48px 24px 16px",textAlign:"center",position:"relative"}}>
          <h1 style={{fontSize:"clamp(30px,5vw,50px)",fontWeight:900,lineHeight:1.08,marginBottom:14,letterSpacing:"-1.5px"}}><span style={{color:P.accent}}>Speisekarte</span> finden,<br/>direkt bestellen.</h1>
          <p style={{fontSize:16,color:P.textM,lineHeight:1.6,maxWidth:440,margin:"0 auto 28px",fontWeight:500}}>Gib deine PLZ ein oder teile deinen Standort — und sieh sofort welche Lieferdienste zu dir liefern.</p>
          {/* PLZ Search + Standort */}
          <div style={{maxWidth:480,margin:"0 auto 12px",display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
            <div style={{flex:1,minWidth:240,display:"flex",border:`2px solid ${plzSearch.length>=4?P.lila:P.border}`,borderRadius:100,overflow:"hidden",background:P.card,boxShadow:"0 2px 12px rgba(26,26,46,0.05)",transition:"border-color 0.3s"}}>
              <div style={{display:"flex",alignItems:"center",paddingLeft:20}}><span style={{fontSize:20,color:P.textM}}>📍</span></div>
              <input type="text" placeholder="Deine PLZ …" value={plzSearch} onChange={e=>{setPlzSearch(e.target.value.replace(/\D/g,"").slice(0,5));if(e.target.value.length>=4)appRef.current?.scrollIntoView({behavior:"smooth"});}} style={{flex:1,padding:"16px 14px",fontSize:18,fontWeight:600,border:"none",background:"transparent",color:P.text,outline:"none",letterSpacing:"1px"}} maxLength={5}/>
              {plzSearch&&<button onClick={()=>setPlzSearch("")} style={{padding:"0 16px",background:"none",border:"none",fontSize:18,color:P.textM,cursor:"pointer"}}>✕</button>}
            </div>
            <button className="btn" onClick={reqLoc} style={{padding:"14px 22px",borderRadius:100,background:locLoad?"#E5DDD0":P.mint,color:"#1B5E3B",fontSize:13,fontWeight:700,whiteSpace:"nowrap",border:"none"}}>
              {locLoad?<><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⏳</span> Suche…</>:<>📍 Mein Standort</>}
            </button>
          </div>
          <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",fontSize:13,fontWeight:600,color:P.textM}}>
            <span>✓ <span style={{color:P.accent,fontWeight:800}}>0%</span> Provision</span>
            <span>✓ Direkt beim Lieferdienst bestellen</span>
            <span>✓ Kostenlos</span>
          </div>
        </div>
        {/* Pastel divider */}
        <div style={{height:4,marginTop:20,background:`linear-gradient(90deg, ${P.accent}, ${P.mint}, ${P.warm}, ${P.gold})`,opacity:0.5}}/>
      </div>

      {/* RESULTS */}
      <div ref={appRef} id="app" style={{maxWidth:1100,margin:"0 auto",padding:"24px 24px 60px"}}>
        {!selRest?(<>
          {/* Text search */}
          {plzSearch.length>=4&&<div style={{marginBottom:16}}><input type="text" placeholder="🔍 Zusätzlich nach Name oder Küche filtern…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",maxWidth:400,padding:"12px 16px",fontSize:14,fontWeight:500,border:`1.5px solid ${P.border}`,borderRadius:100,background:"#FFF",color:P.text}}/></div>}

          {/* Categories */}
          <div style={{position:"relative",marginBottom:18}}>
            <div ref={catRef} style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,WebkitOverflowScrolling:"touch"}}>{CATS.map(c=>(<div key={c} className="pill" onClick={()=>setSelCat(c)} style={{padding:"8px 16px",borderRadius:100,fontSize:13,fontWeight:700,background:selCat===c?P.text:P.card,color:selCat===c?"#FFF":P.textM,border:selCat===c?"none":`1.5px solid ${P.border}`,display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:14}}>{CE[c]}</span>{c}</div>))}</div>
            {showCatFade&&<div style={{position:"absolute",right:0,top:0,bottom:6,width:48,background:`linear-gradient(to right, transparent, ${P.heroBg})`,pointerEvents:"none"}}/>}
          </div>

          {/* Recently viewed */}
          {viewed.length>0&&!search&&selCat==="Alle"&&(<div style={{marginBottom:24}}><div style={{fontSize:12,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>🕐 Zuletzt angesehen</div><div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6}}>{viewed.map(r=>{const z=plzSearch?findZone(r,plzSearch):null;return(<div key={r.id} onClick={()=>openDetail(r)} style={{flexShrink:0,width:190,background:P.card,borderRadius:14,padding:"14px 16px",border:`1.5px solid ${P.border}`,cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:32,height:32,borderRadius:10,background:`${r.col}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{CE[r.cats[0]]}</div><div style={{fontSize:14,fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</div></div><div style={{display:"flex",gap:4}}><span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:100,background:isOpen(r.sched)?"#E8FFF3":"#FFF0F3",color:isOpen(r.sched)?"#1B5E3B":"#C4314B"}}>{isOpen(r.sched)?"Geöffnet":"Geschlossen"}</span>{z&&<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:100,background:"#E8F4FD",color:"#1D6FA5"}}>🚗 {z.cost}</span>}</div></div>);})}</div></div>)}

          {/* NEW ENTRIES SLIDER */}
          {!search&&selCat==="Alle"&&viewed.length===0&&(()=>{const newest=[...rests].sort((a,b)=>(b.added||"").localeCompare(a.added||"")).slice(0,5);return newest.length>0?(<div style={{marginBottom:28}}>
            <div style={{fontSize:12,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>🆕 Neu auf DeliCarto</div>
            <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8,WebkitOverflowScrolling:"touch"}}>
              {newest.map(r=>{const op=isOpen(r.sched),z=plzSearch?findZone(r,plzSearch):null;return(
                <div key={r.id} onClick={()=>openDetail(r)} style={{flexShrink:0,width:220,background:P.card,borderRadius:16,overflow:"hidden",border:`1.5px solid ${P.border}`,cursor:"pointer",transition:"all 0.25s"}} className="card">
                  <div style={{height:80,background:`linear-gradient(135deg, ${r.col}40, ${r.col}15)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>{CE[r.cats[0]]||"🍽️"}</div>
                  <div style={{padding:"14px 16px"}}>
                    <h4 style={{fontSize:15,fontWeight:800,marginBottom:4,lineHeight:1.2}}>{r.name}</h4>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>{r.cats.slice(0,2).map(c=>(<span key={c} style={{fontSize:9,color:P.textM,fontWeight:700,background:"#EDE6FA",padding:"1px 6px",borderRadius:100,border:`1px solid ${P.border}`}}>{CE[c]} {c}</span>))}</div>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:100,background:op?"#E8FFF3":"#FFF0F3",color:op?"#1B5E3B":"#C4314B"}}>{op?"Geöffnet":"Geschl."}</span>
                      {z&&<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:100,background:"#E8F4FD",color:"#1D6FA5"}}>{z.cost==="0€"?"Gratis":z.cost}</span>}
                    </div>
                  </div>
                </div>
              );})}
            </div>
          </div>):null;})()}

          {/* Result count */}
          <div style={{fontSize:13,color:P.textM,marginBottom:14,fontWeight:600}}>
            {plzSearch.length>=4?`${filtered.length} Lieferdienste liefern zu PLZ ${plzSearch}`:`${filtered.length} Lieferdienste`}
            {plzSearch.length>0&&plzSearch.length<4&&<span style={{color:"#BC6C25"}}> — Bitte gib mindestens 4 Ziffern ein</span>}
          </div>

          {/* PREMIUM SECTION — separate from regular results */}
          {(()=>{const premFiltered=filtered.filter(r=>r.prem);const regFiltered=filtered.filter(r=>!r.prem);return(<>
            {premFiltered.length>0&&(<div style={{marginBottom:28}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{background:`${P.accent}35`,padding:"4px 12px",borderRadius:100,display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:13}}>⭐</span>
                  <span style={{fontSize:12,fontWeight:800,color:P.accent}}>Empfohlene Lieferdienste</span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:16}}>
                {premFiltered.map((r,i)=>{const op=isOpen(r.sched),th=todayH(r.sched),z=plzSearch?findZone(r,plzSearch):null;return(
                  <div key={r.id} className="card" onClick={()=>openDetail(r)} style={{background:`linear-gradient(135deg, ${P.accent}25, ${P.card})`,borderRadius:18,overflow:"hidden",animation:`fadeUp 0.4s ease ${i*0.04}s both`,position:"relative",border:`2px solid ${P.accent}30`}}>
                    <div style={{height:4,background:`linear-gradient(90deg,${P.lila},${P.rosa})`}}/>
                    <div style={{position:"absolute",top:14,right:14,background:P.accent,color:"#FFF",fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:100}}>⭐ PRO</div>
                    <div style={{padding:"20px 22px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                        <div style={{width:48,height:48,borderRadius:14,background:`${r.col}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{CE[r.cats[0]]||"🍽️"}</div>
                        <div style={{minWidth:0}}>
                          <h3 style={{fontSize:17,fontWeight:800,lineHeight:1.2,marginBottom:4}}>{r.name}</h3>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{r.cats.map(c=>(<span key={c} style={{fontSize:10,color:P.textM,fontWeight:700,background:P.card,padding:"2px 8px",borderRadius:100,border:`1px solid ${P.border}`}}>{CE[c]} {c}</span>))}</div>
                        </div>
                      </div>
                      <p style={{fontSize:13,color:P.textM,marginBottom:10,fontWeight:500}}>📍 {getAddr(r)}</p>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:100,background:op?"#E8FFF3":"#FFF0F3",color:op?"#1B5E3B":"#C4314B",display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:op?"#34D399":"#FF8FA3",display:"inline-block"}}/>{op?"Geöffnet":"Geschlossen"}</span>
                        <span style={{fontSize:11,color:P.textM,fontWeight:600,background:"#FFF",padding:"3px 10px",borderRadius:100,border:`1px solid ${P.border}`}}>🕐 {th}</span>
                        <span style={{fontSize:11,color:P.textM,fontWeight:600,background:"#FFF",padding:"3px 10px",borderRadius:100,border:`1px solid ${P.border}`}}>Min. {r.min}</span>
                      </div>
                      {z&&<div style={{marginTop:8}}><span style={{fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:100,background:"#E8F4FD",color:"#1D6FA5"}}>🚗 Lieferkosten: {z.cost==="0€"?"Kostenlos!":z.cost}</span></div>}
                      <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${P.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:700,color:P.accent}}>Speisekarte ansehen →</span><span style={{fontSize:10,color:"#8B9E82",fontWeight:600}}>{r.views}×</span></div>
                    </div>
                  </div>);})}
              </div>
            </div>)}

            {/* REGULAR RESULTS */}
            {regFiltered.length>0&&(<>
              {premFiltered.length>0&&<div style={{fontSize:12,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>Alle Ergebnisse</div>}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:16}}>
                {regFiltered.map((r,i)=>{const op=isOpen(r.sched),th=todayH(r.sched),z=plzSearch?findZone(r,plzSearch):null;return(
                  <div key={r.id} className="card" onClick={()=>openDetail(r)} style={{background:P.card,borderRadius:18,overflow:"hidden",animation:`fadeUp 0.4s ease ${i*0.04}s both`,position:"relative"}}>
                    <div style={{height:4,background:`linear-gradient(90deg,${r.col},${r.col}80)`}}/>
                    <div style={{padding:"20px 22px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                        <div style={{width:48,height:48,borderRadius:14,background:`${r.col}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{CE[r.cats[0]]||"🍽️"}</div>
                        <div style={{minWidth:0}}>
                          <h3 style={{fontSize:17,fontWeight:800,lineHeight:1.2,marginBottom:4}}>{r.name}</h3>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{r.cats.map(c=>(<span key={c} style={{fontSize:10,color:P.textM,fontWeight:700,background:"#EDE6FA",padding:"2px 8px",borderRadius:100,border:`1px solid ${P.border}`}}>{CE[c]} {c}</span>))}</div>
                        </div>
                      </div>
                      <p style={{fontSize:13,color:P.textM,marginBottom:10,fontWeight:500}}>📍 {getAddr(r)}</p>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:100,background:op?"#E8FFF3":"#FFF0F3",color:op?"#1B5E3B":"#C4314B",display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:op?"#34D399":"#FF8FA3",display:"inline-block"}}/>{op?"Geöffnet":"Geschlossen"}</span>
                        <span style={{fontSize:11,color:P.textM,fontWeight:600,background:"#EDE6FA",padding:"3px 10px",borderRadius:100,border:`1px solid ${P.border}`}}>🕐 {th}</span>
                        <span style={{fontSize:11,color:P.textM,fontWeight:600,background:"#EDE6FA",padding:"3px 10px",borderRadius:100,border:`1px solid ${P.border}`}}>Min. {r.min}</span>
                      </div>
                      {z&&<div style={{marginTop:8}}><span style={{fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:100,background:"#E8F4FD",color:"#1D6FA5"}}>🚗 Lieferkosten: {z.cost==="0€"?"Kostenlos!":z.cost}</span></div>}
                      <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${P.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:700,color:P.accent}}>Speisekarte ansehen →</span></div>
                    </div>
                  </div>);})}
              </div>
            </>)}
          </>);})()}

          {filtered.length===0&&plzSearch.length>=4&&(<div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:48,marginBottom:12}}>😕</div><h3 style={{fontSize:20,fontWeight:800,marginBottom:10}}>Noch kein Lieferdienst für PLZ {plzSearch}</h3><p style={{color:P.textM,fontSize:14,marginBottom:20}}>Kennst du einen? Schlage ihn vor oder trage ihn selbst ein!</p><button className="btn" onClick={()=>{setPage("register");resetR();}} style={{background:P.text,color:"#FFF",borderRadius:100,padding:"12px 28px",fontSize:14,fontWeight:700}}>Lieferdienst eintragen</button></div>)}
        </>):(
          /* DETAIL VIEW */
          (()=>{const op=isOpen(selRest.sched),z=plzSearch?findZone(selRest,plzSearch):null;return(<div style={{animation:"fadeUp 0.3s ease"}}><button className="btn2" onClick={()=>setSelRest(null)} style={{background:P.bg,border:`1.5px solid ${P.border}`,borderRadius:100,padding:"8px 18px",fontSize:13,fontWeight:700,marginBottom:18,color:P.textM}}>← Zurück zur Übersicht</button>
            <div style={{background:P.card,borderRadius:24,overflow:"hidden",border:`1.5px solid ${P.border}`}}>
              <div style={{height:5,background:`linear-gradient(90deg,${selRest.col},${P.mint},${selRest.col})`}}/>
              <div style={{padding:"28px 24px",borderBottom:`1px solid ${P.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                  <div style={{width:56,height:56,borderRadius:16,background:`${selRest.col}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{CE[selRest.cats[0]]||"🍽️"}</div>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:26,fontWeight:900,letterSpacing:"-0.5px",marginBottom:6}}>{selRest.name}</h2>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{selRest.cats.map(c=>(<span key={c} style={{fontSize:11,color:P.textM,fontWeight:700,background:"#EDE6FA",padding:"2px 10px",borderRadius:100,border:`1px solid ${P.border}`}}>{CE[c]} {c}</span>))}<span style={{fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:100,background:op?"#E8FFF3":"#FFF0F3",color:op?"#1B5E3B":"#C4314B"}}>{op?"Geöffnet":"Geschlossen"}</span></div>
                  </div>
                </div>
              </div>
              <div style={{padding:"24px"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))",gap:10,marginBottom:22}}>
                  {[{i:"📍",l:"Adresse",v:getAddr(selRest)},{i:"📞",l:"Telefon",v:selRest.phone},{i:"💰",l:"Mindestbestellwert",v:selRest.min}].map((x,j)=>(<div key={j} style={{background:"#EDE6FA",borderRadius:12,padding:"12px 14px",border:`1px solid ${P.border}`}}><div style={{fontSize:10,color:P.textM,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:3}}>{x.i} {x.l}</div><div style={{fontSize:14,fontWeight:700}}>{x.v}</div></div>))}
                </div>

                {/* Delivery zones table */}
                <div style={{background:"#EDE6FA",borderRadius:14,padding:"16px 18px",marginBottom:22,border:`1px solid ${P.border}`}}>
                  <div style={{fontSize:10,color:P.textM,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:12}}>🚗 Liefergebiete & Kosten</div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {selRest.zones.map((z,i)=>{const isMatch=plzSearch&&z.plz===plzSearch;return(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:8,background:isMatch?"#E8F4FD":"#FFF",border:isMatch?`2px solid #93C5FD`:`1px solid ${P.border}`}}>
                        <div><span style={{fontSize:14,fontWeight:700}}>{z.name}</span><span style={{fontSize:12,color:P.textM,marginLeft:8}}>({z.plz})</span></div>
                        <span style={{fontSize:14,fontWeight:800,color:z.cost==="0€"?"#1B5E3B":P.text}}>{z.cost==="0€"?"Kostenlos":z.cost}</span>
                      </div>
                    );})}
                  </div>
                </div>

                <div style={{background:"#EDE6FA",borderRadius:14,padding:"16px 18px",marginBottom:22,border:`1px solid ${P.border}`}}><div style={{fontSize:10,color:P.textM,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:10}}>🕐 Öffnungszeiten</div><SchedShow schedule={selRest.sched}/></div>

                {selRest.pdfUrl?(<div style={{borderRadius:18,overflow:"hidden",border:`1.5px solid ${P.border}`,marginBottom:18}}><div style={{background:"#EDE6FA",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${P.border}`}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>📄</span><div><div style={{fontSize:14,fontWeight:700}}>Speisekarte</div><div style={{fontSize:11,color:P.textM}}>{selRest.pdfName}</div></div></div><a href={selRest.pdfUrl} download={selRest.pdfName} className="btn" style={{background:P.text,color:"#FFF",borderRadius:100,padding:"8px 18px",fontSize:12,fontWeight:700,textDecoration:"none"}}>↓ Download</a></div><iframe src={selRest.pdfUrl} style={{width:"100%",height:480,border:"none"}} title="PDF"/></div>):(<div style={{background:"#EDE6FA",borderRadius:18,padding:"40px 20px",textAlign:"center",border:`2px dashed ${P.border}`,marginBottom:18}}><div style={{fontSize:48,marginBottom:10}}>📄</div><h3 style={{fontSize:18,fontWeight:800,marginBottom:6}}>Speisekarte</h3><p style={{color:P.textM,fontSize:13}}>Demo-Eintrag — PDF in der Vollversion</p></div>)}

                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button className="btn" style={{flex:1,minWidth:100,background:"#34D399",color:"#FFF",borderRadius:100,padding:"13px",fontSize:14,fontWeight:700}}>📞 Anrufen</button><button className="btn2" style={{flex:1,minWidth:100,background:P.card,border:`1.5px solid ${P.border}`,borderRadius:100,padding:"13px",fontSize:14,fontWeight:700,color:P.textM}}>📍 Route</button><button className="btn" style={{flex:1,minWidth:100,background:"#25D366",color:"#FFF",borderRadius:100,padding:"13px",fontSize:14,fontWeight:700}}>💬 WhatsApp</button></div>
              </div>
            </div></div>);})()
        )}
      </div>

      {/* SO FUNKTIONIERT'S */}
      <Reveal id="how" style={{padding:"60px 24px",background:P.section1,borderTop:`1px solid ${P.border}`}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <h2 style={{fontSize:28,fontWeight:900,textAlign:"center",marginBottom:8,letterSpacing:"-0.5px"}}>So bestellst du</h2>
          <p style={{textAlign:"center",color:P.textM,fontSize:15,marginBottom:40}}>Es ist ganz einfach.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:20}}>
            {[
              {icon:(<svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill={`${P.accent}25`}/><circle cx="32" cy="28" r="8" fill="none" stroke={P.lila} strokeWidth="2.5"/><circle cx="32" cy="28" r="3" fill={P.lila}/><path d="M32 36 L32 46" stroke={P.lila} strokeWidth="2.5" strokeLinecap="round"/></svg>),t:"Standort teilen",d:"PLZ eingeben oder Standort teilen — wir zeigen dir wer zu dir liefert."},
              {icon:(<svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill={`${P.mint}25`}/><rect x="18" y="16" width="28" height="32" rx="4" fill="none" stroke="#1B5E3B" strokeWidth="2.5"/><line x1="24" y1="26" x2="36" y2="26" stroke="#1B5E3B" strokeWidth="2" strokeLinecap="round" opacity="0.7"/><line x1="24" y1="32" x2="32" y2="32" stroke="#1B5E3B" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/><line x1="24" y1="38" x2="34" y2="38" stroke="#1B5E3B" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/></svg>),t:"Speisekarte ansehen",d:"Öffne die Karte als PDF — direkt im Browser, zum Zoomen und Blättern."},
              {icon:(<svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill={`${P.warm}25`}/><rect x="18" y="20" width="28" height="20" rx="10" fill="none" stroke="#BC6C25" strokeWidth="2.5"/><circle cx="28" cy="30" r="2" fill="#BC6C25"/><circle cx="36" cy="30" r="2" fill="#BC6C25"/><path d="M26 34 Q32 38 38 34" stroke="#BC6C25" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>),t:"Direkt bestellen",d:"Ruf an, schreib per WhatsApp oder geh vorbei — du bestellst direkt beim Laden."}
            ].map((s,i)=>(<div key={i} style={{textAlign:"center",padding:"24px 16px"}}>
              <div style={{marginBottom:16,display:"flex",justifyContent:"center"}}>{s.icon}</div>
              <h3 style={{fontSize:17,fontWeight:800,marginBottom:6}}>{s.t}</h3>
              <p style={{fontSize:13,color:P.textM,lineHeight:1.6}}>{s.d}</p>
            </div>))}
          </div>
        </div>
      </Reveal>

      {/* FAQ */}
      <Reveal id="faq" style={{maxWidth:700,margin:"0 auto",padding:"60px 24px 80px"}}><h2 style={{fontSize:28,fontWeight:900,marginBottom:24,textAlign:"center",letterSpacing:"-0.5px"}}>Häufige Fragen</h2><div style={{display:"flex",flexDirection:"column",gap:8}}>
        {[{q:"Was kostet DeliCarto für mich?",a:"Nichts. DeliCarto ist für Kunden komplett kostenlos."},{q:"Wie bestelle ich?",a:"Du findest die Speisekarte, rufst direkt beim Lieferdienst an oder schreibst per WhatsApp. Keine Zwischenhändler."},{q:"Warum nicht Lieferando?",a:"Lieferando nimmt bis zu 30% Provision. Hier bestellt der Kunde direkt — das Essen kann günstiger sein."},{q:"Woher kommen die Lieferkosten?",a:"Jeder Lieferdienst legt seine Liefergebiete und Kosten selbst fest. Die Preise siehst du direkt auf der Karte."}].map((f,i)=>(<div key={i} className="clift" style={{background:P.card,borderRadius:14,border:`1.5px solid ${P.border}`,overflow:"hidden",cursor:"pointer"}} onClick={()=>setOpenFaq(openFaq===i?null:i)}><div style={{padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{fontSize:15,fontWeight:700}}>{f.q}</h3><span style={{fontSize:18,color:P.accent,fontWeight:800,transition:"transform 0.3s",transform:openFaq===i?"rotate(45deg)":"none",flexShrink:0,marginLeft:10}}>+</span></div>{openFaq===i&&<div style={{padding:"0 22px 18px"}}><p style={{fontSize:14,color:P.textM,lineHeight:1.7}}>{f.a}</p></div>}</div>))}
      </div></Reveal>

      {/* FOOTER — Lieferando-style */}
      <footer style={{background:"#1B2A1D",color:"rgba(255,255,255,0.5)",padding:"48px 24px 28px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:36,marginBottom:36}}>
            <div style={{minWidth:200}}>
              <div style={{marginBottom:12}}><Logo h={24} light={true} showTag={true}/></div>
              <p style={{fontSize:13,lineHeight:1.7,maxWidth:260}}>Alle Speisekarten deiner Lieferdienste — an einem Ort. Direkt bestellen, ohne Umwege.</p>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>DeliCarto</div>
              {[{l:"So funktioniert's",h:"#how"},{l:"FAQ",h:"#faq"},{l:"Lieferdienst eintragen",act:()=>{setPage("register");resetR();}}].map((x,i)=>x.act?
                <a key={i} href="#" onClick={e=>{e.preventDefault();x.act();}} style={{display:"block",color:"rgba(255,255,255,0.5)",fontSize:13,fontWeight:600,textDecoration:"none",marginBottom:10,transition:"color 0.2s"}}>{x.l}</a>:
                <a key={i} href={x.h} style={{display:"block",color:"rgba(255,255,255,0.5)",fontSize:13,fontWeight:600,textDecoration:"none",marginBottom:10}}>{x.l}</a>
              )}
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Rechtliches</div>
              {["Impressum","Datenschutzerklärung","AGB","Verwendung von Cookies"].map(l=>(<a key={l} href="#" style={{display:"block",color:"rgba(255,255,255,0.5)",fontSize:13,fontWeight:600,textDecoration:"none",marginBottom:10}}>{l}</a>))}
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Kontakt</div>
              <a href="mailto:info@delicarto.de" style={{display:"block",color:"rgba(255,255,255,0.5)",fontSize:13,fontWeight:600,textDecoration:"none",marginBottom:10}}>info@delicarto.de</a>
              <div style={{display:"flex",gap:12,marginTop:12}}>
                {["instagram","facebook","tiktok"].map(s=>(<div key={s} style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,cursor:"pointer"}}>{s==="instagram"?"📷":s==="facebook"?"👤":"🎵"}</div>))}
              </div>
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:20,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.2)"}}>© {new Date().getFullYear()} DeliCarto. Alle Rechte vorbehalten.</span>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.2)"}}>Made with 💜 in Deutschland</span>
          </div>
        </div>
      </footer>
    </div>
  );

  // ═══════════════════════════════════════════
  // REGISTER PAGE (Business view)
  // ═══════════════════════════════════════════
  return(
    <div style={{fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif",background:P.heroBg,color:P.text,overflowX:"hidden",minHeight:"100vh"}}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}input,select,textarea{font-family:inherit}::placeholder{color:#A0A890}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
.btn{transition:all 0.2s ease;cursor:pointer;border:none;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;gap:6px}.btn:hover{transform:translateY(-1px)}.btn:active{transform:scale(0.98)}.btn2{transition:all 0.2s ease;cursor:pointer;font-family:inherit}.btn2:hover{background:#F0EBE0}.uz{transition:all 0.2s ease;cursor:pointer}.uz:hover{border-color:${P.accent};background:#F8F6FF}input:focus,select:focus,textarea:focus{outline:none;border-color:${P.accent};box-shadow:0 0 0 3px rgba(45,106,79,0.15)}`}</style>

      {/* Nav */}
      <nav style={{background:"#FFF",borderBottom:`1px solid ${P.border}`,padding:"14px 24px"}}>
        <div style={{maxWidth:800,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{cursor:"pointer"}} onClick={()=>setPage("home")}><Logo h={24}/></div>
          <button className="btn2" onClick={()=>setPage("home")} style={{background:P.card,border:`1.5px solid ${P.border}`,borderRadius:100,padding:"8px 18px",fontSize:13,fontWeight:700,color:P.textM}}>← Zur Startseite</button>
        </div>
      </nav>

      <div style={{maxWidth:700,margin:"0 auto",padding:"40px 24px 80px"}}>

        {/* AUTH LANDING — show pricing + login/register options */}
        {authMode==="landing"&&(<div style={{animation:"fadeUp 0.3s ease"}}>
          <h1 style={{fontSize:32,fontWeight:900,marginBottom:6,letterSpacing:"-0.5px"}}>Lieferdienst eintragen</h1>
          <p style={{color:P.textM,fontSize:15,marginBottom:32}}>Bring deine Speisekarte online — kostenlos und ohne Provision.</p>

          {/* Pricing cards — clickable */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:14,marginBottom:32}}>
            <div onClick={()=>{setSelPkg("kostenlos");setAuthMode("register");setAuthErr("");}} style={{background:P.card,borderRadius:18,padding:"24px 20px",border:selPkg==="kostenlos"?`2.5px solid ${P.accent}`:`1.5px solid ${P.border}`,cursor:"pointer",transition:"all 0.2s"}}>
              <div style={{fontSize:11,fontWeight:800,color:P.textM,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Kostenlos</div>
              <div style={{fontSize:32,fontWeight:900,marginBottom:4}}>0€</div>
              <div style={{fontSize:12,color:P.textM,fontWeight:600,marginBottom:16}}>Für immer</div>
              {["PDF-Speisekarte","Öffnungszeiten","PLZ-Suche","Unbegrenzt online"].map(f=>(<div key={f} style={{fontSize:13,fontWeight:600,color:P.textM,display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{color:"#34D399"}}>✓</span>{f}</div>))}
              <button className="btn" style={{width:"100%",marginTop:12,padding:12,fontSize:13,fontWeight:700,background:P.accent,color:"#FFF",borderRadius:100}}>Kostenlos starten →</button>
            </div>
            <div onClick={()=>{setSelPkg("premium");setAuthMode("register");setAuthErr("");}} style={{background:P.card,borderRadius:18,padding:"24px 20px",border:selPkg==="premium"?`2.5px solid ${P.accent}`:`2px solid ${P.accent}`,cursor:"pointer",position:"relative",transition:"all 0.2s"}}>
              <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",background:P.accent,color:"#FFF",fontSize:10,fontWeight:800,padding:"3px 14px",borderRadius:"0 0 8px 8px"}}>EMPFOHLEN</div>
              <div style={{fontSize:11,fontWeight:800,color:P.accent,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>⭐ Premium</div>
              <div style={{display:"flex",alignItems:"baseline",gap:2}}><span style={{fontSize:32,fontWeight:900}}>9,90€</span><span style={{fontSize:13,color:P.textM}}>/Monat</span></div>
              <div style={{fontSize:12,color:P.textM,fontWeight:600,marginBottom:16}}>Jederzeit kündbar</div>
              {["Alles aus Kostenlos","Top-Platzierung","Statistiken","Tagesangebote","WhatsApp-Button"].map(f=>(<div key={f} style={{fontSize:13,fontWeight:600,color:P.textM,display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{color:"#34D399"}}>✓</span>{f}</div>))}
              <button className="btn" style={{width:"100%",marginTop:12,padding:12,fontSize:13,fontWeight:700,background:P.accent,color:"#FFF",borderRadius:100}}>Premium wählen →</button>
            </div>
            <div onClick={()=>{setSelPkg("digi");setAuthMode("register");setAuthErr("");}} style={{background:P.card,borderRadius:18,padding:"24px 20px",border:selPkg==="digi"?`2.5px solid #BC6C25`:`1.5px solid ${P.border}`,cursor:"pointer",transition:"all 0.2s"}}>
              <div style={{fontSize:11,fontWeight:800,color:"#BC6C25",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>✨ Digitalisierung</div>
              <div style={{display:"flex",alignItems:"baseline",gap:2}}><span style={{fontSize:32,fontWeight:900}}>ab 29€</span></div>
              <div style={{fontSize:12,color:P.textM,fontWeight:600,marginBottom:16}}>Einmalig</div>
              {["Foto schicken, fertig","Professionelles PDF","Fertig in 48h","1× gratis Überarbeitung"].map(f=>(<div key={f} style={{fontSize:13,fontWeight:600,color:P.textM,display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{color:"#34D399"}}>✓</span>{f}</div>))}
              <button className="btn" style={{width:"100%",marginTop:12,padding:12,fontSize:13,fontWeight:700,background:"#BC6C25",color:"#FFF",borderRadius:100}}>Anfrage starten →</button>
            </div>
          </div>

          {/* Lieferando comparison */}
          <div style={{background:P.card,borderRadius:16,padding:"20px 22px",border:`1.5px solid ${P.border}`,marginBottom:32}}>
            <div style={{fontSize:14,fontWeight:800,marginBottom:12}}>Warum DeliCarto statt Lieferando?</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"12px 14px",borderRadius:10,background:"#FFF0F3",border:"1px solid #FFD6E0"}}>
                <div style={{fontSize:11,fontWeight:800,color:"#C4314B",marginBottom:6}}>❌ Lieferando</div>
                <div style={{fontSize:24,fontWeight:900,color:"#C4314B"}}>-900€</div>
                <div style={{fontSize:11,color:P.textM}}>pro Monat bei 3.000€ Umsatz (30% Provision)</div>
              </div>
              <div style={{padding:"12px 14px",borderRadius:10,background:"#E8FFF3",border:"1px solid #A7F3D0"}}>
                <div style={{fontSize:11,fontWeight:800,color:"#1B5E3B",marginBottom:6}}>✅ DeliCarto</div>
                <div style={{fontSize:24,fontWeight:900,color:"#1B5E3B"}}>0€</div>
                <div style={{fontSize:11,color:P.textM}}>Provision — für immer. Optional 9,90€/Monat Premium.</div>
              </div>
            </div>
          </div>

          {/* Already have account */}
          <div style={{textAlign:"center",marginTop:4}}>
            <span style={{fontSize:14,color:P.textM}}>Schon registriert? </span>
            <span onClick={()=>{setAuthMode("login");setAuthErr("");}} style={{fontSize:14,color:P.accent,fontWeight:700,cursor:"pointer",textDecoration:"underline"}}>Einloggen</span>
          </div>
        </div>)}

        {/* LOGIN FORM */}
        {authMode==="login"&&(<div style={{maxWidth:400,margin:"0 auto",animation:"fadeUp 0.3s ease"}}>
          <button className="btn2" onClick={()=>setAuthMode("landing")} style={{background:"transparent",border:"none",padding:"0 0 16px",fontSize:13,fontWeight:700,color:P.textM}}>← Zurück</button>
          <h2 style={{fontSize:26,fontWeight:900,marginBottom:6}}>Willkommen zurück</h2>
          <p style={{color:P.textM,fontSize:14,marginBottom:24}}>Logge dich ein um deinen Lieferdienst zu verwalten.</p>
          <div style={{display:"grid",gap:14}}>
            <Inp label="E-Mail" ph="deine@email.de" val={authEmail} onChange={e=>setAuthEmail(e.target.value)}/>
            <div><label style={{fontSize:11,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:6}}>Passwort</label><input type="password" placeholder="••••••••" value={authPass} onChange={e=>setAuthPass(e.target.value)} style={{width:"100%",padding:"14px 16px",fontSize:15,fontWeight:500,border:`1.5px solid ${P.border}`,borderRadius:12,background:"#FFF",color:P.text,fontFamily:"inherit"}}/></div>
            {authErr&&<div style={{background:"#FFF0F3",border:"1px solid #FFD6E0",borderRadius:10,padding:"10px 14px",fontSize:13,fontWeight:600,color:"#C4314B"}}>{authErr}</div>}
            <button className="btn" onClick={doLogin} style={{width:"100%",padding:16,fontSize:15,fontWeight:700,background:P.text,color:"#FFF",borderRadius:100}}>Einloggen</button>
            <p style={{textAlign:"center",fontSize:13,color:P.textM}}>Noch kein Konto? <span onClick={()=>{setAuthMode("register");setAuthErr("");}} style={{color:P.accent,fontWeight:700,cursor:"pointer",textDecoration:"underline"}}>Jetzt registrieren</span></p>
          </div>
        </div>)}

        {/* REGISTER FORM */}
        {authMode==="register"&&(<div style={{maxWidth:400,margin:"0 auto",animation:"fadeUp 0.3s ease"}}>
          <button className="btn2" onClick={()=>setAuthMode("landing")} style={{background:"transparent",border:"none",padding:"0 0 16px",fontSize:13,fontWeight:700,color:P.textM}}>← Zurück zur Paketauswahl</button>
          {/* Selected package indicator */}
          <div style={{background:selPkg==="digi"?"#FFF5EB":selPkg==="premium"?`${P.accent}12`:`${P.accent}08`,border:`1.5px solid ${selPkg==="digi"?"#DDA15E":P.accent}`,borderRadius:12,padding:"12px 16px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:10,color:P.textM,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px"}}>Gewähltes Paket</div><div style={{fontSize:15,fontWeight:800}}>{selPkg==="kostenlos"?"Kostenlos":selPkg==="premium"?"⭐ Premium":"✨ Digitalisierung"}</div></div>
            <div style={{fontSize:18,fontWeight:900,color:selPkg==="digi"?"#BC6C25":P.accent}}>{selPkg==="kostenlos"?"0€":selPkg==="premium"?"9,90€/M":"ab 29€"}</div>
          </div>
          <h2 style={{fontSize:26,fontWeight:900,marginBottom:6}}>Konto erstellen</h2>
          <p style={{color:P.textM,fontSize:14,marginBottom:24}}>Registriere dich und trage deinen Lieferdienst ein.</p>
          <div style={{display:"grid",gap:14}}>
            <Inp label="Dein Name" ph="Max Mustermann" val={authName} onChange={e=>setAuthName(e.target.value)}/>
            <Inp label="E-Mail" ph="deine@email.de" val={authEmail} onChange={e=>setAuthEmail(e.target.value)}/>
            <div><label style={{fontSize:11,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:6}}>Passwort</label><input type="password" placeholder="Mind. 6 Zeichen" value={authPass} onChange={e=>setAuthPass(e.target.value)} style={{width:"100%",padding:"14px 16px",fontSize:15,fontWeight:500,border:`1.5px solid ${P.border}`,borderRadius:12,background:"#FFF",color:P.text,fontFamily:"inherit"}}/></div>
            {authErr&&<div style={{background:"#FFF0F3",border:"1px solid #FFD6E0",borderRadius:10,padding:"10px 14px",fontSize:13,fontWeight:600,color:"#C4314B"}}>{authErr}</div>}
            <button className="btn" onClick={doRegister} style={{width:"100%",padding:16,fontSize:15,fontWeight:700,background:P.text,color:"#FFF",borderRadius:100}}>Konto erstellen</button>
            <p style={{fontSize:11,color:P.textM,textAlign:"center",lineHeight:1.5}}>Mit der Registrierung akzeptierst du unsere <a href="#" style={{color:P.accent}}>AGB</a> und <a href="#" style={{color:P.accent}}>Datenschutzerklärung</a>.</p>
            <p style={{textAlign:"center",fontSize:13,color:P.textM}}>Schon ein Konto? <span onClick={()=>{setAuthMode("login");setAuthErr("");}} style={{color:P.accent,fontWeight:700,cursor:"pointer",textDecoration:"underline"}}>Einloggen</span></p>
          </div>
        </div>)}

        {/* LOGGED IN — show 4-step restaurant form */}
        {authMode==="loggedIn"&&(<>
          {/* Logged in header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,padding:"12px 16px",background:P.card,borderRadius:12,border:`1.5px solid ${P.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:32,height:32,borderRadius:8,background:`${P.accent}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>👤</div><div><div style={{fontSize:13,fontWeight:700}}>{authName||authEmail}</div><div style={{fontSize:11,color:P.textM}}>{authEmail}</div></div></div>
            <button className="btn2" onClick={doLogout} style={{background:P.card,border:`1.5px solid ${P.border}`,borderRadius:100,padding:"6px 14px",fontSize:12,fontWeight:700,color:P.textM}}>Abmelden</button>
          </div>

        {rOk?(<div style={{textAlign:"center",padding:"80px 20px",animation:"fadeUp 0.4s ease"}}><div style={{fontSize:56,marginBottom:16}}>🎉</div><h2 style={{fontSize:28,fontWeight:900,marginBottom:8}}>Erfolgreich eingetragen!</h2><p style={{color:P.textM,fontSize:16,marginBottom:28}}>Dein Lieferdienst ist jetzt auf DeliCarto sichtbar.</p><button className="btn" onClick={()=>{setPage("home");resetR();doLogout();}} style={{background:P.text,color:"#FFF",borderRadius:100,padding:"14px 32px",fontSize:16,fontWeight:700}}>Zur Startseite →</button></div>):(<>
          <h1 style={{fontSize:32,fontWeight:900,marginBottom:6,letterSpacing:"-0.5px"}}>Lieferdienst eintragen</h1>
          <p style={{color:P.textM,fontSize:15,marginBottom:28}}>Kostenlos. In unter 5 Minuten. Kein Vertrag, keine Provision.</p>

          {/* Progress */}
          <div style={{display:"flex",gap:4,marginBottom:32}}>{[1,2,3,4].map(s=>(<div key={s} style={{flex:1,height:4,borderRadius:2,background:s<=rStep?`linear-gradient(90deg,${P.mint},${P.lila})`:P.border,transition:"background 0.4s"}}/>))}</div>

          {/* Step 1: Basic info */}
          {rStep===1&&<div style={{display:"grid",gap:14,animation:"fadeUp 0.2s ease"}}>
            <h3 style={{fontSize:18,fontWeight:800,marginBottom:4}}>1. Grundinfos</h3>
            <Inp label="Name des Lieferdienstes *" ph="z.B. Kebab König" val={rData.name} onChange={e=>setRD({...rData,name:e.target.value})}/>
            <div><label style={{fontSize:11,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:8}}>Küche / Tags * <span style={{fontWeight:500,textTransform:"none",letterSpacing:0,color:"#A0A890"}}>(Mehrfachauswahl)</span></label><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{CATS.filter(c=>c!=="Alle").map(c=>{const sel=rData.cats.includes(c);return(<button key={c} type="button" onClick={()=>setRD({...rData,cats:sel?rData.cats.filter(x=>x!==c):[...rData.cats,c]})} style={{padding:"7px 14px",borderRadius:100,fontSize:11,fontWeight:700,border:sel?"none":`1.5px solid ${P.border}`,background:sel?P.lila:"#FFF",color:sel?"#FFF":P.textM,cursor:"pointer",display:"flex",alignItems:"center",gap:3,transition:"all 0.15s"}}><span style={{fontSize:13}}>{CE[c]}</span>{c}{sel&&<span style={{marginLeft:2,opacity:0.6}}>✕</span>}</button>);})}</div></div>
            <div style={{display:"grid",gridTemplateColumns:"3fr 1fr",gap:10}}><Inp label="Straße *" ph="Hauptstraße" val={rData.street} onChange={e=>setRD({...rData,street:e.target.value})}/><Inp label="Nr. *" ph="12" val={rData.nr} onChange={e=>setRD({...rData,nr:e.target.value})}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}><Inp label="PLZ *" ph="10827" val={rData.plz} onChange={e=>setRD({...rData,plz:e.target.value.replace(/\D/g,"").slice(0,5)})}/><Inp label="Ort *" ph="Berlin" val={rData.city} onChange={e=>setRD({...rData,city:e.target.value})}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Telefon" ph="030 1234567" val={rData.phone} onChange={e=>setRD({...rData,phone:e.target.value})}/><Inp label="Mindestbestellwert" ph="10€" val={rData.min} onChange={e=>setRD({...rData,min:e.target.value})}/></div>
            <button className="btn" onClick={()=>{if(rData.name&&rData.cats.length>0&&rData.street&&rData.plz&&rData.city)setRStep(2);}} disabled={!rData.name||rData.cats.length===0||!rData.street||!rData.plz||!rData.city} style={{width:"100%",padding:14,marginTop:6,fontSize:15,fontWeight:700,background:(rData.name&&rData.cats.length>0&&rData.street&&rData.plz&&rData.city)?P.text:"#E5DDD0",color:(rData.name&&rData.cats.length>0&&rData.street&&rData.plz&&rData.city)?"#FFF":"#A0A890",borderRadius:100,cursor:(rData.name&&rData.cats.length>0&&rData.street&&rData.plz&&rData.city)?"pointer":"not-allowed"}}>Weiter → Liefergebiete</button>
          </div>}

          {/* Step 2: Delivery zones */}
          {rStep===2&&<div style={{animation:"fadeUp 0.2s ease"}}>
            <h3 style={{fontSize:18,fontWeight:800,marginBottom:4}}>2. Liefergebiete</h3>
            <p style={{color:P.textM,fontSize:13,marginBottom:16}}>Trage die Orte/Stadtteile ein die du belieferst, mit der jeweiligen PLZ und den Lieferkosten.</p>
            <ZoneEditor zones={rData.zones} onChange={z=>setRD({...rData,zones:z})}/>
            <div style={{display:"flex",gap:8,marginTop:22}}><button className="btn2" onClick={()=>setRStep(1)} style={{flex:1,padding:14,fontSize:14,fontWeight:700,background:P.card,border:`1.5px solid ${P.border}`,borderRadius:100,color:P.textM}}>← Zurück</button><button className="btn" onClick={()=>{if(rData.zones.some(z=>z.name&&z.plz))setRStep(3);}} disabled={!rData.zones.some(z=>z.name&&z.plz)} style={{flex:2,padding:14,fontSize:15,fontWeight:700,background:rData.zones.some(z=>z.name&&z.plz)?P.text:"#E5DDD0",color:rData.zones.some(z=>z.name&&z.plz)?"#FFF":"#A0A890",borderRadius:100,cursor:rData.zones.some(z=>z.name&&z.plz)?"pointer":"not-allowed"}}>Weiter → Öffnungszeiten</button></div>
          </div>}

          {/* Step 3: Schedule */}
          {rStep===3&&<div style={{animation:"fadeUp 0.2s ease"}}>
            <h3 style={{fontSize:18,fontWeight:800,marginBottom:16}}>3. Öffnungszeiten</h3>
            <SchedEdit schedule={rData.sched} onChange={s=>setRD({...rData,sched:s})}/>
            <div style={{display:"flex",gap:8,marginTop:22}}><button className="btn2" onClick={()=>setRStep(2)} style={{flex:1,padding:14,fontSize:14,fontWeight:700,background:P.card,border:`1.5px solid ${P.border}`,borderRadius:100,color:P.textM}}>← Zurück</button><button className="btn" onClick={()=>setRStep(4)} style={{flex:2,padding:14,fontSize:15,fontWeight:700,background:P.text,color:"#FFF",borderRadius:100}}>Weiter → Speisekarte</button></div>
          </div>}

          {/* Step 4: PDF upload */}
          {rStep===4&&<div style={{animation:"fadeUp 0.2s ease"}}>
            <h3 style={{fontSize:18,fontWeight:800,marginBottom:16}}>4. Speisekarte hochladen</h3>
            <input type="file" accept=".pdf" ref={fRef} onChange={e=>{const f=e.target.files[0];if(f)setRD({...rData,file:f});}} style={{display:"none"}}/>
            {!rData.file?<div className="uz" onClick={()=>fRef.current?.click()} style={{border:`2px dashed ${P.border}`,borderRadius:18,padding:"48px 20px",textAlign:"center",background:"#FFF"}}>
              <div style={{fontSize:52,marginBottom:14}}>📄</div>
              <h3 style={{fontSize:18,fontWeight:800,marginBottom:6}}>PDF hier hochladen</h3>
              <p style={{color:P.textM,fontSize:14,marginBottom:16}}>Klicke hier oder ziehe deine Speisekarte rein</p>
              <div style={{padding:"12px 16px",background:`${P.accent}30`,borderRadius:12,fontSize:13,fontWeight:600,color:P.accent,display:"inline-block"}}>📸 Kein PDF? <span style={{textDecoration:"underline",cursor:"pointer"}} onClick={e=>{e.stopPropagation();setModal("digi");}}>Digitalisierung ab 29€</span></div>
            </div>:(<div style={{background:"#E8FFF3",borderRadius:14,padding:"18px",display:"flex",alignItems:"center",gap:12,border:"1px solid #A7F3D0"}}><span style={{fontSize:22}}>✅</span><div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:700,color:"#1B5E3B"}}>Hochgeladen</div><div style={{fontSize:12,color:P.textM,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{rData.file.name}</div></div><button onClick={()=>setRD({...rData,file:null})} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:P.textM}}>✕</button></div>)}
            <div style={{display:"flex",gap:8,marginTop:22}}><button className="btn2" onClick={()=>setRStep(3)} style={{flex:1,padding:14,fontSize:14,fontWeight:700,background:P.card,border:`1.5px solid ${P.border}`,borderRadius:100,color:P.textM}}>← Zurück</button><button className="btn" onClick={submitR} disabled={!rData.file} style={{flex:2,padding:14,fontSize:15,fontWeight:700,background:rData.file?P.text:"#E5DDD0",color:rData.file?"#FFF":"#A0A890",borderRadius:100,cursor:rData.file?"pointer":"not-allowed"}}>✨ Veröffentlichen</button></div>
          </div>}
        </>)}
        </>)}
      </div>

      {/* Digi Modal */}
      {modal==="digi"&&<Overlay onClose={resetD}>{dOk?(<div style={{padding:"56px 28px",textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>✨</div><h3 style={{fontSize:22,fontWeight:900,marginBottom:6}}>Anfrage gesendet!</h3><p style={{color:P.textM,fontSize:14}}>Wir melden uns in 24h.</p></div>):(<><div style={{padding:"22px 24px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><h2 style={{fontSize:20,fontWeight:900}}>Digitalisierung</h2><p style={{color:P.textM,fontSize:12}}>Schritt {dStep}/2</p></div><button onClick={resetD} style={{width:34,height:34,borderRadius:10,border:`1.5px solid ${P.border}`,background:"#FFF",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",color:P.textM}}>✕</button></div>
        <div style={{padding:"20px 24px 26px"}}>
          {dStep===1&&<div style={{animation:"fadeUp 0.2s ease"}}><label style={{fontSize:11,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:8}}>Paket wählen *</label><div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>{[{id:"standard",n:"Standard",p:"29€",d:"1 Seite · 48h"},{id:"profi",n:"Profi",p:"49€",d:"4 Seiten · Logo · 24h",pop:true},{id:"premium",n:"Premium",p:"79€",d:"Unbegrenzt · 12h"}].map(pk=>(<div key={pk.id} onClick={()=>setDD({...dData,pkg:pk.id})} style={{padding:"14px 16px",borderRadius:14,cursor:"pointer",border:dData.pkg===pk.id?`2px solid ${P.lila}`:`1.5px solid ${P.border}`,background:dData.pkg===pk.id?`${P.lila}10`:"#FFF",position:"relative"}}>{pk.pop&&<span style={{position:"absolute",top:-7,right:12,background:P.accent,color:"#FFF",fontSize:9,fontWeight:800,padding:"2px 10px",borderRadius:100}}>BELIEBT</span>}<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:14,fontWeight:800}}>{pk.n}</div><div style={{fontSize:12,color:P.textM}}>{pk.d}</div></div><div style={{fontSize:22,fontWeight:900,color:P.accent}}>{pk.p}</div></div></div>))}</div><div style={{display:"grid",gap:12}}><Inp label="Restaurant *" ph="z.B. Döner Meister" val={dData.name} onChange={e=>setDD({...dData,name:e.target.value})}/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Telefon *" ph="0176 ..." val={dData.phone} onChange={e=>setDD({...dData,phone:e.target.value})}/><Inp label="E-Mail" ph="info@..." val={dData.email} onChange={e=>setDD({...dData,email:e.target.value})}/></div></div><button className="btn" onClick={()=>{if(dData.name&&dData.phone)setDStep(2);}} disabled={!dData.name||!dData.phone} style={{width:"100%",padding:14,marginTop:16,fontSize:14,fontWeight:700,background:(dData.name&&dData.phone)?P.text:"#E5DDD0",color:(dData.name&&dData.phone)?"#FFF":"#A0A890",borderRadius:100}}>Weiter → Fotos</button></div>}
          {dStep===2&&<div style={{animation:"fadeUp 0.2s ease"}}><input type="file" accept="image/*,.pdf" multiple ref={diRef} onChange={e=>setDD({...dData,photos:e.target.files})} style={{display:"none"}}/>{!dData.photos?<div className="uz" onClick={()=>diRef.current?.click()} style={{border:`2px dashed ${P.rosa}`,borderRadius:18,padding:"36px 20px",textAlign:"center",background:`${P.rosa}35`}}><div style={{fontSize:48,marginBottom:10}}>📸</div><h3 style={{fontSize:17,fontWeight:800}}>Karte abfotografieren</h3></div>:(<div style={{background:`${P.accent}35`,borderRadius:14,padding:"14px",display:"flex",alignItems:"center",gap:10,border:`1px solid ${P.accent}40`}}><span>📸</span><div style={{flex:1,fontSize:13,fontWeight:700,color:P.accent}}>{dData.photos.length} Datei(en)</div><button onClick={()=>setDD({...dData,photos:null})} style={{background:"none",border:"none",cursor:"pointer",color:P.textM}}>✕</button></div>)}<div style={{marginTop:14}}><label style={{fontSize:11,fontWeight:700,color:P.textM,textTransform:"uppercase",display:"block",marginBottom:6}}>Anmerkungen</label><textarea placeholder="z.B. mehrsprachig" value={dData.notes} onChange={e=>setDD({...dData,notes:e.target.value})} rows={3} style={{width:"100%",padding:"12px",fontSize:14,border:`1.5px solid ${P.border}`,borderRadius:12,background:"#FFF",resize:"vertical",fontFamily:"inherit"}}/></div><div style={{display:"flex",gap:8,marginTop:18}}><button className="btn2" onClick={()=>setDStep(1)} style={{flex:1,padding:12,fontSize:14,fontWeight:700,background:P.card,border:`1.5px solid ${P.border}`,borderRadius:100,color:P.textM}}>← Zurück</button><button className="btn" onClick={()=>{if(dData.photos){setDOk(true);setTimeout(resetD,2500);}}} disabled={!dData.photos} style={{flex:2,padding:12,fontSize:14,fontWeight:700,background:dData.photos?P.text:"#E5DDD0",color:dData.photos?"#FFF":"#A0A890",borderRadius:100}}>Anfrage senden →</button></div></div>}
        </div></>)}</Overlay>}
    </div>
  );
}
