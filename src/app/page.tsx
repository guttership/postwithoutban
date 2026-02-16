import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";

export const metadata: Metadata = {
  title: "PostWithoutBan - Reddit posts that survive moderation",
  description: "Generate Reddit strategies for SaaS founders, find the right subreddits, and craft posts that survive moderation.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    title: "PostWithoutBan - Reddit posts that survive moderation",
    description: "Generate Reddit strategies for SaaS founders, find the right subreddits, and craft posts that survive moderation.",
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
    title: "PostWithoutBan - Reddit posts that survive moderation",
    description: "Generate Reddit strategies for SaaS founders, find the right subreddits, and craft posts that survive moderation.",
    images: ["/images/og-image.png"],
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <LandingPage />
    </>
  );
}
