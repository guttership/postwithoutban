import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - PostWithoutBan",
  description: "Terms of service for PostWithoutBan.",
  alternates: {
    canonical: "/legal/terms",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
