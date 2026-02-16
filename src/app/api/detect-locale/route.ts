import { NextRequest, NextResponse } from "next/server";

/**
 * API qui détecte le pays de l'utilisateur et retourne FR ou EN
 * Utilise Vercel's X-Vercel-IP-Country header en prod
 * Fallback sur ipapi.co gratuit en dev
 */
export async function GET(request: NextRequest) {
  try {
    // En production (Vercel), Vercel ajoute automatiquement les headers de localisation
    const countryFromVercel = request.headers.get("x-vercel-ip-country") || 
                              request.headers.get("cf-ipcountry");

    if (countryFromVercel) {
      const locale = countryFromVercel.toLowerCase() === "fr" ? "fr" : "en";
      return NextResponse.json({ locale });
    }

    // Fallback: récupérer l'IP et faire une requête à ipapi.co
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") ||
               "0.0.0.0";

    // API gratuite sans authentification
    const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 3600 } // Cache 1h
    });

    if (!geoResponse.ok) {
      return NextResponse.json({ locale: "en" });
    }

    const geoData = await geoResponse.json();
    const countryCode = geoData.country_code?.toLowerCase();
    const locale = countryCode === "fr" ? "fr" : "en";

    return NextResponse.json({ locale });
  } catch (error) {
    console.error("Error detecting locale:", error);
    // Par défaut EN en cas d'erreur
    return NextResponse.json({ locale: "en" });
  }
}
