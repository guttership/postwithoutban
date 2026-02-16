import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - PostWithoutBan",
  description: "Privacy policy for PostWithoutBan.",
  alternates: {
    canonical: "/legal/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
