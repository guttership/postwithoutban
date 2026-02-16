import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

// Utiliser la DB de production
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_fntxwobBJ8d2@ep-gentle-waterfall-agn587pu-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function main() {
  console.log("🔐 Creating unlimited access for yann.gutter@gmail.com in PRODUCTION DB...");

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
      console.log("✅ Access already exists in production. Updating...");
      const updated = await prisma.purchase.update({
        where: { email },
        data: {
          isActive: true,
          activatedAt: new Date(),
        },
      });
      console.log(`🔑 Your existing Access Token: ${updated.accessToken}`);
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
      console.log(`🔑 Your new Access Token: ${created.accessToken}`);
    }

    console.log("\n✅ Unlimited access granted in PRODUCTION!");
    console.log(`📧 Email: ${email}`);
    console.log("\n📌 Instructions:");
    console.log("1. Go to https://www.postwithoutban.com");
    console.log("2. Open browser console (F12)");
    console.log("3. Paste this command:");
    
    const token = existing?.accessToken || accessToken;
    console.log(`   document.cookie = "pwb_access=${token}; path=/; domain=.postwithoutban.com; max-age=31536000"; location.reload();`);
    console.log("\n4. You now have UNLIMITED access in production! 🎉");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
