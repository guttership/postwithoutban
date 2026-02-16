"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Target, Check, AlertCircle } from "lucide-react";

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

      {/* Features Section - Red Flags */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-zinc-100 text-center mb-16">
            {t("features.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-red-950/30 border border-red-900/50">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-red-300 mb-2">
                {t("features.feature1.title")}
              </h3>
              <p className="text-zinc-400">
                {t("features.feature1.description")}
              </p>
            </div>
            <div className="p-6 rounded-xl bg-green-950/30 border border-green-900/50">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-green-300 mb-2">
                {t("features.feature2.title")}
              </h3>
              <p className="text-zinc-400">
                {t("features.feature2.description")}
              </p>
            </div>
            <div className="p-6 rounded-xl bg-orange-950/30 border border-orange-900/50">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-orange-300 mb-2">
                {t("features.feature3.title")}
              </h3>
              <p className="text-zinc-400">
                {t("features.feature3.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="py-20 px-4 bg-zinc-900/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-zinc-100 text-center mb-16">
            Post Example: Before vs After
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="rounded-xl bg-red-950/30 border border-red-900/50 p-6">
              <h3 className="text-lg font-bold text-red-300 mb-4">❌ Your Current Post (Gets Deleted)</h3>
              <div className="bg-zinc-950 p-4 rounded-lg space-y-3 text-sm text-zinc-300 font-mono">
                <p><strong>Title:</strong> Check out my new SaaS tool!</p>
                <p><strong>Content:</strong></p>
                <p className="text-red-400">
                  &quot;Hey everyone! I just launched CodeSnap, a tool that helps developers share code snippets. It&apos;s built with Next.js and has amazing features. Check it out at [link]. Use code STARTUP for 50% off!&quot;
                </p>
                <p className="text-xs text-red-400 mt-2">⏱️ Deleted in 2 hours • 📉 Shadowban risk high</p>
              </div>
            </div>

            {/* After */}
            <div className="rounded-xl bg-green-950/30 border border-green-900/50 p-6">
              <h3 className="text-lg font-bold text-green-300 mb-4">✅ PostWithoutBan Post (Survives)</h3>
              <div className="bg-zinc-950 p-4 rounded-lg space-y-3 text-sm text-zinc-300 font-mono">
                <p><strong>Title:</strong> I struggled sharing code in Slack for 6 months...</p>
                <p><strong>Content:</strong></p>
                <p className="text-green-400">
                  &quot;Then I realized the real problem wasn&apos;t sharing—it was context. You paste a snippet, but nobody understands WHY or what changed. Built CodeSnap to solve this. Has anyone faced similar issues? What&apos;s YOUR workaround?&quot;
                </p>
                <p className="text-xs text-green-400 mt-2">⏱️ 5.2k upvotes • 📈 200+ signups</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tactical Advice Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-zinc-100 text-center mb-16">
            What PostWithoutBan Analyzes
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                <h4 className="font-semibold text-orange-400 mb-2">🎯 Website Analysis</h4>
                <p className="text-sm text-zinc-400">Core problem, target audience, pricing strategy, unique positioning</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                <h4 className="font-semibold text-orange-400 mb-2">🚩 Red Flags Detection</h4>
                <p className="text-sm text-zinc-400">What kills posts on Reddit (marketing language, urgency, pricing pushes, etc.)</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                <h4 className="font-semibold text-orange-400 mb-2">📊 Realistic Estimates</h4>
                <p className="text-sm text-zinc-400">Expected engagement based on subreddit, timing, and post structure</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                <h4 className="font-semibold text-orange-400 mb-2">🏘️ Subreddit Research</h4>
                <p className="text-sm text-zinc-400">Best subreddits for your niche, their culture, timing, and moderation rules</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                <h4 className="font-semibold text-orange-400 mb-2">📝 Post Generation</h4>
                <p className="text-sm text-zinc-400">Authentic posts that solve a problem while naturally mentioning your tool</p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                <h4 className="font-semibold text-orange-400 mb-2">💡 Tactical Tips</h4>
                <p className="text-sm text-zinc-400">Specific strategies per subreddit (Feedback Friday format, discussion angles, etc.)</p>
              </div>
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
