import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateAndCreateSession,
  checkRateLimit,
} from "@/lib/session-security";

// Liste des emails admin (séparés par des virgules dans .env)
function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
  return adminEmails.includes(email.toLowerCase());
}

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: "Token et email requis" },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimitCheck = checkRateLimit(token);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: "Trop de requetes. Veuillez reessayer plus tard." },
        { status: 429 }
      );
    }

    // Normaliser l'email
    const normalizedEmail = email.toLowerCase().trim();

    // Validation complète de la session avec détection du partage
    const sessionCheck = await validateAndCreateSession(request, token);

    if (!sessionCheck.valid) {
      // Retourner l'erreur appropriée
      if (sessionCheck.suspiciousActivity === "multiple_sessions") {
        return NextResponse.json(
          { error: sessionCheck.error, valid: false },
          { status: 403 }
        );
      }
      if (sessionCheck.suspiciousActivity === "rapid_ip_change") {
        return NextResponse.json(
          { error: sessionCheck.error, valid: false },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: sessionCheck.error, valid: false },
        { status: 401 }
      );
    }

    // Vérifier que l'email correspond au token
    const purchase = await prisma.purchase.findUnique({
      where: { accessToken: token },
    });

    if (!purchase || purchase.email.toLowerCase() !== normalizedEmail) {
      console.warn(
        `[Security] Email mismatch: token=${token}, email fourni=${normalizedEmail}, email correct=${purchase?.email}`
      );
      return NextResponse.json(
        { error: "Token ou email invalide", valid: false },
        { status: 401 }
      );
    }

    // Marquer comme activé
    if (!purchase.activatedAt) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { activatedAt: new Date() },
      });
    }

    // Réponse succès
    const response = NextResponse.json({
      valid: true,
      email: purchase.email,
    });

    // Cookie sécurisé valable 30 jours
    response.cookies.set("pwb_access", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    console.log(`[Access] Acces valide: ${purchase.email}`);

    return response;
  } catch (error) {
    console.error("Access verification error:", error);
    return NextResponse.json(
      { error: "Erreur de verification" },
      { status: 500 }
    );
  }
}

// GET: Vérifier si l'utilisateur a un cookie valide ou est admin
export async function GET(request: NextRequest) {
  try {
    // Vérifier d'abord le cookie admin
    const adminEmail = request.cookies.get("pwb_admin")?.value;
    if (adminEmail && isAdmin(adminEmail)) {
      return NextResponse.json({
        valid: true,
        email: adminEmail,
        isAdmin: true,
      });
    }

    const token = request.cookies.get("pwb_access")?.value;

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const purchase = await prisma.purchase.findUnique({
      where: { accessToken: token },
    });

    if (!purchase || !purchase.isActive) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      email: purchase.email,
      isAdmin: isAdmin(purchase.email),
    });
  } catch (error) {
    console.error("Access check error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
