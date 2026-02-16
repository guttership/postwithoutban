import { NextResponse } from "next/server";

/**
 * Redirection vers l'authentification Reddit OAuth
 * Génère un state and redirects l'utilisateur vers Reddit
 */
export async function GET() {
  try {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const redirectUri = process.env.REDDIT_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: "Reddit OAuth non configuré" },
        { status: 500 }
      );
    }

    // Générer un state aléatoire pour validation côté callback
    const state = Math.random().toString(36).substring(2, 15);

    // Construire l'URL Reddit OAuth
    const scope = "read submit"; // Permissions demandées
    const redirectUrl = new URL("https://www.reddit.com/api/v1/authorize");
    redirectUrl.searchParams.set("client_id", clientId);
    redirectUrl.searchParams.set("response_type", "code");
    redirectUrl.searchParams.set("state", state);
    redirectUrl.searchParams.set("redirect_uri", redirectUri);
    redirectUrl.searchParams.set("duration", "permanent");
    redirectUrl.searchParams.set("scope", scope);

    // Créer la réponse et stocker le state en cookie
    const response = NextResponse.redirect(redirectUrl.toString());
    response.cookies.set("reddit_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Reddit OAuth error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'authentification Reddit" },
      { status: 500 }
    );
  }
}
