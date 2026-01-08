"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, Loader2, CheckCircle, XCircle } from "lucide-react";
import Navbar from "../components/Navbar";

export default function LoginPage() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setStatus("loading");
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Email envoyé !");
      } else {
        setStatus("error");
        setMessage(data.error || "Erreur");
      }
    } catch {
      setStatus("error");
      setMessage("Erreur de connexion");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="pt-32 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Mail className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">
              {t("login.title")}
            </h1>
            <p className="text-zinc-400">
              {t("login.subtitle")}
            </p>
          </div>

          {status === "success" ? (
            <div className="text-center p-8 rounded-xl bg-zinc-900">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-zinc-100 mb-2">
                {t("login.emailSent")}
              </h2>
              <p className="text-zinc-400">
                {t("login.checkInbox")}
              </p>
            </div>
          ) : status === "error" ? (
            <div className="text-center p-8 rounded-xl bg-zinc-900">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-zinc-100 mb-2">
                {message}
              </h2>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
              >
                {t("login.tryAgain")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 rounded-xl bg-zinc-900">
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">
                  {t("login.emailLabel")}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("login.sending")}
                  </>
                ) : (
                  t("login.sendLink")
                )}
              </button>
              
              <p className="mt-4 text-center text-sm text-zinc-500">
                {t("login.noAccount")}{" "}
                <a href="/pricing" className="text-orange-500 hover:text-orange-400">
                  {t("login.buyAccess")}
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
