"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

const P = {
  accent: "#2D6A4F",
  mint: "#40916C",
  warm: "#D4A373",
  text: "#1B2A1D",
  textM: "#6B7E6F",
  border: "#D5CCBB",
  bg: "#F5F0E8",
  card: "#FFFDF8",
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

export default function RegisterPage() {
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [agb, setAgb] = useState(false);

  const handleRegister = async () => {
    setErr("");

    if (!companyName.trim()) return setErr("❌ Bitte Firmennamen angeben");
    if (!email.trim()) return setErr("❌ Bitte E-Mail angeben");
    if (!phone.trim()) return setErr("❌ Bitte Telefonnummer angeben");
    if (!city.trim()) return setErr("❌ Bitte Stadt angeben");
    if (pass.length < 6) return setErr("❌ Passwort muss mindestens 6 Zeichen haben");
    if (pass !== pass2) return setErr("❌ Passwörter stimmen nicht überein");
    if (!agb) return setErr("❌ Bitte AGB akzeptieren");

    setLoading(true);

    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: pass,
      });

      if (authErr) throw authErr;
      if (!authData.user) throw new Error("Account konnte nicht erstellt werden");

      const { error: insertErr } = await supabase.from("restaurants").insert({
        owner_id: authData.user.id,
        name: companyName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        approval_status: "pending",
        is_premium: false,
        submitted_at: new Date().toISOString(),
      });

      if (insertErr) throw insertErr;

      setStep("success");
    } catch (e) {
      if (e.message?.includes("already registered")) {
        setErr("❌ Diese E-Mail ist bereits registriert. Bitte einloggen.");
      } else {
        setErr("❌ " + (e.message || "Etwas ist schiefgelaufen"));
      }
    }

    setLoading(false);
  };

  if (step === "success") {
    return (
      <div style={{ fontFamily: "system-ui", background: P.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: P.card, borderRadius: 24, padding: "40px 32px", maxWidth: 480, width: "100%", border: `1.5px solid ${P.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: P.text, marginBottom: 12 }}>Fast geschafft!</h1>
          <p style={{ fontSize: 15, color: P.textM, lineHeight: 1.6, marginBottom: 24 }}>
            Wir haben dir eine <strong>Bestätigungs-E-Mail</strong> an <strong style={{ color: P.text }}>{email}</strong> geschickt.
            <br /><br />
            Bitte klicke auf den Link in der E-Mail, um dein Konto zu aktivieren. Danach kannst du dich einloggen und dein Profil vervollständigen.
          </p>
          <div style={{ padding: "14px 16px", borderRadius: 12, background: "#FFF5EB", border: "1.5px solid #FFDDB5", fontSize: 13, color: "#BC6C25", marginBottom: 24, textAlign: "left" }}>
            <strong>📧 Keine E-Mail erhalten?</strong>
            <br />
            Schau im Spam-Ordner nach. Falls trotzdem nichts ankommt, melde dich bei uns: <a href="mailto:info@delicarto.de" style={{ color: P.accent }}>info@delicarto.de</a>
          </div>
          <a href="/login" style={{ display: "inline-block", padding: "14px 32px", background: P.accent, color: "#FFF", borderRadius: 100, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Zum Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui", background: P.bg, minHeight: "100vh", padding: "20px 16px 40px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24, paddingTop: 12 }}>
          <a href="/" style={{ fontSize: 13, color: P.textM, textDecoration: "none", fontWeight: 600 }}>
            ← Zurück zur Startseite
          </a>
        </div>

        <div style={{ background: P.card, borderRadius: 24, padding: "32px 28px", border: `1.5px solid ${P.border}` }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: P.text, marginBottom: 6 }}>🍽️ Lieferdienst anmelden</div>
            <p style={{ fontSize: 13, color: P.textM, lineHeight: 1.5 }}>
              Kostenlos auf DeliCarto eintragen lassen.<br />Dauert nur 1 Minute.
            </p>
          </div>

          {err && (
            <div style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 16, background: "#FFF0F3", fontSize: 13, fontWeight: 700, color: "#C4314B" }}>
              {err}
            </div>
          )}

          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={lb}>Firmenname / Lieferdienst *</label>
              <input style={is} placeholder="z.B. Hot Spicy Pizza" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={lb}>Telefon *</label>
                <input style={is} placeholder="05434-1234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label style={lb}>Stadt *</label>
                <input style={is} placeholder="Essen" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${P.border}`, paddingTop: 14, marginTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: P.accent, marginBottom: 12 }}>🔐 Login-Daten</div>

              <div style={{ marginBottom: 12 }}>
                <label style={lb}>E-Mail *</label>
                <input style={is} type="email" placeholder="info@dein-lieferdienst.de" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={lb}>Passwort *</label>
                  <input style={is} type="password" placeholder="min. 6 Zeichen" value={pass} onChange={(e) => setPass(e.target.value)} />
                </div>
                <div>
                  <label style={lb}>Passwort wiederholen *</label>
                  <input style={is} type="password" placeholder="••••••" value={pass2} onChange={(e) => setPass2(e.target.value)} />
                </div>
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: P.textM, lineHeight: 1.5, marginTop: 4 }}>
              <input type="checkbox" checked={agb} onChange={(e) => setAgb(e.target.checked)} style={{ marginTop: 2, cursor: "pointer", flexShrink: 0 }} />
              <span>
                Ich akzeptiere die <a href="/agb" target="_blank" style={{ color: P.accent, fontWeight: 600 }}>AGB</a> und <a href="/datenschutz" target="_blank" style={{ color: P.accent, fontWeight: 600 }}>Datenschutzerklärung</a>
              </span>
            </label>

            <button onClick={handleRegister} disabled={loading} style={{ width: "100%", padding: 16, fontSize: 15, fontWeight: 700, background: P.accent, color: "#FFF", borderRadius: 100, border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1, marginTop: 8 }}>
              {loading ? "Wird erstellt..." : "✅ Kostenlos anmelden"}
            </button>

            <div style={{ textAlign: "center", fontSize: 13, color: P.textM, marginTop: 8 }}>
              Bereits angemeldet? <a href="/login" style={{ color: P.accent, fontWeight: 700 }}>Hier einloggen</a>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, padding: "16px 20px", background: P.card, borderRadius: 14, border: `1px solid ${P.border}`, fontSize: 13, color: P.textM, lineHeight: 1.6 }}>
          <strong style={{ color: P.text }}>So geht's weiter:</strong>
          <ol style={{ margin: "8px 0 0 20px", padding: 0 }}>
            <li>E-Mail bestätigen (kommt sofort)</li>
            <li>Einloggen und Profil ausfüllen (Adresse, Öffnungszeiten, Speisekarte)</li>
            <li>Wir prüfen kurz und schalten dich frei (24h)</li>
            <li>Du erscheinst auf DeliCarto 🎉</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
