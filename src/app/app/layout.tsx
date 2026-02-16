import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "App - PostWithoutBan",
  description: "Generate a Reddit strategy and post draft.",
  alternates: {
    canonical: "/app",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
