"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useCallback, useSyncExternalStore } from "react";
import { AlertTriangle, X, Check, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import RedditStrategyForm from "../components/RedditStrategyForm";

// Composant modal inline pour éviter les erreurs d'import
function UpgradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useTranslations();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: locale }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error("Upgrade error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl max-w-lg w-full shadow-2xl border border-zinc-800">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-100">{t("upgrade.title")}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-zinc-400 mb-6 text-center">{t("upgrade.description")}</p>
          <div className="bg-zinc-950 rounded-lg p-6 mb-6 border border-orange-600/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Accès à vie</p>
                <p className="text-4xl font-bold text-zinc-100">
                  99<span className="text-2xl text-zinc-400 ml-2">EUR</span>
                </p>
              </div>
            </div>
            <ul className="space-y-3 mt-6">
              {(t.raw("upgrade.features") as string[]).map((feature: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-center text-xs text-zinc-500 mb-6">{t("upgrade.highlight")}</p>
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full py-3 text-lg font-medium rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 text-white transition-colors flex items-center justify-center gap-2 mb-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirection...
              </>
            ) : (
              t("upgrade.cta")
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-zinc-400 hover:text-zinc-300"
          >
            {t("upgrade.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

const DEMO_STORAGE_KEY = "postwithoutban_demo_count";
const DEMO_DATE_KEY = "postwithoutban_demo_date";
const MAX_FREE_ANALYSES = 1;

// Vérifie si on est en localhost
const isLocalhost = () => {
  return typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.startsWith('192.168.'));
};

function getDemoState() {
  // Pas de limite en localhost
  if (isLocalhost()) {
    return { canUse: true, count: 0 };
  }

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
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const handleAnalysisComplete = useCallback(() => {
    // Ne pas incrémenter le compteur en localhost
    if (!isLocalhost()) {
      const newCount = demoState.count + 1;
      localStorage.setItem(DEMO_STORAGE_KEY, newCount.toString());
      forceUpdate(n => n + 1);
      
      // Ouvrir le modal après l'analyse si c'était la dernière gratuite
      if (newCount >= MAX_FREE_ANALYSES) {
        setTimeout(() => setIsUpgradeModalOpen(true), 1000);
      }
    }
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
              <div className="mb-8 p-4 rounded-lg bg-zinc-900/50 border border-orange-600/30 text-orange-400 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">{t("warning.title")}</p>
                  <p className="text-orange-400/80">{t("warning.message")}</p>
                </div>
              </div>

              {/* Formulaire */}
              <RedditStrategyForm onAnalysisComplete={handleAnalysisComplete} />
              
              {/* Modal d'upgrade - initialement fermé */}
              <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
              />
            </>
          ) : (
            <>
              <div className="text-center p-12 rounded-xl bg-zinc-900 border border-zinc-800">
                <h2 className="text-2xl font-bold text-zinc-100 mb-4">
                  {t("demo.upgradePrompt")}
                </h2>
                <p className="text-zinc-400 mb-8">
                  {t("upgrade.description")}
                </p>
                <button
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="inline-block px-8 py-4 text-lg font-medium rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors"
                >
                  {t("demo.upgradeCta")}
                </button>
              </div>
              
              {/* Modal d'upgrade - ouvert */}
              <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
