import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cosavu OAuth",
  description: "Secure authentication for Cosavu AI services",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
