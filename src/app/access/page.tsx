"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import Navbar from "../components/Navbar";

export default function AccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenParam = searchParams.get("token");
  const [status, setStatus] = useState<"form" | "loading" | "success" | "error">(
    tokenParam ? "form" : "error"
  );
  const [message, setMessage] = useState(tokenParam ? "" : "Token manquant dans l'URL");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !tokenParam) {
      setMessage("Email et token requis");
      return;
    }

    if (!email.includes("@")) {
      setMessage("Email invalide");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenParam, email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (data.valid) {
        setStatus("success");
        setMessage("Acces active avec succes!");
        // Rediriger vers l'app après 2 secondes
        setTimeout(() => {
          router.push("/app");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.error || "Email ou token invalide");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Erreur de connexion");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="pt-32 px-4 pb-20">
        <div className="max-w-md mx-auto">
          {status === "form" && (
            <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800">
              <div className="flex justify-center mb-6">
                <Mail className="w-12 h-12 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-100 text-center mb-2">
                Activer votre accès
              </h1>
              <p className="text-zinc-400 text-center text-sm mb-6">
                Confirmez votre adresse email pour activer votre accès à vie
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors"
                >
                  Activer l accès
                </button>

                <p className="text-xs text-zinc-500 text-center">
                  Confirmez l email auquel vous avez recu le lien d accès
                </p>
              </form>
            </div>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
              <h1 className="text-2xl font-bold text-zinc-100">
                Vérification en cours...
              </h1>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <h1 className="text-2xl font-bold text-zinc-100">
                Accès activé !
              </h1>
              <p className="text-zinc-400">{message}</p>
              <p className="text-zinc-500 text-sm">
                Vous allez être redirigé vers l&apos;application...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <XCircle className="w-16 h-16 text-red-500" />
              <h1 className="text-2xl font-bold text-zinc-100">
                Erreur d&apos;accès
              </h1>
              <p className="text-zinc-400">{message}</p>
              <div className="mt-6 space-y-3 w-full">
                <button
                  onClick={() => {
                    setStatus("form");
                    setMessage("");
                  }}
                  className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
                >
                  Réessayer
                </button>
                <a
                  href="/pricing"
                  className="block px-6 py-3 border border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg transition-colors text-center"
                >
                  Acheter un accès
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
