export const metadata = {
  title: "Mein Hub — Selbstständigkeit",
  description: "Termine, Umsatz, Team & Bewerber an einem Ort.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, background: "#0E1013" }}>{children}</body>
    </html>
  );
}
