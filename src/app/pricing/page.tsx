"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";

export default function PricingPage() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-zinc-100 mb-4">
              {t("pricing.title")}
            </h1>
            <p className="text-xl text-zinc-400">{t("pricing.subtitle")}</p>
          </div>

          <div className="p-8 rounded-xl bg-zinc-900">
            <div className="text-center mb-8">
              <span className="text-6xl font-bold text-zinc-100">
                {t("pricing.price")}
              </span>
              <span className="text-2xl text-zinc-400 ml-2">
                {t("pricing.currency")}
              </span>
              <p className="text-zinc-500 mt-2 text-lg">{t("pricing.period")}</p>
            </div>

            <ul className="space-y-4 mb-10">
              {(t.raw("pricing.features") as string[]).map(
                (feature: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-zinc-300 text-lg"
                  >
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                )
              )}
            </ul>

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full py-4 text-lg font-medium rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirection...
                </>
              ) : (
                t("pricing.cta")
              )}
            </button>

            <p className="text-center text-sm text-zinc-500 mt-6">
              Paiement securise par Stripe
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
