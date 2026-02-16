import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Activation - PostWithoutBan",
  description: "Activate your lifetime access.",
  alternates: {
    canonical: "/access",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
