import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🔐 Creating unlimited access for yann.gutter@gmail.com...");

  // Générer un token d'accès unique
  const accessToken = randomUUID();
  const email = "yann.gutter@gmail.com";
  const fakeSessionId = `creator_${Date.now()}`;

  try {
    // Vérifier s'il existe déjà
    const existing = await prisma.purchase.findUnique({
      where: { email },
    });

    if (existing) {
      console.log("✅ Access already exists. Updating...");
      await prisma.purchase.update({
        where: { email },
        data: {
          isActive: true,
          activatedAt: new Date(),
        },
      });
    } else {
      // Créer un nouvel accès
      await prisma.purchase.create({
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
    }

    console.log("✅ Unlimited access granted!");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Access Token: ${accessToken}`);
    console.log("\n📌 Instructions:");
    console.log("1. Open your browser console (F12)");
    console.log("2. Paste this command:");
    console.log(`   document.cookie = "pwb_access=${accessToken}; path=/; max-age=31536000"`);
    console.log("3. Refresh the page");
    console.log("4. You now have unlimited access! 🎉");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
