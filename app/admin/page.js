"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

const P={accent:"#2D6A4F",mint:"#40916C",warm:"#D4A373",text:"#1B2A1D",textM:"#6B7E6F",border:"#D5CCBB",bg:"#F5F0E8",card:"#FFFDF8"};
const DAYS=["Mo","Di","Mi","Do","Fr","Sa","So"];
const TIMES=[];for(let h=0;h<24;h++){TIMES.push(`${String(h).padStart(2,"0")}:00`);TIMES.push(`${String(h).padStart(2,"0")}:30`);}
const DS=DAYS.map(()=>({closed:false,slots:[{open:"11:00",close:"22:00"}]}));
const CATS=["Italienisch","Vietnamesisch","Türkisch","Japanisch","Indisch","Griechisch","Chinesisch","Mexikanisch","Deutsch","Vegan","Vegetarisch","Halal","Burger","Sonstiges"];
const CE={"Italienisch":"🍕","Vietnamesisch":"🍜","Türkisch":"🥙","Japanisch":"🍣","Indisch":"🍛","Griechisch":"🥗","Chinesisch":"🥡","Mexikanisch":"🌮","Deutsch":"🥨","Vegan":"🌱","Vegetarisch":"🥬","Halal":"☪️","Burger":"🍔","Sonstiges":"🍽️"};
const CC=["#2D6A4F","#40916C","#52796F","#588157","#D4A373","#BC6C25","#DDA15E","#E9C46A"];
const ADMIN_EMAIL="info@delicarto.de";

export default function AdminPage(){
  const[user,setUser]=useState(null);
  const[authLoading,setAuthLoading]=useState(true);
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[authErr,setAuthErr]=useState("");
  const[rests,setRests]=useState([]);
  const[zones,setZones]=useState([]);
  const[tab,setTab]=useState("list"); // list|add|edit
  const[editId,setEditId]=useState(null);
  const[saving,setSaving]=useState(false);
  const[msg,setMsg]=useState("");
  const fRef=useRef(null);

  // Form state
  const empty={name:"",cats:[],street:"",nr:"",plz:"",city:"",phone:"",min:"",sched:DS.map(d=>({...d,slots:d.slots.map(s=>({...s}))})),zones:[{name:"",plz:"",cost:"0€",minOrder:""}],file:null,pdfUrl:"",pdfName:"",isPremium:false};
  const[f,setF]=useState({...empty});

  // Auth check
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null);setAuthLoading(false);
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user||null);
    });
    return()=>subscription.unsubscribe();
  },[]);

  // Load data
  useEffect(()=>{if(user)loadAll();},[user]);

  const loadAll=async()=>{
    const{data:r}=await supabase.from("restaurants").select("*").order("created_at",{ascending:false});
    const{data:z}=await supabase.from("delivery_zones").select("*");
    setRests(r||[]);setZones(z||[]);
  };

  const doLogin=async()=>{
    setAuthErr("");
    const{data,error}=await supabase.auth.signInWithPassword({email,password:pass});
    if(error){setAuthErr("Falsche Zugangsdaten.");return;}
    setUser(data.user);
  };

  const doLogout=async()=>{await supabase.auth.signOut();setUser(null);};

  // Save restaurant
  const saveRest=async()=>{
    if(!f.name||f.cats.length===0){setMsg("Name und mindestens eine Kategorie erforderlich.");return;}
    setSaving(true);setMsg("");
    try{
      let pdfUrl=f.pdfUrl;
      let pdfName=f.pdfName;

      // Upload new PDF if selected
      if(f.file){
        const fileName=`${Date.now()}-${f.file.name}`;
        const{error:fErr}=await supabase.storage.from("menus").upload(fileName,f.file);
        if(fErr)throw fErr;
        const{data:{publicUrl}}=supabase.storage.from("menus").getPublicUrl(fileName);
        pdfUrl=publicUrl;pdfName=f.file.name;
      }

      const restData={
        name:f.name,categories:f.cats,street:f.street,house_nr:f.nr,
        plz:f.plz,city:f.city,phone:f.phone||null,
        schedule:f.sched,min_order:f.min||null,
        pdf_url:pdfUrl||null,pdf_name:pdfName||null,
        color:CC[Math.floor(Math.random()*CC.length)],
        is_premium:f.isPremium,owner_id:user.id
      };

      let restId=editId;

      if(editId){
        // Update
        const{error}=await supabase.from("restaurants").update(restData).eq("id",editId);
        if(error)throw error;
        // Delete old zones and re-insert
        await supabase.from("delivery_zones").delete().eq("restaurant_id",editId);
      }else{
        // Insert
        const{data,error}=await supabase.from("restaurants").insert(restData).select().single();
        if(error)throw error;
        restId=data.id;
      }

      // Insert zones
      const validZones=f.zones.filter(z=>z.name&&z.plz);
      if(validZones.length>0){
        await supabase.from("delivery_zones").insert(validZones.map(z=>({
          restaurant_id:restId,zone_name:z.name,plz:z.plz,
          delivery_cost:z.cost||"0€",min_order:z.minOrder||null
        })));
      }

      await loadAll();
      setMsg(editId?"✅ Gespeichert!":"✅ Lieferdienst angelegt!");
      setTab("list");setEditId(null);setF({...empty});
    }catch(err){
      setMsg("❌ Fehler: "+err.message);
    }
    setSaving(false);
  };

  // Delete restaurant
  const deleteRest=async(id)=>{
    if(!confirm("Wirklich löschen?"))return;
    await supabase.from("delivery_zones").delete().eq("restaurant_id",id);
    await supabase.from("restaurants").delete().eq("id",id);
    await loadAll();setMsg("🗑️ Gelöscht.");
  };

  // Edit restaurant
  const startEdit=(r)=>{
    const rZones=(zones||[]).filter(z=>z.restaurant_id===r.id).map(z=>({name:z.zone_name,plz:z.plz,cost:z.delivery_cost,minOrder:z.min_order||""}));
    setF({
      name:r.name,cats:r.categories||[],street:r.street||"",nr:r.house_nr||"",
      plz:r.plz||"",city:r.city||"",phone:r.phone||"",min:r.min_order||"",
      sched:r.schedule||DS,zones:rZones.length>0?rZones:[{name:"",plz:"",cost:"0€",minOrder:""}],
      file:null,pdfUrl:r.pdf_url||"",pdfName:r.pdf_name||"",isPremium:r.is_premium||false
    });
    setEditId(r.id);setTab("edit");setMsg("");
  };

  // Input component
  const Inp=({label,ph,val,onChange,w})=>(<div style={{width:w||"100%"}}><label style={{fontSize:11,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:6}}>{label}</label><input type="text" placeholder={ph} value={val} onChange={onChange} style={{width:"100%",padding:"12px 14px",fontSize:14,fontWeight:500,border:`1.5px solid ${P.border}`,borderRadius:10,background:"#FFF",color:P.text}}/></div>);

  // LOGIN
  if(authLoading)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:P.bg,fontFamily:"system-ui"}}><p style={{color:P.textM}}>Laden...</p></div>);

  if(!user)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:P.bg,fontFamily:"system-ui"}}>
      <div style={{background:P.card,borderRadius:24,padding:"40px 32px",maxWidth:380,width:"100%",border:`1.5px solid ${P.border}`,boxShadow:"0 12px 40px rgba(27,42,29,0.08)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:28,fontWeight:900,color:P.text}}>🔒 Admin</div>
          <p style={{color:P.textM,fontSize:13,marginTop:4}}>DeliCarto Verwaltung</p>
        </div>
        <div style={{display:"grid",gap:12}}>
          <Inp label="E-Mail" ph="info@delicarto.de" val={email} onChange={e=>setEmail(e.target.value)}/>
          <div><label style={{fontSize:11,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:6}}>Passwort</label><input type="password" placeholder="••••••" value={pass} onChange={e=>setPass(e.target.value)} style={{width:"100%",padding:"12px 14px",fontSize:14,border:`1.5px solid ${P.border}`,borderRadius:10,background:"#FFF",color:P.text}} onKeyDown={e=>{if(e.key==="Enter")doLogin();}}/></div>
          {authErr&&<div style={{background:"#FFF0F3",border:"1px solid #FFD6E0",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,color:"#C4314B"}}>{authErr}</div>}
          <button onClick={doLogin} style={{width:"100%",padding:14,fontSize:15,fontWeight:700,background:P.accent,color:"#FFF",borderRadius:100,border:"none",cursor:"pointer"}}>Einloggen</button>
        </div>
      </div>
    </div>
  );

  // DASHBOARD
  return(
    <div style={{fontFamily:"system-ui,-apple-system,sans-serif",background:P.bg,color:P.text,minHeight:"100vh"}}>
      {/* Header */}
      <div style={{background:P.card,borderBottom:`1px solid ${P.border}`,padding:"14px 24px"}}>
        <div style={{maxWidth:1000,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:22,fontWeight:900}}>🔧</span>
            <div><div style={{fontSize:18,fontWeight:900}}>DeliCarto Admin</div><div style={{fontSize:11,color:P.textM}}>{user.email}</div></div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <a href="/" style={{padding:"8px 16px",borderRadius:100,fontSize:12,fontWeight:700,background:P.bg,border:`1.5px solid ${P.border}`,color:P.textM,textDecoration:"none"}}>← Zur Seite</a>
            <button onClick={doLogout} style={{padding:"8px 16px",borderRadius:100,fontSize:12,fontWeight:700,background:"#FFF0F3",border:"1px solid #FFD6E0",color:"#C4314B",cursor:"pointer"}}>Abmelden</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"24px"}}>
        {/* Message */}
        {msg&&<div style={{padding:"12px 16px",borderRadius:12,marginBottom:16,background:msg.startsWith("❌")?"#FFF0F3":"#E8F5E9",border:`1px solid ${msg.startsWith("❌")?"#FFD6E0":"#A7D7A0"}`,fontSize:13,fontWeight:700,color:msg.startsWith("❌")?"#C4314B":"#1B5E3B"}}>{msg}</div>}

        {/* Tabs */}
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          <button onClick={()=>{setTab("list");setEditId(null);setF({...empty});setMsg("");}} style={{padding:"10px 20px",borderRadius:100,fontSize:13,fontWeight:700,background:tab==="list"?P.accent:P.card,color:tab==="list"?"#FFF":P.textM,border:tab==="list"?"none":`1.5px solid ${P.border}`,cursor:"pointer"}}>📋 Alle Lieferdienste ({rests.length})</button>
          <button onClick={()=>{setTab("add");setEditId(null);setF({...empty});setMsg("");}} style={{padding:"10px 20px",borderRadius:100,fontSize:13,fontWeight:700,background:tab==="add"?P.accent:P.card,color:tab==="add"?"#FFF":P.textM,border:tab==="add"?"none":`1.5px solid ${P.border}`,cursor:"pointer"}}>+ Neuer Lieferdienst</button>
        </div>

        {/* LIST */}
        {tab==="list"&&(<div>
          {rests.length===0?(<div style={{textAlign:"center",padding:"60px 20px",color:P.textM}}><div style={{fontSize:48,marginBottom:12}}>📋</div><p style={{fontSize:16,fontWeight:700}}>Noch keine Lieferdienste.</p><p style={{fontSize:13,marginTop:4}}>Klicke "Neuer Lieferdienst" um loszulegen.</p></div>):(
            <div style={{display:"grid",gap:10}}>
              {rests.map(r=>{
                const rZones=(zones||[]).filter(z=>z.restaurant_id===r.id);
                return(<div key={r.id} style={{background:P.card,borderRadius:16,padding:"18px 20px",border:`1.5px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,flex:1,minWidth:200}}>
                    <div style={{width:44,height:44,borderRadius:12,background:`${r.color||P.accent}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{CE[r.categories?.[0]]||"🍽️"}</div>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:15,fontWeight:800}}>{r.name}</span>{r.is_premium&&<span style={{fontSize:9,fontWeight:800,background:P.accent,color:"#FFF",padding:"2px 8px",borderRadius:100}}>PRO</span>}</div>
                      <div style={{fontSize:11,color:P.textM}}>{r.street} {r.house_nr}, {r.plz} {r.city} · {rZones.length} Liefergebiet{rZones.length!==1?"e":""}</div>
                      <div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>{(r.categories||[]).map(c=>(<span key={c} style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:100,background:P.bg,border:`1px solid ${P.border}`,color:P.textM}}>{CE[c]} {c}</span>))}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>startEdit(r)} style={{padding:"8px 14px",borderRadius:100,fontSize:12,fontWeight:700,background:P.bg,border:`1.5px solid ${P.border}`,color:P.text,cursor:"pointer"}}>✏️ Bearbeiten</button>
                    <button onClick={()=>deleteRest(r.id)} style={{padding:"8px 14px",borderRadius:100,fontSize:12,fontWeight:700,background:"#FFF0F3",border:"1px solid #FFD6E0",color:"#C4314B",cursor:"pointer"}}>🗑️</button>
                  </div>
                </div>);
              })}
            </div>
          )}
        </div>)}

        {/* ADD / EDIT FORM */}
        {(tab==="add"||tab==="edit")&&(<div style={{background:P.card,borderRadius:20,padding:"28px 24px",border:`1.5px solid ${P.border}`}}>
          <h2 style={{fontSize:20,fontWeight:900,marginBottom:20}}>{editId?"✏️ Lieferdienst bearbeiten":"+ Neuer Lieferdienst"}</h2>

          <div style={{display:"grid",gap:16}}>
            {/* Basic info */}
            <Inp label="Name *" ph="z.B. Kebab König" val={f.name} onChange={e=>setF({...f,name:e.target.value})}/>

            <div><label style={{fontSize:11,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:8}}>Küche / Tags *</label><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{CATS.map(c=>{const sel=f.cats.includes(c);return(<button key={c} type="button" onClick={()=>setF({...f,cats:sel?f.cats.filter(x=>x!==c):[...f.cats,c]})} style={{padding:"6px 12px",borderRadius:100,fontSize:11,fontWeight:700,border:sel?"none":`1.5px solid ${P.border}`,background:sel?P.accent:"#FFF",color:sel?"#FFF":P.textM,cursor:"pointer",display:"flex",alignItems:"center",gap:3}}><span>{CE[c]}</span>{c}</button>);})}</div></div>

            <div style={{display:"grid",gridTemplateColumns:"3fr 1fr",gap:10}}><Inp label="Straße" ph="Hauptstraße" val={f.street} onChange={e=>setF({...f,street:e.target.value})}/><Inp label="Nr." ph="12" val={f.nr} onChange={e=>setF({...f,nr:e.target.value})}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}><Inp label="PLZ" ph="49632" val={f.plz} onChange={e=>setF({...f,plz:e.target.value.replace(/\D/g,"").slice(0,5)})}/><Inp label="Ort" ph="Essen" val={f.city} onChange={e=>setF({...f,city:e.target.value})}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Telefon" ph="05434-1234567" val={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/><Inp label="Mindestbestellwert" ph="10€" val={f.min} onChange={e=>setF({...f,min:e.target.value})}/></div>

            {/* Premium toggle */}
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button onClick={()=>setF({...f,isPremium:!f.isPremium})} style={{width:48,height:26,borderRadius:13,background:f.isPremium?P.accent:"#DDD",border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
                <div style={{width:22,height:22,borderRadius:11,background:"#FFF",position:"absolute",top:2,left:f.isPremium?24:2,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
              </button>
              <span style={{fontSize:13,fontWeight:700,color:f.isPremium?P.accent:P.textM}}>⭐ Premium-Kunde</span>
            </div>

            {/* Delivery zones */}
            <div>
              <label style={{fontSize:11,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:8}}>Liefergebiete</label>
              {f.zones.map((z,i)=>(<div key={i} style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap",alignItems:"end"}}>
                <Inp label={i===0?"Ort":""}  ph="Essen" val={z.name} onChange={e=>{const nz=[...f.zones];nz[i]={...nz[i],name:e.target.value};setF({...f,zones:nz});}} w="140px"/>
                <Inp label={i===0?"PLZ":""}  ph="49632" val={z.plz} onChange={e=>{const nz=[...f.zones];nz[i]={...nz[i],plz:e.target.value.replace(/\D/g,"").slice(0,5)};setF({...f,zones:nz});}} w="90px"/>
                <Inp label={i===0?"Lieferkosten":""}  ph="2,50€" val={z.cost} onChange={e=>{const nz=[...f.zones];nz[i]={...nz[i],cost:e.target.value};setF({...f,zones:nz});}} w="100px"/>
                <Inp label={i===0?"Mindestbest.":""}  ph="10€" val={z.minOrder} onChange={e=>{const nz=[...f.zones];nz[i]={...nz[i],minOrder:e.target.value};setF({...f,zones:nz});}} w="100px"/>
                {f.zones.length>1&&<button onClick={()=>setF({...f,zones:f.zones.filter((_,j)=>j!==i)})} style={{width:32,height:32,borderRadius:8,border:"none",background:"#FFF0F3",color:"#C4314B",fontSize:14,cursor:"pointer",marginBottom:i===0?0:0}}>✕</button>}
              </div>))}
              <button onClick={()=>setF({...f,zones:[...f.zones,{name:"",plz:"",cost:"0€",minOrder:""}]})} style={{padding:"6px 14px",borderRadius:100,border:`1.5px dashed ${P.border}`,background:"transparent",color:P.accent,fontSize:12,fontWeight:700,cursor:"pointer",marginTop:4}}>+ Liefergebiet hinzufügen</button>
            </div>

            {/* Schedule */}
            <div>
              <label style={{fontSize:11,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:8}}>Öffnungszeiten</label>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {DAYS.map((_,i)=>(<div key={i} style={{padding:"8px 12px",borderRadius:10,background:f.sched[i]?.closed?"#FFF0F3":P.bg,border:`1px solid ${f.sched[i]?.closed?"#FFD6E0":P.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <div style={{width:28,fontWeight:800,fontSize:12}}>{DAYS[i]}</div>
                    <button onClick={()=>{const s=[...f.sched];s[i]={...s[i],closed:!s[i].closed,slots:s[i].closed?[{open:"11:00",close:"22:00"}]:s[i].slots};setF({...f,sched:s});}} style={{padding:"3px 10px",borderRadius:8,fontSize:10,fontWeight:700,cursor:"pointer",border:"none",background:f.sched[i]?.closed?"#FF8FA3":P.mint,color:f.sched[i]?.closed?"#FFF":"#1B5E3B"}}>{f.sched[i]?.closed?"Ruhetag":"Geöffnet"}</button>
                    {!f.sched[i]?.closed&&<button onClick={()=>{const s=[...f.sched];const src=s[i];for(let j=0;j<7;j++)s[j]={closed:src.closed,slots:src.slots.map(sl=>({...sl}))};setF({...f,sched:s});}} style={{marginLeft:"auto",padding:"3px 8px",borderRadius:6,fontSize:9,fontWeight:700,cursor:"pointer",border:`1px solid ${P.border}`,background:"#FFF",color:P.textM}}>📋 Auf alle</button>}
                  </div>
                  {!f.sched[i]?.closed&&<div style={{marginTop:6,display:"flex",flexDirection:"column",gap:4}}>
                    {(f.sched[i]?.slots||[]).map((sl,si)=>(<div key={si} style={{display:"flex",alignItems:"center",gap:6}}>
                      <select value={sl.open} onChange={e=>{const s=[...f.sched];s[i]={...s[i],slots:s[i].slots.map((x,k)=>k===si?{...x,open:e.target.value}:x)};setF({...f,sched:s});}} style={{padding:"3px 6px",borderRadius:6,border:`1px solid ${P.border}`,fontSize:12,background:"#FFF"}}>{TIMES.map(t=><option key={t} value={t}>{t}</option>)}</select>
                      <span style={{color:P.textM,fontSize:12}}>–</span>
                      <select value={sl.close} onChange={e=>{const s=[...f.sched];s[i]={...s[i],slots:s[i].slots.map((x,k)=>k===si?{...x,close:e.target.value}:x)};setF({...f,sched:s});}} style={{padding:"3px 6px",borderRadius:6,border:`1px solid ${P.border}`,fontSize:12,background:"#FFF"}}>{TIMES.map(t=><option key={t} value={t}>{t}</option>)}</select>
                      {f.sched[i].slots.length>1&&<button onClick={()=>{const s=[...f.sched];s[i]={...s[i],slots:s[i].slots.filter((_,k)=>k!==si)};setF({...f,sched:s});}} style={{width:22,height:22,borderRadius:6,border:"none",background:"#FFF0F3",color:"#FF8FA3",fontSize:11,cursor:"pointer"}}>✕</button>}
                    </div>))}
                    {(f.sched[i]?.slots||[]).length<3&&<button onClick={()=>{const s=[...f.sched];s[i]={...s[i],slots:[...s[i].slots,{open:"17:00",close:"22:00"}]};setF({...f,sched:s});}} style={{padding:"3px 10px",borderRadius:6,border:`1px dashed ${P.border}`,background:"transparent",color:P.accent,fontSize:10,fontWeight:700,cursor:"pointer",alignSelf:"flex-start"}}>+ Zeitspanne</button>}
                  </div>}
                </div>))}
              </div>
            </div>

            {/* PDF Upload */}
            <div>
              <label style={{fontSize:11,fontWeight:700,color:P.textM,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:8}}>Speisekarte (PDF)</label>
              <input type="file" accept=".pdf" ref={fRef} onChange={e=>{const file=e.target.files[0];if(file)setF({...f,file});}} style={{display:"none"}}/>
              {f.pdfUrl&&!f.file&&<div style={{background:"#E8F5E9",borderRadius:10,padding:"10px 14px",marginBottom:8,fontSize:13,fontWeight:600,color:"#1B5E3B",display:"flex",justifyContent:"space-between",alignItems:"center"}}>📄 {f.pdfName} <span style={{fontSize:11,color:P.textM}}>bereits hochgeladen</span></div>}
              {f.file&&<div style={{background:"#E8F5E9",borderRadius:10,padding:"10px 14px",marginBottom:8,fontSize:13,fontWeight:600,color:"#1B5E3B",display:"flex",justifyContent:"space-between",alignItems:"center"}}>📄 {f.file.name} <button onClick={()=>setF({...f,file:null})} style={{background:"none",border:"none",cursor:"pointer",color:P.textM}}>✕</button></div>}
              <button onClick={()=>fRef.current?.click()} style={{padding:"10px 18px",borderRadius:100,border:`1.5px dashed ${P.border}`,background:"transparent",color:P.accent,fontSize:12,fontWeight:700,cursor:"pointer"}}>{f.pdfUrl?"📄 Neue PDF hochladen":"📄 PDF hochladen"}</button>
            </div>

            {/* Save */}
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button onClick={saveRest} disabled={saving} style={{flex:1,padding:14,fontSize:15,fontWeight:700,background:P.accent,color:"#FFF",borderRadius:100,border:"none",cursor:saving?"wait":"pointer",opacity:saving?0.6:1}}>{saving?"Speichern...":editId?"💾 Änderungen speichern":"✅ Lieferdienst anlegen"}</button>
              {editId&&<button onClick={()=>{setTab("list");setEditId(null);setF({...empty});}} style={{padding:14,fontSize:15,fontWeight:700,background:P.card,color:P.textM,borderRadius:100,border:`1.5px solid ${P.border}`,cursor:"pointer"}}>Abbrechen</button>}
            </div>
          </div>
        </div>)}
      </div>
    </div>
  );
}
