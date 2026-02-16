import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - PostWithoutBan",
  description: "Access your PostWithoutBan account.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
