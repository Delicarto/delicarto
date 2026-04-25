"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const P = {
  accent: "#2D6A4F",
  text: "#1B2A1D",
  textM: "#6B7E6F",
  border: "#D5CCBB",
  bg: "#F5F0E8",
  card: "#FFFDF8",
  warn: "#BC6C25",
  ok: "#2D6A4F",
};

const lb = {
  fontSize: 11,
  fontWeight: 700,
  color: "#6B7E6F",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  display: "block",
  marginBottom: 6,
};

const is = {
  fontSize: 14,
  fontWeight: 500,
  border: "1.5px solid #D5CCBB",
  borderRadius: 10,
  background: "#FFF",
  color: "#1B2A1D",
  padding: "12px 14px",
  width: "100%",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      window.location.href = "/login";
      return;
    }
    setUser(session.user);

    // Restaurant des Users laden
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_id", session.user.id)
      .maybeSingle();

    if (error) {
      setErr("Fehler beim Laden: " + error.message);
    } else if (data) {
      setRestaurant(data);
    } else {
      setErr("Kein Restaurant-Eintrag gefunden. Bitte melde dich bei uns: info@delicarto.de");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleSave = async () => {
    setMsg("");
    setErr("");
    if (!restaurant.name?.trim()) return setErr("Bitte Firmennamen angeben");
    if (!restaurant.phone?.trim()) return setErr("Bitte Telefonnummer angeben");
    if (!restaurant.city?.trim()) return setErr("Bitte Stadt angeben");

    setSaving(true);
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({
          name: restaurant.name.trim(),
          phone: restaurant.phone.trim(),
          whatsapp: restaurant.whatsapp?.trim() || null,
          street: restaurant.street?.trim() || null,
          house_nr: restaurant.house_nr?.trim() || null,
          plz: restaurant.plz?.trim() || null,
          city: restaurant.city.trim(),
          website: restaurant.website?.trim() || null,
        })
        .eq("id", restaurant.id);

      if (error) throw error;
      setMsg("✅ Änderungen gespeichert!");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setErr("❌ " + (e.message || "Fehler beim Speichern"));
    }
    setSaving(false);
  };

  const update = (field, value) => {
    setRestaurant({ ...restaurant, [field]: value });
  };

  if (loading) {
    return (
      <div style={{ fontFamily: "system-ui", background: P.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: P.textM, fontSize: 14 }}>Wird geladen...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ fontFamily: "system-ui", background: P.bg, minHeight: "100vh", padding: 20 }}>
        <div style={{ maxWidth: 460, margin: "60px auto", background: P.card, borderRadius: 24, padding: "40px 32px", border: "1.5px solid " + P.border, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: P.text, marginBottom: 12 }}>Profil nicht gefunden</h1>
          <p style={{ fontSize: 14, color: P.textM, lineHeight: 1.6, marginBottom: 24 }}>{err}</p>
          <button onClick={handleLogout} style={{ padding: "12px 28px", background: P.accent, color: "#FFF", borderRadius: 100, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
            Abmelden
          </button>
        </div>
      </div>
    );
  }

  // Status-Anzeige
  const statusInfo = restaurant.approval_status === "approved"
    ? { color: P.ok, bg: "#E8F5E9", label: "✅ Freigegeben — du bist auf DeliCarto sichtbar" }
    : restaurant.approval_status === "rejected"
    ? { color: "#C4314B", bg: "#FFF0F3", label: "❌ Abgelehnt — bitte kontaktiere uns" }
    : { color: P.warn, bg: "#FFF5EB", label: "⏳ Wird geprüft — wir schalten dich innerhalb von 24h frei" };

  return (
    <div style={{ fontFamily: "system-ui", background: P.bg, minHeight: "100vh", padding: "20px 16px 40px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingTop: 8 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: P.text }}>🍽️ Mein Dashboard</div>
          <button onClick={handleLogout} style={{ padding: "8px 16px", background: "#FFF", color: P.text, borderRadius: 100, fontWeight: 600, fontSize: 13, border: "1.5px solid " + P.border, cursor: "pointer" }}>
            Abmelden
          </button>
        </div>

        {/* Status */}
        <div style={{ padding: "14px 18px", borderRadius: 14, marginBottom: 16, background: statusInfo.bg, color: statusInfo.color, fontSize: 13, fontWeight: 700 }}>
          {statusInfo.label}
        </div>

        {/* Premium-Banner */}
        {!restaurant.is_premium && (
          <div style={{ padding: "16px 20px", borderRadius: 14, marginBottom: 16, background: "linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)", color: "#FFF" }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>⭐ Premium freischalten</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12, lineHeight: 1.5 }}>
              Tagesangebote, WhatsApp-Button, Top-Platzierung und mehr. Nur 9,90€/Monat.
            </div>
            <button onClick={() => alert("Stripe-Integration kommt bald!")} style={{ padding: "10px 20px", background: "#FFF", color: P.accent, borderRadius: 100, fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
              Mehr erfahren
            </button>
          </div>
        )}

        {restaurant.is_premium && (
          <div style={{ padding: "14px 18px", borderRadius: 14, marginBottom: 16, background: "linear-gradient(135deg, #D4A373 0%, #BC6C25 100%)", color: "#FFF", fontSize: 13, fontWeight: 700 }}>
            ⭐ Premium aktiv — alle Features freigeschaltet
          </div>
        )}

        {/* Hauptkarte: Profil bearbeiten */}
        <div style={{ background: P.card, borderRadius: 20, padding: "24px 22px", border: "1.5px solid " + P.border, marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: P.text, marginBottom: 16 }}>📝 Stammdaten</div>

          {err && (
            <div style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 14, background: "#FFF0F3", fontSize: 13, fontWeight: 700, color: "#C4314B" }}>{err}</div>
          )}
          {msg && (
            <div style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 14, background: "#E8F5E9", fontSize: 13, fontWeight: 700, color: P.ok }}>{msg}</div>
          )}

          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={lb}>Firmenname *</label>
              <input style={is} value={restaurant.name || ""} onChange={(e) => update("name", e.target.value)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={lb}>Telefon *</label>
                <input style={is} value={restaurant.phone || ""} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div>
                <label style={lb}>WhatsApp {!restaurant.is_premium && <span style={{ color: P.warn, fontSize: 10 }}>(Premium)</span>}</label>
                <input style={{...is, opacity: restaurant.is_premium ? 1 : 0.5}} value={restaurant.whatsapp || ""} onChange={(e) => update("whatsapp", e.target.value)} disabled={!restaurant.is_premium} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
              <div>
                <label style={lb}>Straße</label>
                <input style={is} value={restaurant.street || ""} onChange={(e) => update("street", e.target.value)} />
              </div>
              <div>
                <label style={lb}>Hausnr.</label>
                <input style={is} value={restaurant.house_nr || ""} onChange={(e) => update("house_nr", e.target.value)} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
              <div>
                <label style={lb}>PLZ</label>
                <input style={is} value={restaurant.plz || ""} onChange={(e) => update("plz", e.target.value)} />
              </div>
              <div>
                <label style={lb}>Stadt *</label>
                <input style={is} value={restaurant.city || ""} onChange={(e) => update("city", e.target.value)} />
              </div>
            </div>

            <div>
              <label style={lb}>Website {!restaurant.is_premium && <span style={{ color: P.warn, fontSize: 10 }}>(Premium)</span>}</label>
              <input style={{...is, opacity: restaurant.is_premium ? 1 : 0.5}} placeholder="https://www.dein-lieferdienst.de" value={restaurant.website || ""} onChange={(e) => update("website", e.target.value)} disabled={!restaurant.is_premium} />
            </div>

            <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: 16, fontSize: 15, fontWeight: 700, background: P.accent, color: "#FFF", borderRadius: 100, border: "none", cursor: saving ? "wait" : "pointer", opacity: saving ? 0.6 : 1, marginTop: 6 }}>
              {saving ? "Wird gespeichert..." : "💾 Änderungen speichern"}
            </button>
          </div>
        </div>

        {/* Hinweis */}
        <div style={{ padding: "16px 20px", background: P.card, borderRadius: 14, border: "1px solid " + P.border, fontSize: 13, color: P.textM, lineHeight: 1.6 }}>
          <strong style={{ color: P.text }}>Bald verfügbar:</strong>
          <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
            <li>Öffnungszeiten & Ruhetage</li>
            <li>Liefergebiete & Lieferkosten</li>
            <li>Speisekarte (PDF) hochladen</li>
            <li>Logo hochladen</li>
            <li>Tagesangebote (Premium)</li>
          </ul>
          <div style={{ marginTop: 10, fontSize: 12 }}>
            Eingeloggt als <strong style={{ color: P.text }}>{user?.email}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
