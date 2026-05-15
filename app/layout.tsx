import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ThermoWear – מה ללבוש מחר?",
  description: "המלצת לבוש אישית לפי מזג האוויר והפיזיולוגיה שלך",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#0d1b2e" }}>{children}</body>
    </html>
  );
}
