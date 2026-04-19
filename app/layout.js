import './globals.css'

export const metadata = {
  title: 'DeliCarto — Speisekarten von Lieferdiensten in deiner Nähe',
  description: 'Finde Speisekarten von Lieferdiensten in deiner Nähe und bestelle direkt — ohne Provision, ohne Umwege. Pizza, Kebab, Burger und mehr.',
  keywords: 'Lieferdienst, Speisekarte, bestellen, Pizza, Kebab, Burger, Lieferservice, Essen bestellen, Lieferdienst finden, DeliCarto',
  authors: [{ name: 'DeliCarto' }],
  openGraph: {
    title: 'DeliCarto — Speisekarten von Lieferdiensten in deiner Nähe',
    description: 'Finde Speisekarten von Lieferdiensten in deiner Nähe und bestelle direkt — ohne Provision.',
    url: 'https://delicarto.de',
    siteName: 'DeliCarto',
    locale: 'de_DE',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'DeliCarto — Speisekarten von Lieferdiensten',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeliCarto — Speisekarten von Lieferdiensten in deiner Nähe',
    description: 'Finde Speisekarten von Lieferdiensten in deiner Nähe und bestelle direkt — ohne Provision.',
    images: ['https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=1200&q=80'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://delicarto.de',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2D6A4F" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "DeliCarto",
              "url": "https://delicarto.de",
              "description": "Finde Speisekarten von Lieferdiensten in deiner Nähe und bestelle direkt — ohne Provision.",
              "applicationCategory": "FoodService",
              "operatingSystem": "Web",
              "author": {
                "@type": "Person",
                "name": "Patrick Mecklenburg"
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Husters Kamp 12",
                "addressLocality": "Essen (Oldb.)",
                "postalCode": "49632",
                "addressCountry": "DE"
              }
            })
          }}
        />
      </head>
      <body>{children}<script dangerouslySetInnerHTML={{__html:`if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js")}`}}/></body>
    </html>
  )
}
