"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 mt-20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Branding Section */}
          <div>
            <h3 className="text-zinc-100 font-bold text-lg mb-4">PostWithoutBan</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Reddit strategies that survive moderation.
            </p>
            <div className="flex items-center gap-3">
              <p className="text-xs text-zinc-500">Powered by</p>
              <a
                href="https://dmum.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity flex items-center gap-2"
                title="Design-moi un mouton - Web design & development"
              >
                <Image
                  src="/images/logo.png"
                  alt="design-moi un mouton"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <span className="text-xs text-zinc-400 hover:text-zinc-300">design-moi un mouton</span>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-zinc-300 font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-zinc-400 hover:text-zinc-300 text-sm transition-colors">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-zinc-400 hover:text-zinc-300 text-sm transition-colors">
                  {t("nav.pricing")}
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-zinc-400 hover:text-zinc-300 text-sm transition-colors">
                  {t("nav.demo")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-zinc-300 font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/privacy" className="text-zinc-400 hover:text-zinc-300 text-sm transition-colors">
                  {t("legal.footer.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-zinc-400 hover:text-zinc-300 text-sm transition-colors">
                  {t("legal.footer.termsOfService")}
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${t("legal.footer.contactEmail")}`}
                  className="text-zinc-400 hover:text-zinc-300 text-sm transition-colors"
                >
                  {t("legal.footer.contact")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-zinc-500">
              © {new Date().getFullYear()} PostWithoutBan. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://dmum.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Website by design-moi un mouton
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
