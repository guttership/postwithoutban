"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Search, Target, FileText, Check } from "lucide-react";

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <Image
              src="/images/logo.svg"
              alt="PostWithoutBan"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>
          <p className="text-sm font-medium text-orange-500 uppercase tracking-wider mb-6">
            {t("hero.tagline")}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-100 mb-6 leading-tight">
            {t("hero.title")}
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="px-8 py-4 text-lg font-medium rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors"
            >
              {t("hero.cta")}
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 text-lg font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-colors"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-zinc-100 text-center mb-16">
            {t("features.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-zinc-900 text-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Search className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                {t("features.feature1.title")}
              </h3>
              <p className="text-zinc-400">
                {t("features.feature1.description")}
              </p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900 text-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                {t("features.feature2.title")}
              </h3>
              <p className="text-zinc-400">
                {t("features.feature2.description")}
              </p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900 text-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <FileText className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                {t("features.feature3.title")}
              </h3>
              <p className="text-zinc-400">
                {t("features.feature3.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 px-4 bg-zinc-900/50">
        <div className="container mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold text-zinc-100 mb-4">
            {t("pricing.title")}
          </h2>
          <p className="text-zinc-400 mb-10">{t("pricing.subtitle")}</p>
          <div className="p-8 rounded-xl bg-zinc-900">
            <div className="mb-6">
              <span className="text-5xl font-bold text-zinc-100">
                {t("pricing.price")}
              </span>
              <span className="text-xl text-zinc-400 ml-2">
                {t("pricing.currency")}
              </span>
              <p className="text-zinc-500 mt-1">{t("pricing.period")}</p>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {(t.raw("pricing.features") as string[]).map(
                (feature: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-zinc-300"
                  >
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                )
              )}
            </ul>
            <Link
              href="/pricing"
              className="block w-full py-3 text-center font-medium rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors"
            >
              {t("pricing.cta")}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4">
        <p className="text-center text-sm text-zinc-500">
          {t("footer.tagline")} {t("footer.disclaimer")}
        </p>
      </footer>
    </div>
  );
}
