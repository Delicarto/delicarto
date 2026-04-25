const P = { accent: "#2D6A4F", text: "#1B2A1D", textM: "#6B7E6F", border: "#D5CCBB", bg: "#F5F0E8", card: "#FFFDF8" };

export const metadata = {
  title: "Datenschutzerklärung — DeliCarto",
  description: "Datenschutzerklärung von DeliCarto. Wie wir mit deinen Daten umgehen, gemäß DSGVO.",
  alternates: { canonical: "https://delicarto.de/datenschutz" },
};

export default function DatenschutzPage() {
  const navStyle = { background: "rgba(245,240,232,0.92)", borderBottom: `1px solid ${P.border}`, padding: "14px 24px", position: "sticky", top: 0, zIndex: 10 };
  const cardStyle = { background: P.card, borderRadius: 18, padding: "28px 24px", border: `1.5px solid ${P.border}`, marginBottom: 24, fontSize: 15, lineHeight: 1.8 };
  const headStyle = { fontWeight: 700, fontSize: 17, marginBottom: 12 };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: P.bg, color: P.text, minHeight: "100vh" }}>
      <nav style={navStyle}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/" style={{ fontSize: 20, fontWeight: 900, color: P.text, textDecoration: "none" }}>
            <span style={{ color: P.textM }}>Deli</span>carto
          </a>
          <a href="/" style={{ background: P.card, border: `1.5px solid ${P.border}`, borderRadius: 100, padding: "8px 18px", fontSize: 13, fontWeight: 700, color: P.textM, textDecoration: "none" }}>← Zur Startseite</a>
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 24 }}>Datenschutzerklärung</h1>

        <div style={cardStyle}>
          <p style={headStyle}>1. Datenschutz auf einen Blick</p>
          <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Verantwortlicher: Patrick Mecklenburg, Husters Kamp 12, 49632 Essen (Oldb.), info@delicarto.de</p>
        </div>

        <div style={cardStyle}>
          <p style={headStyle}>2. Hosting</p>
          <p>Diese Website wird bei Vercel Inc. gehostet. Beim Besuch werden Server-Log-Daten wie Browsertyp, Betriebssystem, IP-Adresse und Zeitpunkt der Anfrage erfasst.</p>
        </div>

        <div style={cardStyle}>
          <p style={headStyle}>3. Verantwortliche Stelle</p>
          <p>Patrick Mecklenburg<br />Husters Kamp 12<br />49632 Essen (Oldb.)<br />Telefon: 05434-8071665<br />E-Mail: info@delicarto.de</p>
        </div>

        <div style={cardStyle}>
          <p style={headStyle}>4. Datenerfassung</p>
          <p><strong>Registrierung:</strong> Bei der Registrierung speichern wir E-Mail und Name. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>
          <p style={{ marginTop: 12 }}><strong>PDF-Upload:</strong> Hochgeladene Speisekarten werden auf Supabase-Servern in Frankfurt gespeichert und sind öffentlich abrufbar.</p>
          <p style={{ marginTop: 12 }}><strong>Cookies:</strong> Es werden nur technisch notwendige Cookies zur Sitzungsverwaltung verwendet.</p>
        </div>

        <div style={cardStyle}>
          <p style={headStyle}>5. Ihre Rechte</p>
          <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit. Anfragen richten Sie bitte an info@delicarto.de</p>
        </div>

        <div style={cardStyle}>
          <p style={headStyle}>6. Drittanbieter</p>
          <p><strong>Supabase</strong> (Frankfurt, EU): Datenhaltung gemäß DSGVO.</p>
          <p style={{ marginTop: 12 }}><strong>Vercel Inc.</strong>: Hosting unter EU-US Data Privacy Framework.</p>
          <p style={{ marginTop: 12 }}><strong>Resend</strong> (Irland, EU): E-Mail-Versand für Bestätigungs-Mails.</p>
        </div>
      </div>
    </div>
  );
}
