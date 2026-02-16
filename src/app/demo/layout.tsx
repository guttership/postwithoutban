import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Demo - PostWithoutBan",
  description: "Try the Reddit analysis demo. Get subreddit recommendations and a post draft that follows moderation rules.",
  alternates: {
    canonical: "/demo",
  },
  openGraph: {
    url: "/demo",
    title: "Free Demo - PostWithoutBan",
    description: "Try the Reddit analysis demo. Get subreddit recommendations and a post draft that follows moderation rules.",
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
    title: "Free Demo - PostWithoutBan",
    description: "Try the Reddit analysis demo. Get subreddit recommendations and a post draft that follows moderation rules.",
    images: ["/images/og-image.png"],
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
