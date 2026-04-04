import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VGC Pro Builder",
  description: "Pokemon VGC dashboard for team building, matchup prep, and meta analysis."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
