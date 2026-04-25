const P = {
  accent: "#2D6A4F",
  text: "#1B2A1D",
  textM: "#6B7E6F",
  border: "#D5CCBB",
  bg: "#F5F0E8",
  card: "#FFFDF8",
};

export const metadata = {
  title: "Impressum — DeliCarto",
  description: "Impressum von DeliCarto. Anbieterkennzeichnung gemäß § 5 TMG.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://delicarto.de/impressum" },
};

export default function ImpressumPage() {
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
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 24, letterSpacing: "-0.5px" }}>Impressum</h1>

        <div style={{ background: P.card, borderRadius: 18, padding: "28px 24px", border: `1.5px solid ${P.border}`, marginBottom: 24, fontSize: 15, lineHeight: 1.8 }}>
          <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Angaben gemäß § 5 TMG</p>
          <p>Patrick Mecklenburg<br />Husters Kamp 12<br />49632 Essen (Oldb.)</p>
          <p style={{ marginTop: 16 }}><strong>Kontakt:</strong><br />Telefon: 05434-8071665<br />E-Mail: info@delicarto.de</p>
          <p style={{ marginTop: 16 }}><strong>Umsatzsteuer-ID:</strong><br />Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />DE117085508</p>
        </div>

        <div style={{ background: P.card, borderRadius: 18, padding: "28px 24px", border: `1.5px solid ${P.border}`, marginBottom: 24, fontSize: 15, lineHeight: 1.8 }}>
          <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>Haftung für Inhalte</p>
          <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
          <p style={{ marginTop: 12 }}>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
        </div>

        <div style={{ background: P.card, borderRadius: 18, padding: "28px 24px", border: `1.5px solid ${P.border}`, marginBottom: 24, fontSize: 15, lineHeight: 1.8 }}>
          <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>Haftung für Links</p>
          <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</p>
        </div>

        <div style={{ background: P.card, borderRadius: 18, padding: "28px 24px", border: `1.5px solid ${P.border}`, fontSize: 15, lineHeight: 1.8 }}>
          <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>Urheberrecht</p>
          <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke
