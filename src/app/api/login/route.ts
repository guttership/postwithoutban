import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAccessEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'email a un achat actif
    const purchase = await prisma.purchase.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Aucun achat trouvé pour cet email. Veuillez acheter un accès." },
        { status: 404 }
      );
    }

    if (!purchase.isActive) {
      return NextResponse.json(
        { error: "Votre accès a été désactivé." },
        { status: 403 }
      );
    }

    // Envoyer l'email avec le lien d'accès existant
    if (process.env.RESEND_API_KEY) {
      await sendAccessEmail({
        to: purchase.email,
        accessToken: purchase.accessToken,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Lien d'accès envoyé à votre email !",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
