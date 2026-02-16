import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { GeolocationDetector } from "@/components/GeolocationDetector";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PostWithoutBan - Reddit Marketing Strategy for SaaS | No Ban Guarantee",
  description: "Generate authentic Reddit strategies for your SaaS without getting banned. AI-powered analysis of your product to find the right subreddits and craft natural posts.",
  keywords: "Reddit marketing, SaaS growth, Reddit strategy, indie hackers, startup marketing, no ban",
  authors: [{ name: "design-moi un mouton", url: "https://dmum.eu" }],
  creator: "PostWithoutBan",
  metadataBase: new URL("https://postwithoutban.com"),
  robots: {
    index: true,
    follow: true,
    googleBot: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://postwithoutban.com",
    title: "PostWithoutBan - Reddit Marketing for SaaS",
    description: "Generate Reddit strategies that survive moderation",
    siteName: "PostWithoutBan",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "PostWithoutBan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PostWithoutBan",
    description: "Reddit strategies that survive moderation",
    creator: "@postwithoutban",
    images: ["/images/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {/* JSON-LD Schema for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "PostWithoutBan",
              "description": "AI-powered Reddit strategy generator for SaaS founders",
              "url": "https://postwithoutban.com",
              "applicationCategory": "BusinessApplication",
              "offers": {
                "@type": "Offer",
                "price": "99",
                "priceCurrency": "EUR",
                "priceValidUntil": "2027-12-31",
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "145"
              },
              "author": {
                "@type": "Organization",
                "name": "design-moi un mouton",
                "url": "https://dmum.eu"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <GeolocationDetector />
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
