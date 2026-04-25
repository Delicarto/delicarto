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

export default function ResetPasswordPage() {
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase erkennt automatisch den Recovery-Token aus der URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
      }
    });

    // Falls Token schon verarbeitet wurde
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    setErr("");
    if (pass.length < 6) return setErr("Passwort muss mindestens 6 Zeichen haben");
    if (pass !== pass2) return setErr("Passwörter stimmen nicht überein");

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pass });
      if (error) throw error;
      setSuccess(true);
    } catch (e) {
      setErr(e.message || "Fehler beim Aktualisieren");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ fontFamily: "system-ui", background: P.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: P.card, borderRadius: 24, padding: "40px 32px", maxWidth: 460, width: "100%", border: "1.5px solid " + P.border, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: P.text, marginBottom: 12 }}>Passwort geändert!</h1>
          <p style={{ fontSize: 15, color: P.textM, lineHeight: 1.6, marginBottom: 24 }}>
            Dein neues Passwort ist jetzt aktiv. Du kannst dich damit einloggen.
          </p>
          <a href="/login" style={{ display: "inline-block", padding: "14px 32px", background: P.accent, color: "#FFF", borderRadius: 100, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Zum Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui", background: P.bg, minHeight: "100vh", padding: "20px 16px 40px" }}>
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24, paddingTop: 12 }}>
          <a href="/login" style={{ fontSize: 13, color: P.textM, textDecoration: "none", fontWeight: 600 }}>← Zurück zum Login</a>
        </div>
        <div style={{ background: P.card, borderRadius: 24, padding: "32px 28px", border: "1.5px solid " + P.border }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: P.text, marginBottom: 6 }}>🔑 Neues Passwort</div>
            <p style={{ fontSize: 13, color: P.textM, lineHeight: 1.5 }}>Wähle ein neues, sicheres Passwort.</p>
          </div>
          {err && (
            <div style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 16, background: "#FFF0F3", fontSize: 13, fontWeight: 700, color: "#C4314B" }}>❌ {err}</div>
          )}
          {!ready && (
            <div style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 16, background: "#FFF5EB", fontSize: 13, color: "#BC6C25", lineHeight: 1.5 }}>
              ⏳ Verifiziere Reset-Link... <br/>Falls das hängt, klick erneut den Link aus der E-Mail.
            </div>
          )}
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={lb}>Neues Passwort *</label>
              <input style={is} type="password" placeholder="min. 6 Zeichen" value={pass} onChange={(e) => setPass(e.target.value)} disabled={!ready} />
            </div>
            <div>
              <label style={lb}>Passwort wiederholen *</label>
              <input style={is} type="password" placeholder="••••••" value={pass2} onChange={(e) => setPass2(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleReset(); }} disabled={!ready} />
            </div>
            <button onClick={handleReset} disabled={loading || !ready} style={{ width: "100%", padding: 16, fontSize: 15, fontWeight: 700, background: P.accent, color: "#FFF", borderRadius: 100, border: "none", cursor: (loading || !ready) ? "wait" : "pointer", opacity: (loading || !ready) ? 0.6 : 1, marginTop: 8 }}>
              {loading ? "Wird gespeichert..." : "Passwort speichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
