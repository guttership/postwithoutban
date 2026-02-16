import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware de sécurité pour protéger les routes sensibles
 * 
 * Routes protégées:
 * - /api/analyze : uniquement avec token d'accès valide (sauf /demo)
 * - /app : uniquement avec token d'accès valide
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protection de /api/analyze (sauf pour les requêtes depuis /demo)
  if (pathname === "/api/analyze") {
    const referer = request.headers.get("referer") || "";
    const isDemoRequest = referer.includes("/demo");

    // Les requêtes depuis /demo sont autorisées (limite gérée côté client)
    if (isDemoRequest) {
      return NextResponse.next();
    }

    // Pour les autres requêtes, vérifier le token
    const accessToken = request.cookies.get("pwb_access")?.value;
    
    if (!accessToken) {
      console.warn(`[Security] Unauthorized API access attempt to ${pathname}`);
      return NextResponse.json(
        { error: "Accès non autorisé. Vous devez avoir un compte actif pour utiliser cette API." },
        { status: 401 }
      );
    }

    // Le token existe, on laisse passer et la vérification détaillée se fera dans l'API route
    return NextResponse.next();
  }

  // Protection de /app
  if (pathname.startsWith("/app")) {
    const accessToken = request.cookies.get("pwb_access")?.value;
    
    if (!accessToken) {
      console.warn(`[Security] Unauthorized page access attempt to ${pathname}`);
      const url = request.nextUrl.clone();
      url.pathname = "/pricing";
      return NextResponse.redirect(url);
    }

    // Le token existe, on laisse passer et la vérification se fera côté serveur
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/analyze",
    "/app/:path*",
  ],
};
