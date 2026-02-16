"use client";

import { useEffect, useState } from "react";
import { LogIn, CheckCircle } from "lucide-react";

export default function RedditLoginButton() {
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Vérifier si connecté au Reddit
    const storedUsername = document.cookie
      .split("; ")
      .find((row) => row.startsWith("reddit_username="))
      ?.split("=")[1];

    if (storedUsername) {
      setTimeout(() => {
        setIsConnected(true);
        setUsername(decodeURIComponent(storedUsername));
      }, 0);
    }

    // Vérifier les paramètres de redirection
    const params = new URLSearchParams(window.location.search);
    if (params.get("reddit_connected") === "true") {
      setTimeout(() => setIsConnected(true), 0);
      // Nettoyer l'URL
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (params.get("error")) {
      console.error("Reddit OAuth error:", params.get("error"));
      // Nettoyer l'URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleRedditLogin = async () => {
    setIsLoading(true);
    try {
      // Rediriger vers le endpoint d'authentification
      window.location.href = "/api/auth/reddit";
    } catch (error) {
      console.error("Reddit login error:", error);
      setIsLoading(false);
    }
  };

  if (isConnected && username) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600/10 border border-orange-600/50">
        <CheckCircle className="w-4 h-4 text-orange-400" />
        <span className="text-sm text-orange-400">
          Connecté : <span className="font-semibold">{username}</span>
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleRedditLogin}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 text-white transition-colors text-sm font-medium"
    >
      <LogIn className="w-4 h-4" />
      {isLoading ? "Connexion..." : "Se connecter avec Reddit"}
    </button>
  );
}
