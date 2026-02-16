"use client";

import Script from "next/script";
import { useTranslations } from "next-intl";
import { useState } from "react";

const GA_ID = "G-V148K86MM1";
const CONSENT_COOKIE = "pwb_consent";

type ConsentState = "granted" | "denied" | "unknown";

function getCookieValue(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
}

export default function AnalyticsConsent() {
  const t = useTranslations("consent");
  const [consent, setConsent] = useState<ConsentState>(() => {
    if (typeof document === "undefined") {
      return "unknown";
    }
    const saved = getCookieValue(CONSENT_COOKIE);
    if (saved === "granted" || saved === "denied") {
      return saved;
    }
    return "unknown";
  });

  const handleAccept = () => {
    setCookie(CONSENT_COOKIE, "granted", 365);
    setConsent("granted");
  };

  const handleDecline = () => {
    setCookie(CONSENT_COOKIE, "denied", 365);
    setConsent("denied");
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script
            id="gtag-js"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}

      {consent === "unknown" && (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-zinc-300">
              <p className="font-semibold text-zinc-100">{t("title")}</p>
              <p className="text-zinc-400">{t("message")}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDecline}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-600"
              >
                {t("decline")}
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500"
              >
                {t("accept")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
