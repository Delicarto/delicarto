import './globals.css'

export const metadata = {
  title: 'DeliCarto — Restaurants einfach digital.',
  description: 'Finde Speisekarten von Lieferdiensten in deiner Nähe und bestelle direkt — ohne Provision.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
