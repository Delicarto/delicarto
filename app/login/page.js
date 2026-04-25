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

export default function LoginPage() {
  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAdminAndRedirect(session.user.id);
      }
    });
  }, []);

  const checkAdminAndRedirect = async (userId) => {
    const { data } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) {
      window.location.href = "/admin";
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleLogin = async () => {
    setErr("");
    if (!email.trim()) return setErr("Bitte E-Mail eingeben");
    if (!pass) return setErr("Bitte Passwort eingeben");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: pass,
      });
      if (error) {
        if (error.message?.includes("Invalid login credentials")) {
          throw new Error("E-Mail oder Passwort ist falsch");
        }
        if (error.message?.includes("Email not confirmed")) {
          throw new Error("Bitte bestätige zuerst deine E-Mail-Adresse. Schau auch im Spam-Ordner.");
        }
        throw error;
      }
      if (!data.user) throw new Error("Login fehlgeschlagen");
      checkAdminAndRedirect(data.user.id);
    } catch (e) {
      setErr(e.message || "Login fehlgeschlagen");
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setErr("");
    if (!resetEmail.trim()) return setErr("Bitte E-Mail eingeben");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim().toLowerCase(),
        { redirectTo: typeof window !== "undefined" ? window.location.origin + "/reset-password" : undefined }
      );
      if (error) throw error;
      setView("reset_sent");
    } catch (e) {
      setErr(e.message || "Fehler beim Senden");
    }
    setLoading(false);
  };

  if (view === "reset_sent") {
    return (
      <div style={{ fontFamily: "system-ui", background: P.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: P.card, borderRadius: 24, padding: "40px 32px", maxWidth: 460, width: "100%", border: "1.5px solid " + P.border, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: P.text, marginBottom: 12 }}>E-Mail verschickt!</h1>
          <p style={{ fontSize: 15, color: P.textM, lineHeight: 1.6, marginBottom: 24 }}>
            Wir haben dir einen Link zum Zurücksetzen deines Passworts an <strong style={{ color: P.text }}>{resetEmail}</strong> geschickt.
            <br /><br />
            Bitte schau auch im Spam-Ordner nach.
          </p>
          <button onClick={() => { setView("login"); setResetEmail(""); setErr(""); }} style={{ padding: "14px 32px", background: P.accent, color: "#FFF", borderRadius: 100, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
            Zurück zum Login
          </button>
        </div>
      </div>
    );
  }

  if (view === "reset") {
    return (
      <div style={{ fontFamily: "system-ui", background: P.bg, minHeight: "100vh", padding: "20px 16px 40px" }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 24, paddingTop: 12 }}>
            <button onClick={() => { setView("login"); setErr(""); }} style={{ background: "none", border: "none", fontSize: 13, color: P.textM, cursor: "pointer", fontWeight: 600 }}>
              ← Zurück zum Login
            </button>
          </div>
          <div style={{ background: P.card, borderRadius: 24, padding: "32px 28px", border: "1.5px solid " + P.border }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: P.text, marginBottom: 6 }}>🔑 Passwort zurücksetzen</div>
              <p style={{ fontSize: 13, color: P.textM, lineHeight: 1.5 }}>Gib deine E-Mail ein und wir schicken dir einen Link zum Zurücksetzen.</p>
            </div>
            {err && (
              <div style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 16, background: "#FFF0F3", fontSize: 13, fontWeight: 700, color: "#C4314B" }}>❌ {err}</div>
            )}
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={lb}>E-Mail</label>
                <input style={is} type="email" placeholder="info@dein-lieferdienst.de" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handlePasswordReset(); }} />
              </div>
              <button onClick={handlePasswordReset} disabled={loading} style={{ width: "100%", padding: 16, fontSize: 15, fontWeight: 700, background: P.accent, color: "#FFF", borderRadius: 100, border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Wird gesendet..." : "Link zum Zurücksetzen senden"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui", background: P.bg, minHeight: "100vh", padding: "20px 16px 40px" }}>
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24, paddingTop: 12 }}>
          <a href="/" style={{ fontSize: 13, color: P.textM, textDecoration: "none", fontWeight: 600 }}>← Zurück zur Startseite</a>
        </div>
        <div style={{ background: P.card, borderRadius: 24, padding: "32px 28px", border: "1.5px solid " + P.border }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: P.text, marginBottom: 6 }}>🔐 Login</div>
            <p style={{ fontSize: 13, color: P.textM, lineHeight: 1.5 }}>Logge dich ein und verwalte dein Profil</p>
          </div>
          {err && (
            <div style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 16, background: "#FFF0F3", fontSize: 13, fontWeight: 700, color: "#C4314B" }}>❌ {err}</div>
          )}
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={lb}>E-Mail</label>
              <input style={is} type="email" placeholder="info@dein-lieferdienst.de" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }} />
            </div>
            <div>
              <label style={lb}>Passwort</label>
              <input style={is} type="password" placeholder="••••••" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }} />
              <button onClick={() => { setView("reset"); setErr(""); setResetEmail(email); }} style={{ background: "none", border: "none", fontSize: 12, color: P.accent, fontWeight: 600, cursor: "pointer", marginTop: 8, padding: 0 }}>
                Passwort vergessen?
              </button>
            </div>
            <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: 16, fontSize: 15, fontWeight: 700, background: P.accent, color: "#FFF", borderRadius: 100, border: "none", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1, marginTop: 8 }}>
              {loading ? "Wird eingeloggt..." : "Einloggen"}
            </button>
            <div style={{ textAlign: "center", fontSize: 13, color: P.textM, marginTop: 8 }}>
              Noch kein Konto? <a href="/register" style={{ color: P.accent, fontWeight: 700 }}>Hier kostenlos anmelden</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
