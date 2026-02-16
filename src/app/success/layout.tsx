import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Success - PostWithoutBan",
  description: "Your purchase is confirmed. Access your account.",
  alternates: {
    canonical: "/success",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
