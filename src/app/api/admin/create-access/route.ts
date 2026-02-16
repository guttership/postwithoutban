import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, secret } = await request.json();

    // Protection basique
    if (secret !== "create_admin_access_2026") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Générer un token d'accès unique
    const accessToken = randomUUID();
    const fakeSessionId = `admin_${Date.now()}`;

    // Vérifier s'il existe déjà
    const existing = await prisma.purchase.findUnique({
      where: { email },
    });

    let token: string;

    if (existing) {
      // Réactiver l'accès existant
      const updated = await prisma.purchase.update({
        where: { email },
        data: {
          isActive: true,
          activatedAt: new Date(),
        },
      });
      token = updated.accessToken;
    } else {
      // Créer un nouvel accès
      const created = await prisma.purchase.create({
        data: {
          email,
          accessToken,
          stripeSessionId: fakeSessionId,
          language: "fr",
          isActive: true,
          activatedAt: new Date(),
          accessCount: 0,
        },
      });
      token = created.accessToken;
    }

    return NextResponse.json({
      success: true,
      email,
      accessToken: token,
      message: "Unlimited access granted!",
    });
  } catch (error) {
    console.error("Error creating admin access:", error);
    return NextResponse.json(
      { error: "Failed to create access", details: String(error) },
      { status: 500 }
    );
  }
}
