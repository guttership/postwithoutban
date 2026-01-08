"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback, useSyncExternalStore } from "react";
import { AlertTriangle } from "lucide-react";
import Navbar from "../components/Navbar";
import RedditStrategyForm from "../components/RedditStrategyForm";
import Link from "next/link";

const DEMO_STORAGE_KEY = "postwithoutban_demo_count";
const DEMO_DATE_KEY = "postwithoutban_demo_date";
const MAX_FREE_ANALYSES = 1;

function getDemoState() {
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem(DEMO_DATE_KEY);
  const storedCount = parseInt(localStorage.getItem(DEMO_STORAGE_KEY) || "0");

  if (storedDate !== today) {
    localStorage.setItem(DEMO_DATE_KEY, today);
    localStorage.setItem(DEMO_STORAGE_KEY, "0");
    return { canUse: true, count: 0 };
  }
  
  return { canUse: storedCount < MAX_FREE_ANALYSES, count: storedCount };
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return JSON.stringify(getDemoState());
}

function getServerSnapshot() {
  return JSON.stringify({ canUse: true, count: 0 });
}

export default function DemoPage() {
  const t = useTranslations();
  const demoStateStr = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const demoState = JSON.parse(demoStateStr) as { canUse: boolean; count: number };
  const [, forceUpdate] = useState(0);

  const handleAnalysisComplete = useCallback(() => {
    const newCount = demoState.count + 1;
    localStorage.setItem(DEMO_STORAGE_KEY, newCount.toString());
    forceUpdate(n => n + 1);
  }, [demoState.count]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
              {t("demo.title")}
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              {t("demo.subtitle")}
            </p>
            <p className="text-sm text-zinc-500 mt-2">{t("demo.limit")}</p>
          </div>

          {demoState.canUse ? (
            <>
              {/* Avertissement */}
              <div className="mb-8 p-4 rounded-lg bg-orange-600/15 text-orange-400 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">{t("warning.title")}</p>
                  <p className="text-orange-400/80">{t("warning.message")}</p>
                </div>
              </div>

              {/* Formulaire */}
              <RedditStrategyForm onAnalysisComplete={handleAnalysisComplete} />
            </>
          ) : (
            <div className="text-center p-12 rounded-xl bg-zinc-900">
              <h2 className="text-2xl font-bold text-zinc-100 mb-4">
                {t("demo.upgradePrompt")}
              </h2>
              <p className="text-zinc-400 mb-8">
                Vous avez utilise votre analyse gratuite du jour. Passez a la
                version complete pour des analyses illimitees.
              </p>
              <Link
                href="/pricing"
                className="inline-block px-8 py-4 text-lg font-medium rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors"
              >
                {t("demo.upgradeCta")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
