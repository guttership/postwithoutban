"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.svg"
              alt="PostWithoutBan"
              width={32}
              height={32}
            />
            <span className="text-xl font-bold text-zinc-100">PostWithoutBan</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              {t("home")}
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              {t("pricing")}
            </Link>
            <Link
              href="/demo"
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              {t("demo")}
            </Link>
            <LanguageSwitcher />
            <Link
              href="/api/auth/signin"
              className="px-4 py-2 text-sm rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
