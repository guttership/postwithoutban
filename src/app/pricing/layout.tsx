import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - PostWithoutBan",
  description: "Lifetime access to PostWithoutBan. One payment, no subscription. Generate Reddit strategies that survive moderation.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    url: "/pricing",
    title: "Pricing - PostWithoutBan",
    description: "Lifetime access to PostWithoutBan. One payment, no subscription. Generate Reddit strategies that survive moderation.",
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
    title: "Pricing - PostWithoutBan",
    description: "Lifetime access to PostWithoutBan. One payment, no subscription. Generate Reddit strategies that survive moderation.",
    images: ["/images/og-image.png"],
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
