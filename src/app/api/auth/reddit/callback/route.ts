import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Callback d'authentification Reddit OAuth
 * Reçoit le code d'autorisation et l'échange pour un access token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Vérifier les erreurs
    if (error) {
      console.error("Reddit OAuth error:", error);
      return NextResponse.redirect(
        new URL(`/demo?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          "/demo?error=missing_oauth_params",
          request.url
        )
      );
    }

    // Vérifier le state en cookie
    const storedState = request.cookies.get("reddit_oauth_state")?.value;
    if (!storedState || storedState !== state) {
      console.error("State mismatch in Reddit OAuth");
      return NextResponse.redirect(
        new URL("/demo?error=state_mismatch", request.url)
      );
    }

    // Récupérer les infos nécessaires
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const redirectUri = process.env.REDDIT_REDIRECT_URI;
    const accessToken = request.cookies.get("pwb_access")?.value;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Reddit OAuth non configuré");
    }

    if (!accessToken) {
      return NextResponse.redirect(
        new URL("/demo?error=no_access_token", request.url)
      );
    }

    // Échanger le code pour un access token
    const tokenResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "PostWithoutBan/1.0",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Reddit token exchange failed:", error);
      throw new Error("Token exchange failed");
    }

    const tokenData = await tokenResponse.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      scope: string;
    };

    // Récupérer l'username Reddit
    const userResponse = await fetch("https://oauth.reddit.com/api/v1/me", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "User-Agent": "PostWithoutBan/1.0",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch Reddit user info");
    }

    const userData = await userResponse.json() as {
      id: string;
      name: string;
    };

    // Vérifier que l'utilisateur a un Purchase avec cet accessToken
    const purchase = await prisma.purchase.findUnique({
      where: { accessToken },
    });

    if (!purchase) {
      return NextResponse.redirect(
        new URL("/demo?error=invalid_access", request.url)
      );
    }

    // Créer ou mettre à jour RedditAccount
    await prisma.redditAccount.upsert({
      where: { purchaseId: purchase.id },
      create: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        username: userData.name,
        redditId: userData.id,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        scope: tokenData.scope,
        purchaseId: purchase.id,
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
    });

    // Stocker le username en cookie pour affichage
    const response = NextResponse.redirect(
      new URL("/demo?reddit_connected=true", request.url)
    );

    response.cookies.set("reddit_username", userData.name, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    // Nettoyer le state cookie
    response.cookies.delete("reddit_oauth_state");

    return response;
  } catch (error) {
    console.error("Reddit OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/demo?error=${encodeURIComponent(
          error instanceof Error ? error.message : "unknown_error"
        )}`,
        request.url
      )
    );
  }
}
