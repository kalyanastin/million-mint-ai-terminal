import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MILLION MINT | Sovereign Economic Layer",
  description:
    "We are deploying the first high-velocity, economy-native virtual universe—where ownership is absolute and value is programmable.",
  metadataBase: new URL("https://millionmint.space"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Million Mint",
    "MMINT",
    "Sovereign Economic Layer",
    "Synthetic Worlds",
    "Programmable Economy",
    "Virtual Universe",
    "Blockchain",
    "Kalyan Chowdary",
    "Decentralized Civilization"
  ],
  openGraph: {
    title: "MILLION MINT | Sovereign Economic Layer",
    description: "We are deploying the first high-velocity, economy-native virtual universe—where ownership is absolute and value is programmable.",
    url: "https://millionmint.space",
    siteName: "Million Mint",
    images: [
      {
        url: "/next.svg", // Fallback placeholder image
        width: 800,
        height: 600,
        alt: "Million Mint AI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MILLION MINT | Sovereign Economic Layer",
    description: "We are deploying the first high-velocity, economy-native virtual universe—where ownership is absolute and value is programmable.",
    images: ["/next.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://millionmint.space/#website",
        "url": "https://millionmint.space",
        "name": "Million Mint",
        "description": "Sovereign Economic Layer & Decentralized Digital Civilization"
      },
      {
        "@type": "Organization",
        "@id": "https://millionmint.space/#organization",
        "name": "Million Mint",
        "url": "https://millionmint.space",
        "logo": "https://millionmint.space/next.svg",
        "founder": {
          "@type": "Person",
          "@id": "https://millionmint.space/#person",
          "name": "Kalyan Chowdary",
          "jobTitle": "Founder",
          "sameAs": [
            "https://github.com/kalyanastin",
            "https://x.com/kalyanchow369",
            "https://t.me/millionmint"
          ]
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}

