"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook qui détecte le pays du client et définit la langue automatiquement
 * France → FR, Autres → EN
 * Utilise Cloudflare's Headers (X-Vercel-IP-Country) en prod, API gratuite en dev
 */
export function useGeolocation() {
  const router = useRouter();

  useEffect(() => {
    // Vérifier s'il existe déjà une préférence de langue
    const storedLocale = localStorage.getItem("locale");
    if (storedLocale) {
      return; // La langue est déjà définie
    }

    // Déterminer la langue basée sur le pays
    const detectLocale = async () => {
      try {
        // En production (Vercel), utiliser les headers de Vercel
        // En dev local, utiliser une API de géolocalisation gratuite
        const response = await fetch("/api/detect-locale");
        const data = await response.json();
        const locale = data.locale || "en";

        // Sauvegarder dans localStorage ET cookies
        localStorage.setItem("locale", locale);
        
        // Créer un cookie aussi
        document.cookie = `locale=${locale}; path=/; max-age=${365 * 24 * 60 * 60}`;

        // Recharger pour appliquer la langue
        router.refresh();
      } catch (error) {
        console.error("Error detecting locale:", error);
        // Par défaut EN si erreur
        localStorage.setItem("locale", "en");
        document.cookie = `locale=en; path=/; max-age=${365 * 24 * 60 * 60}`;
      }
    };

    detectLocale();
  }, [router]);
}
