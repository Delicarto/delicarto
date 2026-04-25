"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";

const P = { accent: "#2D6A4F", mint: "#40916C", warm: "#D4A373", text: "#1B2A1D", textM: "#6B7E6F", border: "#D5CCBB", bg: "#F5F0E8", card: "#FFFDF8" };
const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const TIMES = [];
for (let h = 0; h < 24; h++) { TIMES.push(`${String(h).padStart(2, "0")}:00`); TIMES.push(`${String(h).padStart(2, "0")}:30`); }
const mkDS = () => DAYS.map(() => ({ closed: false, slots: [{ open: "11:00", close: "22:00" }] }));
const CATS = ["Italienisch", "Vietnamesisch", "Türkisch", "Japanisch", "Indisch", "Griechisch", "Chinesisch", "Mexikanisch", "Deutsch", "Vegan", "Vegetarisch", "Halal", "Burger", "Sonstiges"];
const CE = { "Italienisch": "🍕", "Vietnamesisch": "🍜", "Türkisch": "🥙", "Japanisch": "🍣", "Indisch": "🍛", "Griechisch": "🥗", "Chinesisch": "🥡", "Mexikanisch": "🌮", "Deutsch": "🥨", "Vegan": "🌱", "Vegetarisch": "🥬", "Halal": "☪️", "Burger": "🍔", "Sonstiges": "🍽️" };

const lb = { fontSize: 11, fontWeight: 700, color: "#6B7E6F", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 };
const is = { fontSize: 14, fontWeight: 500, border: "1.5px solid #D5CCBB", borderRadius: 10, background: "#FFF", color: "#1B2A1D", padding: "12px 14px", width: "100%", fontFamily: "inherit", boxSizing: "border-box" };

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [zones, setZones] = useState([{ name: "", plz: "", cost: "0€", minOrder: "" }]);
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const fRef = useRef(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { window.location.href = "/login"; return; }
    setUser(session.user);

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_id", session.user.id)
      .maybeSingle();

    if (error) {
      setErr("Fehler beim Laden: " + error.message);
    } else if (data) {
      // Schedule und Zones initialisieren
      if (!data.schedule || !Array.isArray(data.schedule) || data.schedule.length !== 7) {
        data.schedule = mkDS();
      }
      if (!data.categories) data.categories = [];
      setRestaurant(data);

      // Liefergebiete laden
      const { data: zd } = await supabase
        .from("delivery_zones")
        .select("*")
        .eq("restaurant_id", data.id);
      if (zd && zd.length > 0) {
        setZones(zd.map(z => ({ name: z.zone_name, plz: z.plz, cost: z.delivery_cost, minOrder: z.min_order || "" })));
      }
    } else {
      setErr("Kein Restaurant-Eintrag gefunden. Bitte melde dich bei uns: info@delicarto.de");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const update = (field, value) => setRestaurant({ ...restaurant, [field]: value });

  const handleSave = async () => {
    setMsg(""); setErr("");
    const errors = [];
    if (!restaurant.name?.trim()) errors.push("Firmenname fehlt");
    if (!restaurant.phone?.trim()) errors.push("Telefon fehlt");
    if (!restaurant.city?.trim()) errors.push("Stadt fehlt");
    if (errors.length > 0) { setErr("❌ " + errors.join(" · ")); window.scrollTo({ top: 0, behavior: "smooth" }); return; }

    setSaving(true);
    try {
      let pdfUrl = restaurant.pdf_url;
      let pdfName = restaurant.pdf_name;
      let imageUrl = restaurant.image_url;

      // Bild hochladen falls neu
      if (imageFile) {
        const imgName = `img-${Date.now()}-${imageFile.name}`;
        const { error: ie } = await supabase.storage.from("menus").upload(imgName, imageFile);
        if (ie) throw ie;
        const { data: { publicUrl } } = supabase.storage.from("menus").getPublicUrl(imgName);
        imageUrl = publicUrl;
      }

      // PDF hochladen falls neu
      if (pdfFile) {
        const fn = `${Date.now()}-${pdfFile.name}`;
        const { error: fe } = await supabase.storage.from("menus").upload(fn, pdfFile);
        if (fe) throw fe;
        const { data: { publicUrl } } = supabase.storage.from("menus").getPublicUrl(fn);
        pdfUrl = publicUrl;
        pdfName = pdfFile.name;
      }

      // Restaurant updaten
      const updateData = {
        name: restaurant.name.trim(),
        categories: restaurant.categories || [],
        street: restaurant.street?.trim() || null,
        house_nr: restaurant.house_nr?.trim() || null,
        plz: restaurant.plz?.trim() || null,
        city: restaurant.city.trim(),
        phone: restaurant.phone.trim(),
        whatsapp: restaurant.is_premium ? (restaurant.whatsapp?.trim() || null) : null,
        website: restaurant.is_premium ? (restaurant.website?.trim() || null) : null,
        daily_special: restaurant.is_premium ? (restaurant.daily_special?.trim() || null) : null,
        min_order: restaurant.min_order?.trim() || null,
        schedule: restaurant.schedule,
        image_url: imageUrl,
        pdf_url: pdfUrl,
        pdf_name: pdfName,
      };

      const { error: ue } = await supabase.from("restaurants").update(updateData).eq("id", restaurant.id);
      if (ue) throw ue;

      // Liefergebiete updaten: erst alle löschen, dann neu einfügen
      await supabase.from("delivery_zones").delete().eq("restaurant_id", restaurant.id);
      const validZones = zones.filter(z => z.name?.trim() && z.plz?.trim());
      if (validZones.length > 0) {
        await supabase.from("delivery_zones").insert(validZones.map(z => ({
          restaurant_id: restaurant.id,
          zone_name: z.name.trim(),
          plz: z.plz.trim(),
          delivery_cost: z.cost?.trim() || "0€",
          min_order: z.minOrder?.trim() || null,
        })));
      }

      // Lokale States aktualisieren
      setRestaurant({ ...restaurant, ...updateData });
      setImageFile(null);
      setPdfFile(null);
      setMsg("✅ Änderungen gespeichert!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setMsg(""), 4000);
    } catch (e) {
      setErr("❌ " + (e.message || "Fehler beim Speichern"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setSaving(false);
  };

  if (loading) {
    return (<div style={{ fontFamily: "system-ui", background: P.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: P.textM, fontSize: 14 }}>Wird geladen...</div>
    </div>);
  }

  if (!restaurant) {
    return (<div style={{ fontFamily: "system-ui", background: P.bg, minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 460, margin: "60px auto", background: P.card, borderRadius: 24, padding: "40px 32px", border: "1.5px solid " + P.border, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: P.text, marginBottom: 12 }}>Profil nicht gefunden</h1>
        <p style={{ fontSize: 14, color: P.textM, lineHeight: 1.6, marginBottom: 24 }}>{err}</p>
        <button onClick={handleLogout} style={{ padding: "12px 28px", background: P.accent, color: "#FFF", borderRadius: 100, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Abmelden</button>
      </div>
    </div>);
  }

  const statusInfo = restaurant.approval_status === "approved"
    ? { color: "#1B5E3B", bg: "#E8F5E9", label: "✅ Freigegeben — du bist auf DeliCarto sichtbar" }
    : restaurant.approval_status === "rejected"
    ? { color: "#C4314B", bg: "#FFF0F3", label: "❌ Abgelehnt — bitte kontaktiere uns" }
    : { color: "#BC6C25", bg: "#FFF5EB", label: "⏳ Wird geprüft — wir schalten dich innerhalb von 24h frei" };

  const isPremium = restaurant.is_premium;

  return (
    <div style={{ fontFamily: "system-ui", background: P.bg, minHeight: "100vh", padding: "20px 16px 40px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingTop: 8 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: P.text }}>🍽️ Mein Dashboard</div>
          <button onClick={handleLogout} style={{ padding: "8px 16px", background: "#FFF", color: P.text, borderRadius: 100, fontWeight: 600, fontSize: 13, border: "1.5px solid " + P.border, cursor: "pointer" }}>Abmelden</button>
        </div>

        {/* Status */}
        <div style={{ padding: "14px 18px", borderRadius: 14, marginBottom: 16, background: statusInfo.bg, color: statusInfo.color, fontSize: 13, fontWeight: 700 }}>{statusInfo.label}</div>

        {/* Premium-Banner */}
        {!isPremium && (
          <div style={{ padding: "16px 20px", borderRadius: 14, marginBottom: 16, background: "linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)", color: "#FFF" }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>⭐ Premium freischalten</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12, lineHeight: 1.5 }}>Tagesangebote, WhatsApp-Button, Website-Link, Top-Platzierung. Nur 9,90€/Monat.</div>
            <button onClick={() => alert("Stripe-Integration kommt bald!")} style={{ padding: "10px 20px", background: "#FFF", color: P.accent, borderRadius: 100, fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>Mehr erfahren</button>
          </div>
        )}

        {isPremium && (
          <div style={{ padding: "14px 18px", borderRadius: 14, marginBottom: 16, background: "linear-gradient(135deg, #D4A373 0%, #BC6C25 100%)", color: "#FFF", fontSize: 13, fontWeight: 700 }}>⭐ Premium aktiv — alle Features freigeschaltet</div>
        )}

        {/* Meldungen */}
        {err && <div style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 14, background: "#FFF0F3", fontSize: 13, fontWeight: 700, color: "#C4314B" }}>{err}</div>}
        {msg && <div style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 14, background: "#E8F5E9", fontSize: 13, fontWeight: 700, color: "#1B5E3B" }}>{msg}</div>}

        {/* Hauptkarte: Profil */}
        <div style={{ background: P.card, borderRadius: 20, padding: "24px 22px", border: "1.5px solid " + P.border, marginBottom: 16 }}>
          <div style={{ display: "grid", gap: 16 }}>

            {/* Stammdaten */}
            <div style={{ fontSize: 16, fontWeight: 800, color: P.text, marginBottom: -4 }}>📝 Stammdaten</div>

            <div>
              <label style={lb}>Firmenname *</label>
              <input style={is} value={restaurant.name || ""} onChange={(e) => update("name", e.target.value)} />
            </div>

            <div>
              <label style={lb}>Küche *</label>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {CATS.map(c => {
                  const s = (restaurant.categories || []).includes(c);
                  return (<button key={c} type="button" onClick={() => update("categories", s ? restaurant.categories.filter(x => x !== c) : [...(restaurant.categories || []), c])} style={{ padding: "6px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, border: s ? "none" : "1.5px solid #D5CCBB", background: s ? P.accent : "#FFF", color: s ? "#FFF" : P.textM, cursor: "pointer" }}>{CE[c]} {c}</button>);
                })}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 10 }}>
              <div><label style={lb}>Straße</label><input style={is} value={restaurant.street || ""} onChange={(e) => update("street", e.target.value)} /></div>
              <div><label style={lb}>Nr.</label><input style={is} value={restaurant.house_nr || ""} onChange={(e) => update("house_nr", e.target.value)} /></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
              <div><label style={lb}>PLZ</label><input style={is} value={restaurant.plz || ""} onChange={(e) => update("plz", e.target.value.replace(/\D/g, "").slice(0, 5))} /></div>
              <div><label style={lb}>Stadt *</label><input style={is} value={restaurant.city || ""} onChange={(e) => update("city", e.target.value)} /></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={lb}>Telefon *</label><input style={is} value={restaurant.phone || ""} onChange={(e) => update("phone", e.target.value)} /></div>
              <div><label style={lb}>Mindestbestellwert</label><input style={is} placeholder="10€" value={restaurant.min_order || ""} onChange={(e) => update("min_order", e.target.value)} /></div>
            </div>

            <div>
              <label style={lb}>WhatsApp {!isPremium && <span style={{ color: "#BC6C25", fontSize: 10 }}>(Premium)</span>}</label>
              <input style={{ ...is, opacity: isPremium ? 1 : 0.5 }} placeholder="z.B. 4917412345678 (mit Ländervorwahl)" value={restaurant.whatsapp || ""} onChange={(e) => update("whatsapp", e.target.value)} disabled={!isPremium} />
            </div>

            <div>
              <label style={lb}>Website {!isPremium && <span style={{ color: "#BC6C25", fontSize: 10 }}>(Premium)</span>}</label>
              <input style={{ ...is, opacity: isPremium ? 1 : 0.5 }} placeholder="https://www.dein-lieferdienst.de" value={restaurant.website || ""} onChange={(e) => update("website", e.target.value)} disabled={!isPremium} />
            </div>

            <div>
              <label style={lb}>Tagesangebote {!isPremium && <span style={{ color: "#BC6C25", fontSize: 10 }}>(Premium)</span>}</label>
              <textarea style={{ ...is, height: 100, resize: "vertical", opacity: isPremium ? 1 : 0.5 }} placeholder={"Mo: Nudeltag - alle Nudeln 7€\nDi: Pizzatag - alle 28cm Pizza 7€\nMi: Schnitzeltag 9€"} value={restaurant.daily_special || ""} onChange={(e) => update("daily_special", e.target.value)} disabled={!isPremium} />
            </div>

            {/* Liefergebiete */}
            <div style={{ borderTop: "1px solid " + P.border, paddingTop: 16, marginTop: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: P.text, marginBottom: 12 }}>🚗 Liefergebiete</div>
              {zones.map((z, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap", alignItems: "end" }}>
                  <div style={{ width: 140 }}>{i === 0 && <label style={lb}>Ort</label>}<input style={is} placeholder="Essen" value={z.name} onChange={(e) => { const n = [...zones]; n[i] = { ...n[i], name: e.target.value }; setZones(n); }} /></div>
                  <div style={{ width: 90 }}>{i === 0 && <label style={lb}>PLZ</label>}<input style={is} placeholder="49632" value={z.plz} onChange={(e) => { const n = [...zones]; n[i] = { ...n[i], plz: e.target.value.replace(/\D/g, "").slice(0, 5) }; setZones(n); }} /></div>
                  <div style={{ width: 100 }}>{i === 0 && <label style={lb}>Kosten</label>}<input style={is} placeholder="2,50€" value={z.cost} onChange={(e) => { const n = [...zones]; n[i] = { ...n[i], cost: e.target.value }; setZones(n); }} /></div>
                  <div style={{ width: 100 }}>{i === 0 && <label style={lb}>Min.Best.</label>}<input style={is} placeholder="10€" value={z.minOrder} onChange={(e) => { const n = [...zones]; n[i] = { ...n[i], minOrder: e.target.value }; setZones(n); }} /></div>
                  {zones.length > 1 && <button onClick={() => setZones(zones.filter((_, k) => k !== i))} style={{ padding: "12px 14px", borderRadius: 10, border: "none", background: "#FFF0F3", color: "#C4314B", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✕</button>}
                </div>
              ))}
              <button onClick={() => setZones([...zones, { name: "", plz: "", cost: "0€", minOrder: "" }])} style={{ marginTop: 6, padding: "8px 16px", borderRadius: 100, border: "1.5px dashed " + P.border, background: "transparent", color: P.accent, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Weiteres Liefergebiet</button>
            </div>

            {/* Öffnungszeiten */}
            <div style={{ borderTop: "1px solid " + P.border, paddingTop: 16, marginTop: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: P.text, marginBottom: 12 }}>🕐 Öffnungszeiten</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {DAYS.map((_, i) => {
                  const d = (restaurant.schedule || mkDS())[i];
                  return (<div key={i} style={{ padding: "8px 12px", borderRadius: 10, background: d.closed ? "#FFF0F3" : "#E8F5E9", border: `1px solid ${d.closed ? "#FFD6E0" : "#A8DAB5"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ width: 28, fontWeight: 800, fontSize: 12 }}>{DAYS[i]}</div>
                      <button onClick={() => { const s = [...restaurant.schedule]; s[i] = { ...s[i], closed: !s[i].closed, slots: s[i].closed ? [{ open: "11:00", close: "22:00" }] : s[i].slots }; update("schedule", s); }} style={{ padding: "3px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: "pointer", border: "none", background: d.closed ? "#FF8FA3" : P.accent, color: "#FFF" }}>{d.closed ? "Ruhetag" : "Geöffnet"}</button>
                      {!d.closed && <button onClick={() => { const src = restaurant.schedule[i]; update("schedule", restaurant.schedule.map(() => ({ closed: src.closed, slots: src.slots.map(s => ({ ...s })) }))); }} style={{ marginLeft: "auto", padding: "3px 8px", borderRadius: 6, fontSize: 9, fontWeight: 700, cursor: "pointer", border: "1px solid " + P.border, background: "#FFF", color: P.textM }}>📋 Auf alle Tage</button>}
                    </div>
                    {!d.closed && <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                      {d.slots.map((sl, si) => (<div key={si} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <select value={sl.open} onChange={(e) => { const s = [...restaurant.schedule]; s[i] = { ...s[i], slots: s[i].slots.map((x, k) => k === si ? { ...x, open: e.target.value } : x) }; update("schedule", s); }} style={{ padding: "3px 6px", borderRadius: 6, border: "1px solid " + P.border, fontSize: 12, background: "#FFF" }}>{TIMES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                        <span style={{ fontSize: 12, color: P.textM }}>–</span>
                        <select value={sl.close} onChange={(e) => { const s = [...restaurant.schedule]; s[i] = { ...s[i], slots: s[i].slots.map((x, k) => k === si ? { ...x, close: e.target.value } : x) }; update("schedule", s); }} style={{ padding: "3px 6px", borderRadius: 6, border: "1px solid " + P.border, fontSize: 12, background: "#FFF" }}>{TIMES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                        {d.slots.length > 1 && <button onClick={() => { const s = [...restaurant.schedule]; s[i] = { ...s[i], slots: s[i].slots.filter((_, k) => k !== si) }; update("schedule", s); }} style={{ width: 22, height: 22, borderRadius: 6, border: "none", background: "#FFF0F3", color: "#FF8FA3", fontSize: 11, cursor: "pointer" }}>✕</button>}
                      </div>))}
                      {d.slots.length < 3 && <button onClick={() => { const s = [...restaurant.schedule]; s[i] = { ...s[i], slots: [...s[i].slots, { open: "17:00", close: "22:00" }] }; update("schedule", s); }} style={{ padding: "3px 10px", borderRadius: 6, border: "1px dashed " + P.border, background: "transparent", color: P.accent, fontSize: 10, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start" }}>+ Zeitspanne (z.B. Mittagspause)</button>}
                    </div>}
                  </div>);
                })}
              </div>
            </div>

            {/* Logo / Bild */}
            <div style={{ borderTop: "1px solid " + P.border, paddingTop: 16, marginTop: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: P.text, marginBottom: 12 }}>🖼️ Logo / Foto</div>
              <input type="file" accept="image/*" id="imgUploadDash" onChange={(e) => { if (e.target.files[0]) setImageFile(e.target.files[0]); }} style={{ display: "none" }} />
              {restaurant.image_url && !imageFile && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <img src={restaurant.image_url} style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover" }} alt="Logo" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1B5E3B" }}>✅ Bild vorhanden</span>
                </div>
              )}
              {imageFile && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <img src={URL.createObjectURL(imageFile)} style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover" }} alt="Vorschau" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1B5E3B" }}>{imageFile.name}</span>
                  <button onClick={() => setImageFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: P.textM, fontSize: 14 }}>✕</button>
                </div>
              )}
              <button onClick={() => document.getElementById("imgUploadDash")?.click()} style={{ padding: "10px 18px", borderRadius: 100, border: "1.5px dashed " + P.border, background: "transparent", color: P.accent, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{restaurant.image_url ? "🖼️ Neues Bild" : "🖼️ Bild hochladen"}</button>
              <div style={{ fontSize: 11, color: P.textM, marginTop: 4 }}>Wird quadratisch zugeschnitten. Kein Bild = Küchen-Emoji.</div>
            </div>

            {/* PDF */}
            <div style={{ borderTop: "1px solid " + P.border, paddingTop: 16, marginTop: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: P.text, marginBottom: 12 }}>📄 Speisekarte (PDF)</div>
              <input type="file" accept=".pdf" ref={fRef} onChange={(e) => { if (e.target.files[0]) setPdfFile(e.target.files[0]); }} style={{ display: "none" }} />
              {restaurant.pdf_url && !pdfFile && (
                <div style={{ background: "#E8F5E9", borderRadius: 10, padding: "10px 14px", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#1B5E3B" }}>📄 {restaurant.pdf_name || "Speisekarte vorhanden"}</div>
              )}
              {pdfFile && (
                <div style={{ background: "#E8F5E9", borderRadius: 10, padding: "10px 14px", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#1B5E3B", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  📄 {pdfFile.name}
                  <button onClick={() => setPdfFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: P.textM, fontSize: 14 }}>✕</button>
                </div>
              )}
              <button onClick={() => fRef.current?.click()} style={{ padding: "10px 18px", borderRadius: 100, border: "1.5px dashed " + P.border, background: "transparent", color: P.accent, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{restaurant.pdf_url ? "📄 Neue PDF" : "📄 PDF hochladen"}</button>
            </div>

            {/* Speichern */}
            <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: 16, fontSize: 15, fontWeight: 700, background: P.accent, color: "#FFF", borderRadius: 100, border: "none", cursor: saving ? "wait" : "pointer", opacity: saving ? 0.6 : 1, marginTop: 8 }}>
              {saving ? "Wird gespeichert..." : "💾 Alle Änderungen speichern"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "16px 20px", background: P.card, borderRadius: 14, border: "1px solid " + P.border, fontSize: 13, color: P.textM, lineHeight: 1.6 }}>
          <strong style={{ color: P.text }}>💡 Tipp:</strong> Nach jeder Änderung "Alle Änderungen speichern" klicken. Änderungen sind sofort live, sobald dein Profil freigegeben ist.
          <div style={{ marginTop: 8, fontSize: 12 }}>Eingeloggt als <strong style={{ color: P.text }}>{user?.email}</strong></div>
        </div>
      </div>
    </div>
  );
}
