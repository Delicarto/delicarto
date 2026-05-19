"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

const P={accent:"#2D6A4F",mint:"#40916C",warm:"#D4A373",text:"#1B2A1D",textM:"#6B7E6F",border:"#D5CCBB",bg:"#F5F0E8",card:"#FFFDF8"};
const DAYS=["Mo","Di","Mi","Do","Fr","Sa","So"];
const TIMES=[];for(let h=0;h<24;h++){TIMES.push(`${String(h).padStart(2,"0")}:00`);TIMES.push(`${String(h).padStart(2,"0")}:30`);}
const mkDS=()=>DAYS.map(()=>({closed:false,slots:[{open:"11:00",close:"22:00"}]}));
const CATS=["Italienisch","Vietnamesisch","Türkisch","Japanisch","Indisch","Griechisch","Chinesisch","Mexikanisch","Deutsch","Vegan","Vegetarisch","Halal","Burger","Sonstiges"];
const CE={"Italienisch":"🍕","Vietnamesisch":"🍜","Türkisch":"🥙","Japanisch":"🍣","Indisch":"🍛","Griechisch":"🥗","Chinesisch":"🥡","Mexikanisch":"🌮","Deutsch":"🥨","Vegan":"🌱","Vegetarisch":"🥬","Halal":"☪️","Burger":"🍔","Sonstiges":"🍽️"};
const CC=["#2D6A4F","#40916C","#52796F","#588157","#D4A373","#BC6C25","#DDA15E","#E9C46A"];
const mkEmpty=()=>({name:"",cats:[],street:"",nr:"",plz:"",city:"",phone:"",whatsapp:"",website:"",dailySpecial:"",min:"",sched:mkDS(),delivSched:null,useDelivSched:false,zones:[{name:"",plz:"",cost:"0€",minOrder:""}],file:null,pdfUrl:"",pdfName:"",isPremium:false,imageFile:null,imageUrl:""});
const lb={fontSize:11,fontWeight:700,color:"#6B7E6F",textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:6};
const is={fontSize:14,fontWeight:500,border:"1.5px solid #D5CCBB",borderRadius:10,background:"#FFF",color:"#1B2A1D",padding:"12px 14px",width:"100%",fontFamily:"inherit"};

// Klick-Typ-Labels für Anzeige
const CLICK_LABELS={
  phone:"📞 Telefon",
  whatsapp:"💬 WhatsApp",
  pdf:"📄 PDF-Download",
  pdf_view:"👁️ PDF-Ansicht",
  route:"📍 Route",
  website:"🌐 Website",
  plz_search:"🔍 PLZ-Suche"
};

// Status-Badge Helper
const statusBadge=(status)=>{
  if(status==="approved")return{label:"✅ Freigegeben",bg:"#E8F5E9",color:"#1B5E3B"};
  if(status==="rejected")return{label:"❌ Abgelehnt",bg:"#FFF0F3",color:"#C4314B"};
  return{label:"⏳ Wartet auf Freigabe",bg:"#FFF5EB",color:"#BC6C25"};
};

// ============ FORM COMPONENT ============
function RestForm({initial,editId,user,onSaved,onCancel}){
  const[f,setF]=useState(initial||mkEmpty());
  const[saving,setSaving]=useState(false);
  const[formMsg,setFormMsg]=useState("");
  const fRef=useRef(null);
  const upd=(k,v)=>setF(prev=>({...prev,[k]:v}));

  const save=async()=>{
    const errors=[];
    if(!f.name.trim())errors.push("Name fehlt");
    if(f.cats.length===0)errors.push("Mindestens eine Küche/Tag auswählen");
    if(!f.street.trim()||!f.plz.trim()||!f.city.trim())errors.push("Adresse unvollständig (Straße, PLZ, Ort)");
    if(!f.zones.some(z=>z.name.trim()&&z.plz.trim()))errors.push("Mindestens ein Liefergebiet mit Ort und PLZ");
    if(errors.length>0){setFormMsg("❌ "+errors.join(" · "));return;}
    setSaving(true);setFormMsg("");
    try{
      let pdfUrl=f.pdfUrl,pdfName=f.pdfName;
      let imageUrl=f.imageUrl;
      if(f.imageFile){
        const imgName=`img-${Date.now()}-${f.imageFile.name}`;
        const{error:ie}=await supabase.storage.from("menus").upload(imgName,f.imageFile);
        if(ie)throw ie;
        const{data:{publicUrl}}=supabase.storage.from("menus").getPublicUrl(imgName);
        imageUrl=publicUrl;
      }
      if(f.file){
        const fn=`${Date.now()}-${f.file.name}`;
        const{error:fe}=await supabase.storage.from("menus").upload(fn,f.file);
        if(fe)throw fe;
        const{data:{publicUrl}}=supabase.storage.from("menus").getPublicUrl(fn);
        pdfUrl=publicUrl;pdfName=f.file.name;
      }
      const rd={name:f.name,categories:f.cats,street:f.street,house_nr:f.nr,plz:f.plz,city:f.city,phone:f.phone||null,whatsapp:f.whatsapp||null,website:f.website||null,daily_special:f.dailySpecial||null,image_url:imageUrl||null,schedule:f.sched,delivery_schedule:f.useDelivSched?f.delivSched:null,min_order:f.min||null,pdf_url:pdfUrl||null,pdf_name:pdfName||null,color:CC[Math.floor(Math.random()*CC.length)],is_premium:f.isPremium,owner_id:user.id};
      if(!editId){rd.approval_status="approved";rd.approved_at=new Date().toISOString();}
      let rid=editId;
      if(editId){
        const{error}=await supabase.from("restaurants").update(rd).eq("id",editId);
        if(error)throw error;
        await supabase.from("delivery_zones").delete().eq("restaurant_id",editId);
      }else{
        const{data,error}=await supabase.from("restaurants").insert(rd).select().single();
        if(error)throw error;
        rid=data.id;
      }
      const vz=f.zones.filter(z=>z.name&&z.plz);
      if(vz.length>0)await supabase.from("delivery_zones").insert(vz.map(z=>({restaurant_id:rid,zone_name:z.name,plz:z.plz,delivery_cost:z.cost||"0€",min_order:z.minOrder||null})));
      onSaved(editId?"✅ Gespeichert!":"✅ Angelegt!");
    }catch(e){setFormMsg("❌ "+e.message);}
    setSaving(false);
  };

  return(<div style={{background:P.card,borderRadius:20,padding:"28px 24px",border:`1.5px solid ${P.border}`}}>
    <h2 style={{fontSize:20,fontWeight:900,marginBottom:20}}>{editId?"✏️ Bearbeiten":"+ Neuer Lieferdienst"}</h2>
    {formMsg&&<div style={{padding:"10px 14px",borderRadius:10,marginBottom:16,background:formMsg.startsWith("❌")?"#FFF0F3":"#E8F5E9",fontSize:13,fontWeight:700,color:formMsg.startsWith("❌")?"#C4314B":"#1B5E3B"}}>{formMsg}</div>}
    <div style={{display:"grid",gap:16}}>
      <div><label style={lb}>Name *</label><input style={is} placeholder="z.B. Kebab König" value={f.name} onChange={e=>upd("name",e.target.value)}/></div>
      <div><label style={lb}>Küche *</label><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{CATS.map(c=>{const s=f.cats.includes(c);return(<button key={c} type="button" onClick={()=>upd("cats",s?f.cats.filter(x=>x!==c):[...f.cats,c])} style={{padding:"6px 12px",borderRadius:100,fontSize:11,fontWeight:700,border:s?"none":"1.5px solid #D5CCBB",background:s?"#2D6A4F":"#FFF",color:s?"#FFF":"#6B7E6F",cursor:"pointer"}}>{CE[c]} {c}</button>);})}</div></div>
      <div style={{display:"grid",gridTemplateColumns:"3fr 1fr",gap:10}}><div><label style={lb}>Straße</label><input style={is} placeholder="Hauptstr." value={f.street} onChange={e=>upd("street",e.target.value)}/></div><div><label style={lb}>Nr.</label><input style={is} placeholder="12" value={f.nr} onChange={e=>upd("nr",e.target.value)}/></div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}><div><label style={lb}>PLZ</label><input style={is} placeholder="49632" value={f.plz} onChange={e=>upd("plz",e.target.value.replace(/\D/g,"").slice(0,5))}/></div><div><label style={lb}>Ort</label><input style={is} placeholder="Essen" value={f.city} onChange={e=>upd("city",e.target.value)}/></div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><label style={lb}>Telefon</label><input style={is} placeholder="05434-1234567" value={f.phone} onChange={e=>upd("phone",e.target.value)}/></div><div><label style={lb}>Mindestbestellwert</label><input style={is} placeholder="10€" value={f.min} onChange={e=>upd("min",e.target.value)}/></div></div>
      <div><label style={lb}>WhatsApp-Nummer (optional)</label><input style={is} placeholder="z.B. 4917412345678 (mit Ländervorwahl)" value={f.whatsapp||""} onChange={e=>upd("whatsapp",e.target.value)}/></div>
      <div><label style={lb}>Website (optional)</label><input style={is} placeholder="z.B. www.hotspicy-essen.de" value={f.website||""} onChange={e=>upd("website",e.target.value)}/></div>
      <div><label style={lb}>Tagesangebote (optional, nur Premium)</label><textarea style={{...is,height:100,resize:"vertical"}} placeholder={"Mo: Nudeltag - alle Nudeln 7€\nDi: Pizzatag - alle 28cm Pizza 7€\nMi: Schnitzeltag 9€"} value={f.dailySpecial||""} onChange={e=>upd("dailySpecial",e.target.value)}/></div>
      <div style={{display:"flex",alignItems:"center",gap:10}}><button onClick={()=>upd("isPremium",!f.isPremium)} style={{width:48,height:26,borderRadius:13,background:f.isPremium?"#2D6A4F":"#DDD",border:"none",cursor:"pointer",position:"relative"}}><div style={{width:22,height:22,borderRadius:11,background:"#FFF",position:"absolute",top:2,left:f.isPremium?24:2,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/></button><span style={{fontSize:13,fontWeight:700,color:f.isPremium?"#2D6A4F":"#6B7E6F"}}>⭐ Premium</span></div>

      <div><label style={lb}>Liefergebiete</label>
        {f.zones.map((z,i)=>(<div key={i} style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap",alignItems:"end"}}>
          <div style={{width:140}}>{i===0&&<label style={lb}>Ort</label>}<input style={is} placeholder="Essen" value={z.name} onChange={e=>{const n=[...f.zones];n[i]={...n[i],name:e.target.value};upd("zones",n);}}/></div>
          <div style={{width:90}}>{i===0&&<label style={lb}>PLZ</label>}<input style={is} placeholder="49632" value={z.plz} onChange={e=>{const n=[...f.zones];n[i]={...n[i],plz:e.target.value.replace(/\D/g,"").slice(0,5)};upd("zones",n);}}/></div>
          <div style={{width:100}}>{i===0&&<label style={lb}>Kosten</label>}<input style={is} placeholder="2,50€" value={z.cost} onChange={e=>{const n=[...f.zones];n[i]={...n[i],cost:e.target.value};upd("zones",n);}}/></div>
          <div style={{width:100}}>{i===0&&<label style={lb}>Min.Best.</label>}<input style={is} placeholder="10€" value={z.minOrder} onChange={e=>{const n=[...f.zones];n[i]={...n[i],minOrder:e.target.value};upd("zones",n);}}/></div>
          {f.zones.length>1&&<button onClick={()=>upd("zones",f.zones.filter((_,j)=>j!==i))} style={{width:32,height:32,borderRadius:8,border:"none",background:"#FFF0F3",color:"#C4314B",fontSize:14,cursor:"pointer"}}>✕</button>}
        </div>))}
        <button onClick={()=>upd("zones",[...f.zones,{name:"",plz:"",cost:"0€",minOrder:""}])} style={{padding:"6px 14px",borderRadius:100,border:"1.5px dashed #D5CCBB",background:"transparent",color:"#2D6A4F",fontSize:12,fontWeight:700,cursor:"pointer",marginTop:4}}>+ Liefergebiet</button>
      </div>

      <div><label style={lb}>Öffnungszeiten (Laden / Abholung)</label>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {DAYS.map((_,i)=>{const d=f.sched[i];return(<div key={i} style={{padding:"8px 12px",borderRadius:10,background:d.closed?"#FFF0F3":"#F5F0E8",border:`1px solid ${d.closed?"#FFD6E0":"#D5CCBB"}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <div style={{width:28,fontWeight:800,fontSize:12}}>{DAYS[i]}</div>
              <button onClick={()=>{const s=[...f.sched];s[i]={...s[i],closed:!s[i].closed,slots:s[i].closed?[{open:"11:00",close:"22:00"}]:s[i].slots};upd("sched",s);}} style={{padding:"3px 10px",borderRadius:8,fontSize:10,fontWeight:700,cursor:"pointer",border:"none",background:d.closed?"#FF8FA3":"#40916C",color:d.closed?"#FFF":"#1B5E3B"}}>{d.closed?"Ruhetag":"Geöffnet"}</button>
              {!d.closed&&<button onClick={()=>{const src=f.sched[i];upd("sched",f.sched.map(()=>({closed:src.closed,slots:src.slots.map(s=>({...s}))})));}} style={{marginLeft:"auto",padding:"3px 8px",borderRadius:6,fontSize:9,fontWeight:700,cursor:"pointer",border:"1px solid #D5CCBB",background:"#FFF",color:"#6B7E6F"}}>📋 Alle</button>}
            </div>
            {!d.closed&&<div style={{marginTop:6,display:"flex",flexDirection:"column",gap:4}}>
              {d.slots.map((sl,si)=>(<div key={si} style={{display:"flex",alignItems:"center",gap:6}}>
                <select value={sl.open} onChange={e=>{const s=[...f.sched];s[i]={...s[i],slots:s[i].slots.map((x,k)=>k===si?{...x,open:e.target.value}:x)};upd("sched",s);}} style={{padding:"3px 6px",borderRadius:6,border:"1px solid #D5CCBB",fontSize:12,background:"#FFF"}}>{TIMES.map(t=><option key={t} value={t}>{t}</option>)}</select>
                <span style={{fontSize:12,color:"#6B7E6F"}}>–</span>
                <select value={sl.close} onChange={e=>{const s=[...f.sched];s[i]={...s[i],slots:s[i].slots.map((x,k)=>k===si?{...x,close:e.target.value}:x)};upd("sched",s);}} style={{padding:"3px 6px",borderRadius:6,border:"1px solid #D5CCBB",fontSize:12,background:"#FFF"}}>{TIMES.map(t=><option key={t} value={t}>{t}</option>)}</select>
                {d.slots.length>1&&<button onClick={()=>{const s=[...f.sched];s[i]={...s[i],slots:s[i].slots.filter((_,k)=>k!==si)};upd("sched",s);}} style={{width:22,height:22,borderRadius:6,border:"none",background:"#FFF0F3",color:"#FF8FA3",fontSize:11,cursor:"pointer"}}>✕</button>}
              </div>))}
              {d.slots.length<3&&<button onClick={()=>{const s=[...f.sched];s[i]={...s[i],slots:[...s[i].slots,{open:"17:00",close:"22:00"}]};upd("sched",s);}} style={{padding:"3px 10px",borderRadius:6,border:"1px dashed #D5CCBB",background:"transparent",color:"#2D6A4F",fontSize:10,fontWeight:700,cursor:"pointer",alignSelf:"flex-start"}}>+ Zeitspanne</button>}
            </div>}
          </div>);})}
        </div>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>{upd("useDelivSched",!f.useDelivSched);if(!f.delivSched)upd("delivSched",mkDS());}} style={{width:48,height:26,borderRadius:13,background:f.useDelivSched?"#2D6A4F":"#DDD",border:"none",cursor:"pointer",position:"relative"}}>
          <div style={{width:22,height:22,borderRadius:11,background:"#FFF",position:"absolute",top:2,left:f.useDelivSched?24:2,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
        </button>
        <span style={{fontSize:13,fontWeight:700,color:f.useDelivSched?"#2D6A4F":"#6B7E6F"}}>Abweichende Lieferzeiten</span>
      </div>

      {f.useDelivSched&&<div><label style={lb}>Lieferzeiten</label>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {DAYS.map((_,i)=>{const d=(f.delivSched||mkDS())[i];return(<div key={`d${i}`} style={{padding:"8px 12px",borderRadius:10,background:d.closed?"#FFF0F3":"#E8F4FD",border:`1px solid ${d.closed?"#FFD6E0":"#93C5FD"}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <div style={{width:28,fontWeight:800,fontSize:12}}>{DAYS[i]}</div>
              <button onClick={()=>{const s=[...(f.delivSched||mkDS())];s[i]={...s[i],closed:!s[i].closed,slots:s[i].closed?[{open:"17:00",close:"22:00"}]:s[i].slots};upd("delivSched",s);}} style={{padding:"3px 10px",borderRadius:8,fontSize:10,fontWeight:700,cursor:"pointer",border:"none",background:d.closed?"#FF8FA3":"#1D6FA5",color:"#FFF"}}>{d.closed?"Keine Lieferung":"Lieferung"}</button>
              {!d.closed&&<button onClick={()=>{const src=(f.delivSched||mkDS())[i];upd("delivSched",(f.delivSched||mkDS()).map(()=>({closed:src.closed,slots:src.slots.map(s=>({...s}))})));}} style={{marginLeft:"auto",padding:"3px 8px",borderRadius:6,fontSize:9,fontWeight:700,cursor:"pointer",border:"1px solid #D5CCBB",background:"#FFF",color:"#6B7E6F"}}>📋 Alle</button>}
            </div>
            {!d.closed&&<div style={{marginTop:6,display:"flex",flexDirection:"column",gap:4}}>
              {d.slots.map((sl,si)=>(<div key={si} style={{display:"flex",alignItems:"center",gap:6}}>
                <select value={sl.open} onChange={e=>{const s=[...(f.delivSched||mkDS())];s[i]={...s[i],slots:s[i].slots.map((x,k)=>k===si?{...x,open:e.target.value}:x)};upd("delivSched",s);}} style={{padding:"3px 6px",borderRadius:6,border:"1px solid #93C5FD",fontSize:12,background:"#FFF"}}>{TIMES.map(t=><option key={t} value={t}>{t}</option>)}</select>
                <span style={{fontSize:12,color:"#6B7E6F"}}>–</span>
                <select value={sl.close} onChange={e=>{const s=[...(f.delivSched||mkDS())];s[i]={...s[i],slots:s[i].slots.map((x,k)=>k===si?{...x,close:e.target.value}:x)};upd("delivSched",s);}} style={{padding:"3px 6px",borderRadius:6,border:"1px solid #93C5FD",fontSize:12,background:"#FFF"}}>{TIMES.map(t=><option key={t} value={t}>{t}</option>)}</select>
                {d.slots.length>1&&<button onClick={()=>{const s=[...(f.delivSched||mkDS())];s[i]={...s[i],slots:s[i].slots.filter((_,k)=>k!==si)};upd("delivSched",s);}} style={{width:22,height:22,borderRadius:6,border:"none",background:"#FFF0F3",color:"#FF8FA3",fontSize:11,cursor:"pointer"}}>✕</button>}
              </div>))}
              {d.slots.length<3&&<button onClick={()=>{const s=[...(f.delivSched||mkDS())];s[i]={...s[i],slots:[...s[i].slots,{open:"17:00",close:"22:00"}]};upd("delivSched",s);}} style={{padding:"3px 10px",borderRadius:6,border:"1px dashed #93C5FD",background:"transparent",color:"#1D6FA5",fontSize:10,fontWeight:700,cursor:"pointer",alignSelf:"flex-start"}}>+ Zeitspanne</button>}
            </div>}
          </div>);})}
        </div>
      </div>}

      <div><label style={lb}>Logo oder Foto (optional)</label>
        <input type="file" accept="image/*" id="imgUpload" onChange={e=>{if(e.target.files[0])upd("imageFile",e.target.files[0]);}} style={{display:"none"}}/>
        {f.imageUrl&&!f.imageFile&&<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}><img src={f.imageUrl} style={{width:48,height:48,borderRadius:12,objectFit:"cover"}} alt="Logo"/><span style={{fontSize:13,fontWeight:600,color:"#1B5E3B"}}>Bild vorhanden</span></div>}
        {f.imageFile&&<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}><img src={URL.createObjectURL(f.imageFile)} style={{width:48,height:48,borderRadius:12,objectFit:"cover"}} alt="Vorschau"/><span style={{fontSize:13,fontWeight:600,color:"#1B5E3B"}}>{f.imageFile.name}</span><button onClick={()=>upd("imageFile",null)} style={{background:"none",border:"none",cursor:"pointer",color:"#6B7E6F"}}>✕</button></div>}
        <button onClick={()=>document.getElementById("imgUpload")?.click()} style={{padding:"10px 18px",borderRadius:100,border:"1.5px dashed #D5CCBB",background:"transparent",color:"#2D6A4F",fontSize:12,fontWeight:700,cursor:"pointer"}}>{f.imageUrl?"🖼️ Neues Bild":"🖼️ Bild hochladen"}</button>
        <div style={{fontSize:11,color:"#6B7E6F",marginTop:4}}>Wird automatisch quadratisch zugeschnitten. Kein Bild = Küchen-Emoji.</div>
      </div>

      <div><label style={lb}>Speisekarte (PDF)</label>
        <input type="file" accept=".pdf" ref={fRef} onChange={e=>{if(e.target.files[0])upd("file",e.target.files[0]);}} style={{display:"none"}}/>
        {f.pdfUrl&&!f.file&&<div style={{background:"#E8F5E9",borderRadius:10,padding:"10px 14px",marginBottom:8,fontSize:13,fontWeight:600,color:"#1B5E3B"}}>📄 {f.pdfName}</div>}
        {f.file&&<div style={{background:"#E8F5E9",borderRadius:10,padding:"10px 14px",marginBottom:8,fontSize:13,fontWeight:600,color:"#1B5E3B",display:"flex",justifyContent:"space-between"}}>📄 {f.file.name}<button onClick={()=>upd("file",null)} style={{background:"none",border:"none",cursor:"pointer",color:"#6B7E6F"}}>✕</button></div>}
        <button onClick={()=>fRef.current?.click()} style={{padding:"10px 18px",borderRadius:100,border:"1.5px dashed #D5CCBB",background:"transparent",color:"#2D6A4F",fontSize:12,fontWeight:700,cursor:"pointer"}}>{f.pdfUrl?"📄 Neue PDF":"📄 PDF hochladen"}</button>
      </div>

      <div style={{display:"flex",gap:10,marginTop:8}}>
        <button onClick={save} disabled={saving} style={{flex:1,padding:14,fontSize:15,fontWeight:700,background:"#2D6A4F",color:"#FFF",borderRadius:100,border:"none",cursor:saving?"wait":"pointer",opacity:saving?0.6:1}}>{saving?"Speichern...":editId?"💾 Speichern":"✅ Anlegen"}</button>
        {onCancel&&<button onClick={onCancel} style={{padding:14,fontSize:15,fontWeight:700,background:"#FFFDF8",color:"#6B7E6F",borderRadius:100,border:"1.5px solid #D5CCBB",cursor:"pointer"}}>Abbrechen</button>}
      </div>
    </div>
  </div>);
}

// ============ STATS COMPONENT ============
function StatsView({rests}){
  const[clicks,setClicks]=useState([]);
  const[loading,setLoading]=useState(true);
  const[range,setRange]=useState(30); // Tage

  useEffect(()=>{
    const loadClicks=async()=>{
      setLoading(true);
      const since=new Date();
      since.setDate(since.getDate()-range);
      const{data,error}=await supabase.from("clicks").select("*").gte("created_at",since.toISOString()).order("created_at",{ascending:false});
      if(!error)setClicks(data||[]);
      setLoading(false);
    };
    loadClicks();
  },[range]);

  if(loading)return(<div style={{textAlign:"center",padding:"60px",color:P.textM}}>📊 Statistiken werden geladen...</div>);

  // Gesamt-Klicks (ohne PLZ-Suchen, da die haben keine restaurant_id)
  const restClicks=clicks.filter(c=>c.restaurant_id);
  const plzSearches=clicks.filter(c=>c.click_type==="plz_search");

  // Klicks pro Restaurant
  const byRest={};
  restClicks.forEach(c=>{
    if(!byRest[c.restaurant_id])byRest[c.restaurant_id]={total:0,types:{}};
    byRest[c.restaurant_id].total++;
    byRest[c.restaurant_id].types[c.click_type]=(byRest[c.restaurant_id].types[c.click_type]||0)+1;
  });
  const topRests=Object.entries(byRest).map(([rid,data])=>{
    const r=rests.find(x=>x.id===rid);
    return{name:r?.name||"(gelöscht)",emoji:CE[r?.categories?.[0]]||"🍽️",total:data.total,types:data.types};
  }).sort((a,b)=>b.total-a.total).slice(0,10);

  // Klicks nach Typ
  const byType={};
  restClicks.forEach(c=>{byType[c.click_type]=(byType[c.click_type]||0)+1;});

  // Top PLZ
  const plzCount={};
  plzSearches.forEach(c=>{if(c.plz_searched){plzCount[c.plz_searched]=(plzCount[c.plz_searched]||0)+1;}});
  const topPlz=Object.entries(plzCount).sort((a,b)=>b[1]-a[1]).slice(0,10);

  // Klicks pro Tag (letzte X Tage)
  const byDay={};
  for(let i=0;i<range;i++){
    const d=new Date();
    d.setDate(d.getDate()-i);
    byDay[d.toISOString().slice(0,10)]=0;
  }
  clicks.forEach(c=>{
    const day=c.created_at.slice(0,10);
    if(byDay[day]!==undefined)byDay[day]++;
  });
  const daysSorted=Object.entries(byDay).sort((a,b)=>a[0].localeCompare(b[0]));
  const maxDay=Math.max(...daysSorted.map(d=>d[1]),1);

  const totalClicks=clicks.length;
  const totalRestClicks=restClicks.length;
  const totalPlzSearches=plzSearches.length;

  return(<div style={{display:"grid",gap:20}}>
    {/* Zeitraum-Filter */}
    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
      <span style={{fontSize:12,fontWeight:700,color:P.textM,marginRight:6}}>Zeitraum:</span>
      {[7,30,90,365].map(d=>(<button key={d} onClick={()=>setRange(d)} style={{padding:"6px 14px",borderRadius:100,fontSize:12,fontWeight:700,background:range===d?P.accent:P.card,color:range===d?"#FFF":P.textM,border:range===d?"none":`1.5px solid ${P.border}`,cursor:"pointer"}}>{d===365?"1 Jahr":d+" Tage"}</button>))}
    </div>

    {/* Übersichts-Karten */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:12}}>
      <div style={{background:P.card,borderRadius:14,padding:"20px",border:`1.5px solid ${P.border}`,textAlign:"center"}}>
        <div style={{fontSize:36,fontWeight:900,color:P.accent,lineHeight:1}}>{totalClicks}</div>
        <div style={{fontSize:11,color:P.textM,fontWeight:700,textTransform:"uppercase",marginTop:6,letterSpacing:"1px"}}>Klicks gesamt</div>
      </div>
      <div style={{background:P.card,borderRadius:14,padding:"20px",border:`1.5px solid ${P.border}`,textAlign:"center"}}>
        <div style={{fontSize:36,fontWeight:900,color:P.accent,lineHeight:1}}>{totalRestClicks}</div>
        <div style={{fontSize:11,color:P.textM,fontWeight:700,textTransform:"uppercase",marginTop:6,letterSpacing:"1px"}}>Restaurant-Klicks</div>
      </div>
      <div style={{background:P.card,borderRadius:14,padding:"20px",border:`1.5px solid ${P.border}`,textAlign:"center"}}>
        <div style={{fontSize:36,fontWeight:900,color:"#BC6C25",lineHeight:1}}>{totalPlzSearches}</div>
        <div style={{fontSize:11,color:P.textM,fontWeight:700,textTransform:"uppercase",marginTop:6,letterSpacing:"1px"}}>PLZ-Suchen</div>
      </div>
      <div style={{background:P.card,borderRadius:14,padding:"20px",border:`1.5px solid ${P.border}`,textAlign:"center"}}>
        <div style={{fontSize:36,fontWeight:900,color:P.mint,lineHeight:1}}>{Object.keys(byRest).length}</div>
        <div style={{fontSize:11,color:P.textM,fontWeight:700,textTransform:"uppercase",marginTop:6,letterSpacing:"1px"}}>Aktive Restaurants</div>
      </div>
    </div>

    {/* Tagesverlauf (Mini-Chart) */}
    <div style={{background:P.card,borderRadius:14,padding:"20px",border:`1.5px solid ${P.border}`}}>
      <div style={{fontSize:14,fontWeight:800,marginBottom:14}}>📈 Klicks pro Tag (letzte {range} Tage)</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:2,height:120,overflowX:"auto"}}>
        {daysSorted.map(([day,count])=>{const h=(count/maxDay)*100;const dateLabel=new Date(day).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"});return(<div key={day} title={`${dateLabel}: ${count} Klicks`} style={{flex:"1",minWidth:8,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <div style={{width:"100%",height:`${h}%`,background:count>0?P.accent:"#E5E5E5",borderRadius:"3px 3px 0 0",minHeight:2,transition:"all 0.3s"}}/>
        </div>);})}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:P.textM,marginTop:6}}>
        <span>{new Date(daysSorted[0]?.[0]||Date.now()).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})}</span>
        <span>Max: {maxDay} Klicks/Tag</span>
        <span>Heute</span>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))",gap:16}}>
      {/* Top Restaurants */}
      <div style={{background:P.card,borderRadius:14,padding:"20px",border:`1.5px solid ${P.border}`}}>
        <div style={{fontSize:14,fontWeight:800,marginBottom:14}}>🏆 Top 10 Restaurants</div>
        {topRests.length===0?(<div style={{fontSize:13,color:P.textM,textAlign:"center",padding:"20px"}}>Noch keine Klicks im Zeitraum.</div>):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {topRests.map((r,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px",background:P.bg,borderRadius:10}}>
              <div style={{fontSize:13,fontWeight:800,color:P.textM,width:22,textAlign:"center"}}>{i+1}</div>
              <div style={{fontSize:20}}>{r.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</div>
                <div style={{fontSize:10,color:P.textM,display:"flex",gap:6,flexWrap:"wrap"}}>
                  {Object.entries(r.types).map(([t,c])=>(<span key={t}>{CLICK_LABELS[t]||t}: {c}</span>))}
                </div>
              </div>
              <div style={{fontSize:18,fontWeight:900,color:P.accent}}>{r.total}</div>
            </div>))}
          </div>
        )}
      </div>

      {/* Klick-Typen */}
      <div style={{background:P.card,borderRadius:14,padding:"20px",border:`1.5px solid ${P.border}`}}>
        <div style={{fontSize:14,fontWeight:800,marginBottom:14}}>📊 Klicks nach Typ</div>
        {Object.keys(byType).length===0?(<div style={{fontSize:13,color:P.textM,textAlign:"center",padding:"20px"}}>Noch keine Restaurant-Klicks.</div>):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {Object.entries(byType).sort((a,b)=>b[1]-a[1]).map(([type,count])=>{const pct=Math.round((count/totalRestClicks)*100);return(<div key={type}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span style={{fontWeight:700}}>{CLICK_LABELS[type]||type}</span>
                <span style={{color:P.textM,fontWeight:700}}>{count} ({pct}%)</span>
              </div>
              <div style={{height:8,background:P.bg,borderRadius:4,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:P.accent,transition:"width 0.3s"}}/>
              </div>
            </div>);})}
          </div>
        )}
      </div>

      {/* Top PLZ */}
      <div style={{background:P.card,borderRadius:14,padding:"20px",border:`1.5px solid ${P.border}`}}>
        <div style={{fontSize:14,fontWeight:800,marginBottom:14}}>📍 Top 10 gesuchte PLZ</div>
        {topPlz.length===0?(<div style={{fontSize:13,color:P.textM,textAlign:"center",padding:"20px"}}>Noch keine PLZ-Suchen.</div>):(
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {topPlz.map(([plz,count],i)=>(<div key={plz} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:P.bg,borderRadius:8}}>
              <div style={{fontSize:13,fontWeight:800,color:P.textM,width:22,textAlign:"center"}}>{i+1}</div>
              <div style={{flex:1,fontSize:14,fontWeight:700}}>📍 {plz}</div>
              <div style={{fontSize:14,fontWeight:900,color:"#BC6C25"}}>{count}× gesucht</div>
            </div>))}
          </div>
        )}
        <div style={{fontSize:11,color:P.textM,marginTop:10,padding:"8px",background:"#FFF5EB",borderRadius:8,lineHeight:1.5}}>💡 <b>Tipp:</b> PLZ mit vielen Suchen aber wenig Restaurants = Akquise-Chance!</div>
      </div>
    </div>
  </div>);
}

// ============ ADMIN PAGE ============
export default function AdminPage(){
  const[user,setUser]=useState(null);
  const[authLoading,setAuthLoading]=useState(true);
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[authErr,setAuthErr]=useState("");
  const[rests,setRests]=useState([]);
  const[zones,setZones]=useState([]);
  const[digiReqs,setDigiReqs]=useState([]);
  const[tab,setTab]=useState("list");
  const[editId,setEditId]=useState(null);
  const[editInit,setEditInit]=useState(null);
  const[msg,setMsg]=useState("");

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setUser(session?.user||null);setAuthLoading(false);});
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>{setUser(s?.user||null);});
    return()=>subscription.unsubscribe();
  },[]);
  useEffect(()=>{if(user)loadAll();},[user]);

  const loadAll=async()=>{
    const{data:r}=await supabase.from("restaurants").select("*").order("created_at",{ascending:false});
    const{data:z}=await supabase.from("delivery_zones").select("*");
    const{data:d}=await supabase.from("digi_requests").select("*").order("created_at",{ascending:false});
    setRests(r||[]);setZones(z||[]);setDigiReqs(d||[]);
  };
  const doLogin=async()=>{setAuthErr("");const{data,error}=await supabase.auth.signInWithPassword({email,password:pass});if(error){setAuthErr("Falsche Zugangsdaten.");return;}setUser(data.user);};
  const doLogout=async()=>{await supabase.auth.signOut();setUser(null);};
  const deleteRest=async(id)=>{if(!confirm("Wirklich löschen?"))return;await supabase.from("delivery_zones").delete().eq("restaurant_id",id);await supabase.from("restaurants").delete().eq("id",id);await loadAll();setMsg("🗑️ Gelöscht.");};

  const approveRest=async(id,name)=>{
    if(!confirm(`"${name}" freigeben? Wird sofort auf DeliCarto sichtbar.`))return;
    const{error}=await supabase.from("restaurants").update({approval_status:"approved",approved_at:new Date().toISOString()}).eq("id",id);
    if(error){setMsg("❌ Fehler: "+error.message);return;}
    await loadAll();setMsg(`✅ "${name}" freigegeben und live!`);
  };
  const rejectRest=async(id,name)=>{
    if(!confirm(`"${name}" ablehnen? Erscheint dann nicht auf DeliCarto.`))return;
    const{error}=await supabase.from("restaurants").update({approval_status:"rejected"}).eq("id",id);
    if(error){setMsg("❌ Fehler: "+error.message);return;}
    await loadAll();setMsg(`"${name}" abgelehnt.`);
  };
  const resetApproval=async(id,name)=>{
    if(!confirm(`"${name}" auf "Wartet" zurücksetzen?`))return;
    await supabase.from("restaurants").update({approval_status:"pending",approved_at:null}).eq("id",id);
    await loadAll();setMsg(`"${name}" wartet wieder auf Freigabe.`);
  };

  const startEdit=(r)=>{
    const rz=(zones||[]).filter(z=>z.restaurant_id===r.id).map(z=>({name:z.zone_name,plz:z.plz,cost:z.delivery_cost,minOrder:z.min_order||""}));
    setEditInit({name:r.name,cats:r.categories||[],street:r.street||"",nr:r.house_nr||"",plz:r.plz||"",city:r.city||"",phone:r.phone||"",whatsapp:r.whatsapp||"",website:r.website||"",dailySpecial:r.daily_special||"",min:r.min_order||"",sched:r.schedule||mkDS(),delivSched:r.delivery_schedule||mkDS(),useDelivSched:!!r.delivery_schedule,zones:rz.length>0?rz:[{name:"",plz:"",cost:"0€",minOrder:""}],file:null,pdfUrl:r.pdf_url||"",pdfName:r.pdf_name||"",isPremium:r.is_premium||false,imageFile:null,imageUrl:r.image_url||""});
    setEditId(r.id);setTab("edit");setMsg("");
  };
  const handleSaved=(m)=>{loadAll();setMsg(m);setTab("list");setEditId(null);setEditInit(null);};

  if(authLoading)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:P.bg,fontFamily:"system-ui"}}><p>Laden...</p></div>);
  if(!user)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:P.bg,fontFamily:"system-ui"}}>
      <div style={{background:P.card,borderRadius:24,padding:"40px 32px",maxWidth:380,width:"100%",border:`1.5px solid ${P.border}`}}>
        <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:28,fontWeight:900}}>🔒 Admin</div><p style={{color:P.textM,fontSize:13,marginTop:4}}>DeliCarto Verwaltung</p></div>
        <div style={{display:"grid",gap:12}}>
          <div><label style={lb}>E-Mail</label><input style={is} placeholder="info@delicarto.de" value={email} onChange={e=>setEmail(e.target.value)}/></div>
          <div><label style={lb}>Passwort</label><input type="password" style={is} placeholder="••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")doLogin();}}/></div>
          {authErr&&<div style={{background:"#FFF0F3",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,color:"#C4314B"}}>{authErr}</div>}
          <button onClick={doLogin} style={{width:"100%",padding:14,fontSize:15,fontWeight:700,background:P.accent,color:"#FFF",borderRadius:100,border:"none",cursor:"pointer"}}>Einloggen</button>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{fontFamily:"system-ui",background:P.bg,color:P.text,minHeight:"100vh"}}>
      <div style={{background:P.card,borderBottom:`1px solid ${P.border}`,padding:"14px 24px"}}>
        <div style={{maxWidth:1000,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:22}}>🔧</span><div><div style={{fontSize:18,fontWeight:900}}>DeliCarto Admin</div><div style={{fontSize:11,color:P.textM}}>{user.email}</div></div></div>
          <div style={{display:"flex",gap:8}}><a href="/" style={{padding:"8px 16px",borderRadius:100,fontSize:12,fontWeight:700,background:P.bg,border:`1.5px solid ${P.border}`,color:P.textM,textDecoration:"none"}}>← Seite</a><button onClick={doLogout} style={{padding:"8px 16px",borderRadius:100,fontSize:12,fontWeight:700,background:"#FFF0F3",border:"1px solid #FFD6E0",color:"#C4314B",cursor:"pointer"}}>Abmelden</button></div>
        </div>
      </div>
      <div style={{maxWidth:1000,margin:"0 auto",padding:"24px"}}>
        {msg&&<div style={{padding:"12px 16px",borderRadius:12,marginBottom:16,background:msg.startsWith("❌")?"#FFF0F3":"#E8F5E9",fontSize:13,fontWeight:700,color:msg.startsWith("❌")?"#C4314B":"#1B5E3B"}}>{msg}</div>}
        <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
          <button onClick={()=>{setTab("stats");setMsg("");}} style={{padding:"10px 20px",borderRadius:100,fontSize:13,fontWeight:700,background:tab==="stats"?"#1D6FA5":P.card,color:tab==="stats"?"#FFF":P.textM,border:tab==="stats"?"none":`1.5px solid ${P.border}`,cursor:"pointer"}}>📊 Statistiken</button>
          <button onClick={()=>{setTab("pending");setEditId(null);setEditInit(null);setMsg("");}} style={{padding:"10px 20px",borderRadius:100,fontSize:13,fontWeight:700,background:tab==="pending"?"#BC6C25":P.card,color:tab==="pending"?"#FFF":P.textM,border:tab==="pending"?"none":`1.5px solid ${P.border}`,cursor:"pointer",position:"relative"}}>⏳ Wartet auf Freigabe ({rests.filter(r=>r.approval_status==="pending"||!r.approval_status).length}){rests.filter(r=>r.approval_status==="pending"||!r.approval_status).length>0&&<span style={{position:"absolute",top:-4,right:-4,width:10,height:10,background:"#C4314B",borderRadius:"50%"}}/>}</button>
          <button onClick={()=>{setTab("list");setEditId(null);setEditInit(null);setMsg("");}} style={{padding:"10px 20px",borderRadius:100,fontSize:13,fontWeight:700,background:tab==="list"?P.accent:P.card,color:tab==="list"?"#FFF":P.textM,border:tab==="list"?"none":`1.5px solid ${P.border}`,cursor:"pointer"}}>📋 Alle ({rests.length})</button>
          <button onClick={()=>{setTab("add");setEditId(null);setEditInit(null);setMsg("");}} style={{padding:"10px 20px",borderRadius:100,fontSize:13,fontWeight:700,background:tab==="add"?P.accent:P.card,color:tab==="add"?"#FFF":P.textM,border:tab==="add"?"none":`1.5px solid ${P.border}`,cursor:"pointer"}}>+ Neu</button>
          <button onClick={()=>{setTab("digi");setMsg("");}} style={{padding:"10px 20px",borderRadius:100,fontSize:13,fontWeight:700,background:tab==="digi"?"#BC6C25":P.card,color:tab==="digi"?"#FFF":P.textM,border:tab==="digi"?"none":`1.5px solid ${P.border}`,cursor:"pointer"}}>📸 Digi-Anfragen ({digiReqs.length})</button>
        </div>

        {tab==="stats"&&<StatsView rests={rests}/>}

        {tab==="pending"&&(()=>{const pending=rests.filter(r=>r.approval_status==="pending"||!r.approval_status);return pending.length===0?(<div style={{textAlign:"center",padding:"60px",color:P.textM}}><div style={{fontSize:48}}>✨</div><p style={{fontWeight:700,marginTop:12}}>Keine Anmeldungen warten auf Freigabe.</p><p style={{fontSize:13,marginTop:6}}>Neue Lieferdienste, die sich registrieren, erscheinen hier.</p></div>):(<div style={{display:"grid",gap:10}}>{pending.map(r=>{const rz=(zones||[]).filter(z=>z.restaurant_id===r.id);const sb=statusBadge(r.approval_status);return(<div key={r.id} style={{background:P.card,borderRadius:16,padding:"18px 20px",border:`2px solid ${P.warm}40`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:14,flex:1,minWidth:200}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${r.color||"#2D6A4F"}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{CE[r.categories?.[0]]||"🍽️"}</div>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><span style={{fontSize:15,fontWeight:800}}>{r.name||"(noch kein Name)"}</span><span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:100,background:sb.bg,color:sb.color}}>{sb.label}</span></div>
              <div style={{fontSize:11,color:P.textM,marginTop:2}}>📞 {r.phone||"-"} · {r.city||"keine Stadt"} {r.submitted_at&&`· angemeldet ${new Date(r.submitted_at).toLocaleDateString("de-DE")}`}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <button onClick={()=>approveRest(r.id,r.name)} style={{padding:"8px 14px",borderRadius:100,fontSize:12,fontWeight:700,background:P.accent,color:"#FFF",border:"none",cursor:"pointer"}}>✅ Freigeben</button>
            <button onClick={()=>rejectRest(r.id,r.name)} style={{padding:"8px 14px",borderRadius:100,fontSize:12,fontWeight:700,background:"#FFF0F3",border:"1px solid #FFD6E0",color:"#C4314B",cursor:"pointer"}}>❌ Ablehnen</button>
            <button onClick={()=>startEdit(r)} style={{padding:"8px 14px",borderRadius:100,fontSize:12,fontWeight:700,background:P.bg,border:`1.5px solid ${P.border}`,cursor:"pointer"}}>✏️ Bearbeiten</button>
            <button onClick={()=>deleteRest(r.id)} style={{padding:"8px 14px",borderRadius:100,fontSize:12,fontWeight:700,background:"#FFF0F3",border:"1px solid #FFD6E0",color:"#C4314B",cursor:"pointer"}}>🗑️</button>
          </div>
        </div>);})}</div>);})()}
        {tab==="list"&&(rests.length===0?(<div style={{textAlign:"center",padding:"60px",color:P.textM}}><div style={{fontSize:48}}>📋</div><p style={{fontWeight:700,marginTop:12}}>Noch keine Lieferdienste.</p></div>):(<div style={{display:"grid",gap:10}}>{rests.map(r=>{const rz=(zones||[]).filter(z=>z.restaurant_id===r.id);const sb=statusBadge(r.approval_status);return(<div key={r.id} style={{background:P.card,borderRadius:16,padding:"18px 20px",border:`1.5px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:14,flex:1,minWidth:200}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${r.color||"#2D6A4F"}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{CE[r.categories?.[0]]||"🍽️"}</div>
            <div><div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><span style={{fontSize:15,fontWeight:800}}>{r.name}</span>{r.is_premium&&<span style={{fontSize:9,fontWeight:800,background:"#2D6A4F",color:"#FFF",padding:"2px 8px",borderRadius:100}}>PRO</span>}<span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:100,background:sb.bg,color:sb.color}}>{sb.label}</span></div><div style={{fontSize:11,color:P.textM}}>{r.street} {r.house_nr}, {r.plz} {r.city} · {rz.length} Gebiet{rz.length!==1?"e":""} · 👁️ {r.views||0} Aufrufe</div></div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{(r.approval_status==="pending"||!r.approval_status)&&<button onClick={()=>approveRest(r.id,r.name)} style={{padding:"8px 14px",borderRadius:100,fontSize:12,fontWeight:700,background:P.accent,color:"#FFF",border:"none",cursor:"pointer"}}>✅</button>}{r.approval_status==="approved"&&<button onClick={()=>resetApproval(r.id,r.name)} title="Auf Wartend zurücksetzen" style={{padding:"8px 14px",borderRadius:100,fontSize:12,fontWeight:700,background:P.bg,border:`1.5px solid ${P.border}`,cursor:"pointer"}}>⏳</button>}<button onClick={()=>startEdit(r)} style={{padding:"8px 14px",borderRadius:100,fontSize:12,fontWeight:700,background:P.bg,border:`1.5px solid ${P.border}`,cursor:"pointer"}}>✏️</button><button onClick={()=>deleteRest(r.id)} style={{padding:"8px 14px",borderRadius:100,fontSize:12,fontWeight:700,background:"#FFF0F3",border:"1px solid #FFD6E0",color:"#C4314B",cursor:"pointer"}}>🗑️</button></div>
        </div>);})}</div>))}
        {tab==="add"&&<RestForm key="new" user={user} onSaved={handleSaved} onCancel={()=>{setTab("list");setMsg("");}}/>}
        {tab==="edit"&&editInit&&<RestForm key={editId} initial={editInit} editId={editId} user={user} onSaved={handleSaved} onCancel={()=>{setTab("list");setEditId(null);setEditInit(null);setMsg("");}}/>}

        {tab==="digi"&&(<div>
          {digiReqs.length===0?(<div style={{textAlign:"center",padding:"60px",color:P.textM}}><div style={{fontSize:48}}>📸</div><p style={{fontWeight:700,marginTop:12}}>Keine Digitalisierungs-Anfragen.</p></div>):(
            <div style={{display:"grid",gap:10}}>
              {digiReqs.map(d=>(<div key={d.id} style={{background:P.card,borderRadius:16,padding:"18px 20px",border:`1.5px solid ${P.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",flexWrap:"wrap",gap:12}}>
                  <div>
                    <div style={{fontSize:16,fontWeight:800,marginBottom:4}}>{d.restaurant_name}</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:6}}>
                      <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:100,background:"#FFF5EB",color:"#BC6C25",border:"1px solid #FFDDB5"}}>{d.package==="standard"?"Standard 29€":d.package==="profi"?"Profi 49€":"Premium 79€"}</span>
                      <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:100,background:d.status==="neu"?"#E8F5E9":"#E8F0E8",color:d.status==="neu"?"#1B5E3B":"#6B7E6F"}}>{d.status==="neu"?"🆕 Neu":d.status==="bearbeitung"?"⏳ In Bearbeitung":"✅ Erledigt"}</span>
                    </div>
                    <div style={{fontSize:12,color:P.textM}}>📞 {d.phone}{d.email?` · ✉️ ${d.email}`:""}</div>
                    {d.notes&&<div style={{fontSize:12,color:P.textM,marginTop:4}}>💬 {d.notes}</div>}
                    <div style={{fontSize:10,color:P.textM,marginTop:6}}>{new Date(d.created_at).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <select value={d.status||"neu"} onChange={async(e)=>{await supabase.from("digi_requests").update({status:e.target.value}).eq("id",d.id);loadAll();}} style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${P.border}`,fontSize:12,fontWeight:700,background:"#FFF",cursor:"pointer"}}>
                      <option value="neu">🆕 Neu</option>
                      <option value="bearbeitung">⏳ In Bearbeitung</option>
                      <option value="erledigt">✅ Erledigt</option>
                    </select>
                    <button onClick={async()=>{if(confirm("Anfrage löschen?")){await supabase.from("digi_requests").delete().eq("id",d.id);loadAll();}}} style={{padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:700,background:"#FFF0F3",border:"1px solid #FFD6E0",color:"#C4314B",cursor:"pointer"}}>🗑️</button>
                  </div>
                </div>
              </div>))}
            </div>
          )}
        </div>)}
      </div>
    </div>
  );
}
