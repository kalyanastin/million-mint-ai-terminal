import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MILLION MINT | Sovereign Economic Layer",
  description:
    "We are deploying the first high-velocity, economy-native virtual universe—where ownership is absolute and value is programmable.",
  keywords: [
    "Million Mint",
    "Sovereign Economic Layer",
    "Synthetic Worlds",
    "Programmable Economy",
    "Virtual Universe",
    "Blockchain"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}
