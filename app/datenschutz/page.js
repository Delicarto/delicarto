const P = {
  accent: "#2D6A4F",
  text: "#1B2A1D",
  textM: "#6B7E6F",
  border: "#D5CCBB",
  bg: "#F5F0E8",
  card: "#FFFDF8",
};

export const metadata = {
  title: "Datenschutzerklärung — DeliCarto",
  description: "Datenschutzerklärung von DeliCarto. Wie wir mit deinen Daten umgehen, gemäß DSGVO.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://delicarto.de/datenschutz" },
};

export default function DatenschutzPage() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", background: P.bg, color: P.text, minHeight: "100vh" }}>
      <nav style={{ background: "rgba(245,240,232,0.92)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${P.border}`, padding: "14px 24px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/" style={{ fontSize: 20, fontWeight: 900, color: P.text, textDecoration: "none", letterSpacing: "-0.5px" }}>
            <span style={{ color: P.textM }}>Deli</span>carto
          </a>
          <a href="/" style={{ background: P.card, border: `1.5px solid ${P.border}`, borderRadius: 100, padding: "8px 18px", fontSize: 13, fontWeight: 700, color: P.textM, textDecoration: "none" }}>
            ← Zur Startseite
          </a>
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 24, letterSpacing: "-0.5px" }}>Datenschutzerklärung</h1>

        <div style={{ background: P.card, borderRadius: 18, padding: "28px 24px", border: `1.5px solid ${P.border}`, marginBottom: 24, fontSize: 15, lineHeight: 1.8 }}>
          <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>1. Datenschutz auf einen Blick</p>
          <p><strong>Allgemeine Hinweise:</strong> Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>
          <p style={{ marginTop: 12 }}><strong>Datenerfassung auf dieser Website:</strong> Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber: Patrick Mecklenburg, Husters Kamp 12, 49632 Essen (Oldb.), E-Mail: info@delicarto.de</p>
        </div>

        <div style={{ background: P.card, borderRadius: 18, padding: "28px 24px", border: `1.5px solid ${P.border}`, marginBottom: 24, fontSize: 15, lineHeight: 1.8 }}>
          <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>2. Hosting</p>
          <p>Diese Website wird bei Vercel Inc. gehostet. Beim Besuch der Website erfasst der Server automatisch Informationen in sogenannten Server-Log-Dateien wie den Browsertyp, das Betriebssystem, die Referrer URL, die IP-Adresse, den Zeitpunkt der Serveranfrage und ähnliches. Diese Daten sind nicht bestimmten Personen zuordenbar und werden nicht mit anderen Datenquellen zusammengeführt.</p>
        </div>

        <div style={{ background: P.card, borderRadius: 18, padding: "28px 24px", border: `1.5px solid ${P.border}`, marginBottom: 24, fontSize: 15, lineHeight: 1.8 }}>
          <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>3. Allgemeine Hinweise und Pflichtinformationen</p>
          <p><strong>Datenschutz:</strong> Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
          <p style={{ marginTop: 12 }}><strong>Hinweis zur verantwortlichen Stelle:</strong><br />Patrick Mecklenburg<br />Husters Kamp 12<br />49632 Essen (Oldb.)<br />Telefon: 05434-8071665<br />E-Mail: info@delicarto.de</p>
        </div>

        <div style={{ background: P.card, borderRadius: 18, padding: "28px 24px", border: `1.5px solid ${P.border}`, marginBottom: 24, fontSize: 15, lineHeight: 1.8 }}>
          <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>4. Datenerfassung auf dieser Website</p>
          <p><strong>Registrierung:</strong> Wenn Sie sich auf unserer Website registrieren, speichern wir Ihre E-Mail-Adresse und Ihren Namen. Diese Daten werden benötigt, um Ihnen den Zugang zu Ihrem Konto zu ermöglichen und Ihren Lieferdienst-Eintrag zu verwalten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.</p>
          <p style={{ marginTop: 12 }}><strong>PDF-Upload:</strong> Wenn Sie eine Speisekarte hochladen, wird die Datei auf Servern von Supabase (EU-Rechenzentrum Frankfurt) gespeichert. Die Datei ist öffentlich abrufbar, damit Kunden Ihre Speisekarte ansehen können.</p>
          <p style={{ marginTop: 12 }}><strong>Cookies:</strong> Diese Website verwendet technisch notwendige Cookies zur Sitzungsverwaltung. Darüber hinaus werden keine Tracking-Cookies oder Analyse-Tools eingesetzt.</p>
        </div>

        <div style={{ background: P.card, borderRadius: 18, padding: "28px 24px", border: `1.5px solid ${P.border}`, marginBottom: 24, fontSize: 15, lineHeight: 1.8 }}>
          <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>5. Ihre Rechte</p>
          <p>Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden.</p>
          <p style={{ marginTop: 12 }}>Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format aushändigen zu lassen.</p>
        </div>

        <div style={{ background: P.card, borderRadius: 18, padding: "28px 24px", border: `1.5px solid ${P.border}`, fontSize: 15, lineHeight: 1.8 }}>
          <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>6. Datenverarbeitung durch Drittanbieter</p>
          <p><strong>Supabase:</strong> Für die Datenhaltung nutzen wir Supabase mit Servern in Frankfurt (EU). Supabase verarbeitet Daten gemäß der DSGVO.</p>
          <p style={{ marginTop: 12 }}><strong>Vercel:</strong> Das Hosting erfolgt über Vercel Inc. mit Edge-Servern weltweit. Vercel erfüllt die Anforderungen der DSGVO und ist unter dem EU-US Data Privacy Framework zertifiziert.</p>
          <p style={{ marginTop: 12 }}><strong>Resend:</strong> Für den Versand von E-Mails (z.B. Bestätigungs-Mails) nutzen wir Resend mit Servern in Irland (EU). Es werden nur die für den Mailversand notwendigen Daten verarbeitet.</p>
        </div>
      </div>
    </div>
  );
}
