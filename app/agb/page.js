const P = { accent: "#2D6A4F", text: "#1B2A1D", textM: "#6B7E6F", border: "#D5CCBB", bg: "#F5F0E8", card: "#FFFDF8" };

export const metadata = {
  title: "AGB — DeliCarto",
  description: "Allgemeine Geschäftsbedingungen von DeliCarto.",
  alternates: { canonical: "https://delicarto.de/agb" },
};

export default function AgbPage() {
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
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 24 }}>Allgemeine Geschäftsbedingungen</h1>

        <div style={cardStyle}>
          <p style={headStyle}>§ 1 Geltungsbereich</p>
          <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen Patrick Mecklenburg, Husters Kamp 12, 49632 Essen (Oldb.) (nachfolgend „DeliCarto") und gewerblichen Kunden (Lieferdiensten/Restaurants), die einen Premium-Eintrag auf der Plattform delicarto.de buchen.</p>
        </div>

        <div style={cardStyle}>
          <p style={headStyle}>§ 2 Vertragsgegenstand</p>
          <p>DeliCarto stellt eine Online-Plattform bereit, auf der Lieferdienste ihre Speisekarten als PDF veröffentlichen können. Es werden zwei Eintragsarten angeboten:</p>
          <p style={{ marginTop: 12 }}><strong>Basis-Eintrag:</strong> Kostenlos. Umfasst Restaurantname, Adresse, Kontaktdaten und PDF-Speisekarte.</p>
          <p style={{ marginTop: 12 }}><strong>Premium-Eintrag:</strong> Kostenpflichtig. Zusätzliche Funktionen wie Hervorhebung, erweiterte Suchplatzierung und Tagesangebote.</p>
        </div>

        <div style={cardStyle}>
          <p style={headStyle}>§ 3 Vertragsschluss</p>
          <p>Der Vertrag kommt durch die Registrierung des Kunden auf delicarto.de und die Bestätigung der Buchung durch DeliCarto zustande. Der Kunde versichert, zur geschäftlichen Nutzung berechtigt zu sein.</p>
        </div>

        <div style={cardStyle}>
          <p style={headStyle}>§ 4 Preise und Zahlung</p>
          <p>Die aktuellen Preise für Premium-Einträge sind auf delicarto.de einsehbar. Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer. Die Abrechnung erfolgt per Rechnung mit einem Zahlungsziel von 14 Tagen.</p>
        </div>

        <div style={cardStyle}>
          <p style={headStyle}>§ 5 Pflichten des Kunden</p>
          <p>Der Kunde ist verpflichtet, korrekte und aktuelle Daten anzugeben (insbesondere Adresse, Lieferzeiten, Speisekartenpreise). Der Kunde stellt sicher, dass die hochgeladenen Inhalte (Speisekarten, Bilder, Texte) frei von Rechten Dritter sind.</p>
        </div>

        <div style={cardStyle}>
          <p style={headStyle}>§ 6 Laufzeit und Kündigung</p>
          <p>Premium-Verträge laufen jeweils ein Jahr ab Buchung und verlängern sich automatisch um ein weiteres Jahr, wenn nicht 30 Tage vor Ablauf in Textform gekündigt wird. Eine Kündigung per E-Mail an info@delicarto.de ist ausreichend.</p>
        </div>

        <div style={cardStyle}>
          <p style={headStyle}>§ 7 Haftung</p>
          <p>DeliCarto haftet nur für Vorsatz und grobe Fahrlässigkeit. Eine Haftung für mittelbare Schäden, entgangenen Gewinn oder Folgeschäden ist ausgeschlossen, soweit gesetzlich zulässig.</p>
        </div>

        <div style={cardStyle}>
          <p style={headStyle}>§ 8 Schlussbestimmungen</p>
          <p>Es gilt deutsches Recht. Gerichtsstand für Kaufleute ist der Sitz von DeliCarto. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
        </div>
      </div>
    </div>
  );
}
