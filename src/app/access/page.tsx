"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Navbar from "../components/Navbar";

export default function AccessPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token manquant dans l'URL");
      return;
    }

    // Vérifier et activer l'accès
    const verifyAccess = async () => {
      try {
        const response = await fetch("/api/access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.valid) {
          setStatus("success");
          setMessage(`Accès activé pour ${data.email}`);
          // Rediriger vers l'app après 2 secondes
          setTimeout(() => {
            router.push("/app");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Token invalide");
        }
      } catch {
        setStatus("error");
        setMessage("Erreur de connexion");
      }
    };

    verifyAccess();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="pt-32 px-4">
        <div className="max-w-md mx-auto text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
              <h1 className="text-2xl font-bold text-zinc-100">
                Vérification en cours...
              </h1>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <h1 className="text-2xl font-bold text-zinc-100">
                Accès activé !
              </h1>
              <p className="text-zinc-400">{message}</p>
              <p className="text-zinc-500">
                Redirection vers l&apos;application...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="w-16 h-16 text-red-500" />
              <h1 className="text-2xl font-bold text-zinc-100">
                Erreur d&apos;accès
              </h1>
              <p className="text-zinc-400">{message}</p>
              <a
                href="/pricing"
                className="mt-4 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
              >
                Acheter un accès
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
