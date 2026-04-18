"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const P={accent:"#2D6A4F",mint:"#40916C",warm:"#D4A373",text:"#1B2A1D",textM:"#6B7E6F",border:"#D5CCBB",bg:"#F5F0E8",card:"#FFFDF8"};
const STATUSES=[
  {id:"interessent",label:"Interessent",color:"#E8F0E8",text:"#2D6A4F",icon:"🔍"},
  {id:"kontaktiert",label:"Kontaktiert",color:"#E8F4FD",text:"#1D6FA5",icon:"📞"},
  {id:"aktiv",label:"Aktiv",color:"#E8F5E9",text:"#1B5E3B",icon:"✅"},
  {id:"premium",label:"Premium",color:"#FFF5EB",text:"#BC6C25",icon:"⭐"},
  {id:"gekuendigt",label:"Gekündigt",color:"#FFF0F3",text:"#C4314B",icon:"❌"},
];
const getStatus=(id)=>STATUSES.find(s=>s.id===id)||STATUSES[0];
const lb={fontSize:11,fontWeight:700,color:"#6B7E6F",textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:6};
const is={fontSize:14,fontWeight:500,border:"1.5px solid #D5CCBB",borderRadius:10,background:"#FFF",color:"#1B2A1D",padding:"12px 14px",width:"100%",fontFamily:"inherit"};
const formatDate=(d)=>d?new Date(d).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"}):"—";
const isOverdue=(d)=>d&&new Date(d)<new Date();
const isToday=(d)=>{if(!d)return false;const t=new Date(),dd=new Date(d);return t.toDateString()===dd.toDateString();};

// ========= CONTACT FORM =========
function ContactForm({initial,editId,user,onSaved,onCancel}){
  const empty={company_name:"",contact_person:"",phone:"",email:"",address:"",plz:"",city:"",status:"interessent",notes:"",last_contact:"",next_followup:"",followup_note:"",pdf_url:""};
  const[f,setF]=useState(initial||empty);
  const[saving,setSaving]=useState(false);
  const[err,setErr]=useState("");
  const upd=(k,v)=>setF(prev=>({...prev,[k]:v}));

  const save=async()=>{
    if(!f.company_name.trim()){setErr("❌ Firmenname fehlt");return;}
    setSaving(true);setErr("");
    try{
      const data={
        company_name:f.company_name,contact_person:f.contact_person||null,
        phone:f.phone||null,email:f.email||null,address:f.address||null,
        plz:f.plz||null,city:f.city||null,status:f.status,notes:f.notes||null,
        last_contact:f.last_contact||null,next_followup:f.next_followup||null,
        followup_note:f.followup_note||null,pdf_url:f.pdf_url||null,
        owner_id:user.id,updated_at:new Date().toISOString()
      };
      if(editId){
        const{error}=await supabase.from("crm_contacts").update(data).eq("id",editId);
        if(error)throw error;
      }else{
        const{error}=await supabase.from("crm_contacts").insert(data);
        if(error)throw error;
      }
      onSaved(editId?"✅ Gespeichert!":"✅ Kontakt angelegt!");
    }catch(e){setErr("❌ "+e.message);}
    setSaving(false);
  };

  return(<div style={{background:P.card,borderRadius:20,padding:"28px 24px",border:`1.5px solid ${P.border}`}}>
    <h2 style={{fontSize:20,fontWeight:900,marginBottom:20}}>{editId?"✏️ Kontakt bearbeiten":"+ Neuer Kontakt"}</h2>
    {err&&<div style={{padding:"10px 14px",borderRadius:10,marginBottom:16,background:"#FFF0F3",fontSize:13,fontWeight:700,color:"#C4314B"}}>{err}</div>}
    <div style={{display:"grid",gap:14}}>
      <div><label style={lb}>Firmenname / Lieferdienst *</label><input style={is} placeholder="z.B. Hot Spicy" value={f.company_name} onChange={e=>upd("company_name",e.target.value)}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><label style={lb}>Ansprechpartner</label><input style={is} placeholder="z.B. Herr Müller" value={f.contact_person||""} onChange={e=>upd("contact_person",e.target.value)}/></div>
        <div><label style={lb}>Telefon</label><input style={is} placeholder="05434-1234567" value={f.phone||""} onChange={e=>upd("phone",e.target.value)}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><label style={lb}>E-Mail</label><input style={is} placeholder="info@..." value={f.email||""} onChange={e=>upd("email",e.target.value)}/></div>
        <div><label style={lb}>Status</label><select style={is} value={f.status} onChange={e=>upd("status",e.target.value)}>{STATUSES.map(s=>(<option key={s.id} value={s.id}>{s.icon} {s.label}</option>))}</select></div>
      </div>
      <div><label style={lb}>Adresse</label><input style={is} placeholder="Hauptstr. 12" value={f.address||""} onChange={e=>upd("address",e.target.value)}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}>
        <div><label style={lb}>PLZ</label><input style={is} placeholder="49632" value={f.plz||""} onChange={e=>upd("plz",e.target.value)}/></div>
        <div><label style={lb}>Ort</label><input style={is} placeholder="Essen" value={f.city||""} onChange={e=>upd("city",e.target.value)}/></div>
      </div>

      <div style={{borderTop:`1px solid ${P.border}`,paddingTop:14}}>
        <div style={{fontSize:13,fontWeight:800,color:P.accent,marginBottom:10}}>📅 Follow-up</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={lb}>Letzter Kontakt</label><input type="date" style={is} value={f.last_contact?f.last_contact.slice(0,10):""} onChange={e=>upd("last_contact",e.target.value)}/></div>
          <div><label style={lb}>Nächster Follow-up</label><input type="date" style={is} value={f.next_followup?f.next_followup.slice(0,10):""} onChange={e=>upd("next_followup",e.target.value)}/></div>
        </div>
        <div style={{marginTop:10}}><label style={lb}>Follow-up Notiz</label><input style={is} placeholder="z.B. Speisekarte prüfen, Premium anbieten" value={f.followup_note||""} onChange={e=>upd("followup_note",e.target.value)}/></div>
      </div>

      <div style={{borderTop:`1px solid ${P.border}`,paddingTop:14}}>
        <div><label style={lb}>Notizen</label><textarea style={{...is,height:80,resize:"vertical"}} placeholder="Freitext für alles Wichtige..." value={f.notes||""} onChange={e=>upd("notes",e.target.value)}/></div>
      </div>

      <div><label style={lb}>Speisekarte PDF-Link (optional)</label><input style={is} placeholder="https://..." value={f.pdf_url||""} onChange={e=>upd("pdf_url",e.target.value)}/></div>

      <div style={{display:"flex",gap:10,marginTop:8}}>
        <button onClick={save} disabled={saving} style={{flex:1,padding:14,fontSize:15,fontWeight:700,background:P.accent,color:"#FFF",borderRadius:100,border:"none",cursor:saving?"wait":"pointer",opacity:saving?0.6:1}}>{saving?"Speichern...":editId?"💾 Speichern":"✅ Anlegen"}</button>
        {onCancel&&<button onClick={onCancel} style={{padding:14,fontSize:15,fontWeight:700,background:P.card,color:P.textM,borderRadius:100,border:`1.5px solid ${P.border}`,cursor:"pointer"}}>Abbrechen</button>}
      </div>
    </div>
  </div>);
}

// ========= CRM PAGE =========
export default function CRMPage(){
  const[user,setUser]=useState(null);
  const[authLoading,setAuthLoading]=useState(true);
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[authErr,setAuthErr]=useState("");
  const[contacts,setContacts]=useState([]);
  const[tab,setTab]=useState("list");
  const[editId,setEditId]=useState(null);
  const[editInit,setEditInit]=useState(null);
  const[msg,setMsg]=useState("");
  const[filter,setFilter]=useState("alle");
  const[search,setSearch]=useState("");

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setUser(session?.user||null);setAuthLoading(false);});
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>{setUser(s?.user||null);});
    return()=>subscription.unsubscribe();
  },[]);
  useEffect(()=>{if(user)loadAll();},[user]);

  const loadAll=async()=>{
    const{data}=await supabase.from("crm_contacts").select("*").order("created_at",{ascending:false});
    setContacts(data||[]);
  };
  const doLogin=async()=>{setAuthErr("");const{data,error}=await supabase.auth.signInWithPassword({email,password:pass});if(error){setAuthErr("Falsche Zugangsdaten.");return;}setUser(data.user);};
  const doLogout=async()=>{await supabase.auth.signOut();setUser(null);};
  const deleteContact=async(id)=>{if(!confirm("Kontakt wirklich löschen?"))return;await supabase.from("crm_contacts").delete().eq("id",id);loadAll();setMsg("🗑️ Gelöscht.");};
  const startEdit=(c)=>{setEditInit({...c});setEditId(c.id);setTab("edit");setMsg("");};
  const handleSaved=(m)=>{loadAll();setMsg(m);setTab("list");setEditId(null);setEditInit(null);};

  // Stats
  const overdueCount=contacts.filter(c=>isOverdue(c.next_followup)&&c.status!=="gekuendigt").length;
  const todayCount=contacts.filter(c=>isToday(c.next_followup)).length;
  const activeCount=contacts.filter(c=>c.status==="aktiv").length;
  const premiumCount=contacts.filter(c=>c.status==="premium").length;

  // Filtered
  const filtered=contacts.filter(c=>{
    if(filter!=="alle"&&filter!=="faellig"&&c.status!==filter)return false;
    if(filter==="faellig"&&!isOverdue(c.next_followup))return false;
    if(search&&!c.company_name.toLowerCase().includes(search.toLowerCase())&&!(c.contact_person||"").toLowerCase().includes(search.toLowerCase())&&!(c.city||"").toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  const importFromRestaurants=async()=>{
    const{data:rests}=await supabase.from("restaurants").select("*");
    if(!rests||rests.length===0){setMsg("❌ Keine Lieferdienste zum Importieren.");return;}
    let imported=0;
    for(const r of rests){
      const exists=contacts.some(c=>c.restaurant_id===r.id);
      if(!exists){
        await supabase.from("crm_contacts").insert({
          company_name:r.name,phone:r.phone||null,address:`${r.street||""} ${r.house_nr||""}`.trim()||null,
          plz:r.plz||null,city:r.city||null,status:r.is_premium?"premium":"aktiv",
          pdf_url:r.pdf_url||null,restaurant_id:r.id,owner_id:user.id,
          next_followup:new Date(Date.now()+90*24*60*60*1000).toISOString()
        });
        imported++;
      }
    }
    await loadAll();
    setMsg(imported>0?`✅ ${imported} Lieferdienst${imported!==1?"e":""} importiert! Follow-up in 3 Monaten gesetzt.`:"ℹ️ Alle Lieferdienste sind bereits im CRM.");
  };

  if(authLoading)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:P.bg,fontFamily:"system-ui"}}><p>Laden...</p></div>);
  if(!user)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:P.bg,fontFamily:"system-ui"}}>
      <div style={{background:P.card,borderRadius:24,padding:"40px 32px",maxWidth:380,width:"100%",border:`1.5px solid ${P.border}`}}>
        <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:28,fontWeight:900}}>📋 CRM</div><p style={{color:P.textM,fontSize:13,marginTop:4}}>DeliCarto Kundenverwaltung</p></div>
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
      {/* Header */}
      <div style={{background:P.card,borderBottom:`1px solid ${P.border}`,padding:"14px 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:22}}>📋</span><div><div style={{fontSize:18,fontWeight:900}}>DeliCarto CRM</div><div style={{fontSize:11,color:P.textM}}>{user.email}</div></div></div>
          <div style={{display:"flex",gap:8}}>
            <a href="/" style={{padding:"8px 16px",borderRadius:100,fontSize:12,fontWeight:700,background:P.bg,border:`1.5px solid ${P.border}`,color:P.textM,textDecoration:"none"}}>🌐 Seite</a>
            <a href="/admin" style={{padding:"8px 16px",borderRadius:100,fontSize:12,fontWeight:700,background:P.bg,border:`1.5px solid ${P.border}`,color:P.textM,textDecoration:"none"}}>🔧 Admin</a>
            <button onClick={doLogout} style={{padding:"8px 16px",borderRadius:100,fontSize:12,fontWeight:700,background:"#FFF0F3",border:"1px solid #FFD6E0",color:"#C4314B",cursor:"pointer"}}>Abmelden</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px"}}>
        {/* Dashboard Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))",gap:10,marginBottom:24}}>
          <div style={{background:P.card,borderRadius:14,padding:"16px",border:`1.5px solid ${P.border}`,textAlign:"center"}}><div style={{fontSize:28,fontWeight:900}}>{contacts.length}</div><div style={{fontSize:11,color:P.textM,fontWeight:700}}>Gesamt</div></div>
          <div style={{background:overdueCount>0?"#FFF0F3":P.card,borderRadius:14,padding:"16px",border:`1.5px solid ${overdueCount>0?"#FFD6E0":P.border}`,textAlign:"center",cursor:"pointer"}} onClick={()=>setFilter("faellig")}><div style={{fontSize:28,fontWeight:900,color:overdueCount>0?"#C4314B":P.text}}>{overdueCount}</div><div style={{fontSize:11,color:overdueCount>0?"#C4314B":P.textM,fontWeight:700}}>⚠️ Überfällig</div></div>
          <div style={{background:"#E8F5E9",borderRadius:14,padding:"16px",border:"1.5px solid #A7D7A0",textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,color:"#1B5E3B"}}>{activeCount}</div><div style={{fontSize:11,color:"#1B5E3B",fontWeight:700}}>✅ Aktiv</div></div>
          <div style={{background:"#FFF5EB",borderRadius:14,padding:"16px",border:"1.5px solid #FFDDB5",textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,color:"#BC6C25"}}>{premiumCount}</div><div style={{fontSize:11,color:"#BC6C25",fontWeight:700}}>⭐ Premium</div></div>
          <div style={{background:"#E8F4FD",borderRadius:14,padding:"16px",border:"1.5px solid #93C5FD",textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,color:"#1D6FA5"}}>{todayCount}</div><div style={{fontSize:11,color:"#1D6FA5",fontWeight:700}}>📅 Heute</div></div>
        </div>

        {/* Overdue Alert */}
        {overdueCount>0&&tab==="list"&&(<div style={{padding:"14px 18px",borderRadius:14,marginBottom:20,background:"#FFF0F3",border:"1.5px solid #FFD6E0",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div><span style={{fontSize:14,fontWeight:800,color:"#C4314B"}}>⚠️ {overdueCount} Kontakt{overdueCount!==1?"e":""} überfällig für Follow-up!</span><div style={{fontSize:12,color:"#C4314B",marginTop:2}}>Bitte anrufen und Speisekarte prüfen.</div></div>
          <button onClick={()=>setFilter("faellig")} style={{padding:"8px 18px",borderRadius:100,fontSize:12,fontWeight:700,background:"#C4314B",color:"#FFF",border:"none",cursor:"pointer"}}>Anzeigen</button>
        </div>)}

        {msg&&<div style={{padding:"12px 16px",borderRadius:12,marginBottom:16,background:msg.startsWith("❌")?"#FFF0F3":"#E8F5E9",fontSize:13,fontWeight:700,color:msg.startsWith("❌")?"#C4314B":"#1B5E3B"}}>{msg}</div>}

        {/* Tabs */}
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <button onClick={()=>{setTab("list");setEditId(null);setEditInit(null);setMsg("");}} style={{padding:"10px 20px",borderRadius:100,fontSize:13,fontWeight:700,background:tab==="list"?P.accent:P.card,color:tab==="list"?"#FFF":P.textM,border:tab==="list"?"none":`1.5px solid ${P.border}`,cursor:"pointer"}}>📋 Kontakte ({contacts.length})</button>
          <button onClick={()=>{setTab("add");setEditId(null);setEditInit(null);setMsg("");}} style={{padding:"10px 20px",borderRadius:100,fontSize:13,fontWeight:700,background:tab==="add"?P.accent:P.card,color:tab==="add"?"#FFF":P.textM,border:tab==="add"?"none":`1.5px solid ${P.border}`,cursor:"pointer"}}>+ Neuer Kontakt</button>
          <button onClick={importFromRestaurants} style={{padding:"10px 20px",borderRadius:100,fontSize:13,fontWeight:700,background:"#E8F4FD",color:"#1D6FA5",border:"1.5px solid #93C5FD",cursor:"pointer"}}>📥 Lieferdienste importieren</button>
        </div>

        {/* LIST */}
        {tab==="list"&&(<div>
          {/* Search & Filter */}
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            <input style={{...is,maxWidth:300}} placeholder="🔍 Suche nach Name, Person, Ort..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <select style={{...is,maxWidth:180}} value={filter} onChange={e=>setFilter(e.target.value)}>
              <option value="alle">Alle Status</option>
              <option value="faellig">⚠️ Überfällig</option>
              {STATUSES.map(s=>(<option key={s.id} value={s.id}>{s.icon} {s.label}</option>))}
            </select>
          </div>

          {filtered.length===0?(<div style={{textAlign:"center",padding:"60px",color:P.textM}}><div style={{fontSize:48}}>📋</div><p style={{fontWeight:700,marginTop:12}}>{contacts.length===0?"Noch keine Kontakte.":"Keine Treffer."}</p></div>):(
            <div style={{display:"grid",gap:8}}>
              {filtered.map(c=>{const st=getStatus(c.status);const overdue=isOverdue(c.next_followup)&&c.status!=="gekuendigt";const today=isToday(c.next_followup);return(
                <div key={c.id} style={{background:P.card,borderRadius:14,padding:"16px 20px",border:`1.5px solid ${overdue?"#FFD6E0":today?"#93C5FD":P.border}`,cursor:"pointer"}} onClick={()=>startEdit(c)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",flexWrap:"wrap",gap:10}}>
                    <div style={{flex:1,minWidth:200}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <span style={{fontSize:16,fontWeight:800}}>{c.company_name}</span>
                        <span style={{fontSize:10,fontWeight:700,padding:"2px 10px",borderRadius:100,background:st.color,color:st.text}}>{st.icon} {st.label}</span>
                        {overdue&&<span style={{fontSize:10,fontWeight:700,padding:"2px 10px",borderRadius:100,background:"#FFF0F3",color:"#C4314B"}}>⚠️ Überfällig</span>}
                        {today&&<span style={{fontSize:10,fontWeight:700,padding:"2px 10px",borderRadius:100,background:"#E8F4FD",color:"#1D6FA5"}}>📅 Heute</span>}
                      </div>
                      <div style={{fontSize:12,color:P.textM}}>
                        {c.contact_person&&<span>👤 {c.contact_person} · </span>}
                        {c.phone&&<span>📞 {c.phone} · </span>}
                        {c.city&&<span>📍 {c.plz} {c.city}</span>}
                      </div>
                      {c.next_followup&&<div style={{fontSize:11,color:overdue?"#C4314B":"#1D6FA5",fontWeight:600,marginTop:4}}>📅 Follow-up: {formatDate(c.next_followup)}{c.followup_note?` — ${c.followup_note}`:""}</div>}
                      {c.notes&&<div style={{fontSize:11,color:P.textM,marginTop:4,maxWidth:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>💬 {c.notes}</div>}
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      {c.phone&&<a href={`tel:${c.phone}`} onClick={e=>e.stopPropagation()} style={{padding:"8px 12px",borderRadius:100,fontSize:12,fontWeight:700,background:"#E8F5E9",border:"1px solid #A7D7A0",color:"#1B5E3B",textDecoration:"none"}}>📞</a>}
                      {c.pdf_url&&<a href={c.pdf_url} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} style={{padding:"8px 12px",borderRadius:100,fontSize:12,fontWeight:700,background:"#E8F0E8",border:`1px solid ${P.border}`,color:P.text,textDecoration:"none"}}>📄</a>}
                      <button onClick={e=>{e.stopPropagation();deleteContact(c.id);}} style={{padding:"8px 12px",borderRadius:100,fontSize:12,fontWeight:700,background:"#FFF0F3",border:"1px solid #FFD6E0",color:"#C4314B",cursor:"pointer"}}>🗑️</button>
                    </div>
                  </div>
                </div>
              );})}
            </div>
          )}
        </div>)}

        {/* ADD/EDIT */}
        {tab==="add"&&<ContactForm key="new" user={user} onSaved={handleSaved} onCancel={()=>{setTab("list");setMsg("");}}/>}
        {tab==="edit"&&editInit&&<ContactForm key={editId} initial={editInit} editId={editId} user={user} onSaved={handleSaved} onCancel={()=>{setTab("list");setEditId(null);setEditInit(null);setMsg("");}}/>}
      </div>
    </div>
  );
}
