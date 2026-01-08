import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token manquant" },
        { status: 400 }
      );
    }

    // Vérifier si le token existe et est actif
    const purchase = await prisma.purchase.findUnique({
      where: { accessToken: token },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Token invalide", valid: false },
        { status: 401 }
      );
    }

    if (!purchase.isActive) {
      return NextResponse.json(
        { error: "Accès désactivé", valid: false },
        { status: 403 }
      );
    }

    // Mettre à jour les stats d'accès
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        lastAccessAt: new Date(),
        accessCount: { increment: 1 },
      },
    });

    // Créer une réponse avec cookie de session
    const response = NextResponse.json({
      valid: true,
      email: purchase.email,
    });

    // Cookie sécurisé valable 30 jours
    response.cookies.set("pwb_access", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Access verification error:", error);
    return NextResponse.json(
      { error: "Erreur de vérification" },
      { status: 500 }
    );
  }
}

// GET: Vérifier si l'utilisateur a un cookie valide
export async function GET(request: NextRequest) {
  try {
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
    });
  } catch (error) {
    console.error("Access check error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
