"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import RedditStrategyForm from "../components/RedditStrategyForm";

export default function AppPage() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch("/api/access");
        const data = await response.json();

        if (data.valid) {
          setHasAccess(true);
          setUserEmail(data.email);
        } else {
          // Pas d'accès, rediriger vers pricing
          router.push("/pricing");
        }
      } catch {
        router.push("/pricing");
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [router]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-zinc-950 pt-32 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        </div>
      </>
    );
  }

  if (!hasAccess) {
    return null; // Redirection en cours
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
              Post Without Ban
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
            {userEmail && (
              <p className="text-sm text-zinc-500 mt-2">
                Connecté : {userEmail}
              </p>
            )}
          </div>

          {/* Avertissement */}
          <div className="mb-8 p-4 rounded-lg bg-orange-600/15 text-orange-400 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">{t("warning.title")}</p>
              <p className="text-orange-400/80">{t("warning.message")}</p>
            </div>
          </div>

          {/* Formulaire */}
          <RedditStrategyForm />
        </div>
      </div>
    </>
  );
}
