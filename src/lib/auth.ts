import { prisma } from "./prisma";

/**
 * Vérifie si un token d'accès est valide et actif
 */
export async function verifyAccessToken(token: string | undefined): Promise<{
  valid: boolean;
  email?: string;
  purchaseId?: string;
}> {
  if (!token) {
    return { valid: false };
  }

  try {
    const purchase = await prisma.purchase.findUnique({
      where: { accessToken: token },
    });

    if (!purchase || !purchase.isActive) {
      return { valid: false };
    }

    return { 
      valid: true, 
      email: purchase.email,
      purchaseId: purchase.id 
    };
  } catch (error) {
    console.error("Error verifying access token:", error);
    return { valid: false };
  }
}

/**
 * Vérifie si un email est admin
 */
export function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Met à jour les statistiques d'accès d'un Purchase
 */
export async function updateAccessStats(purchaseId: string): Promise<void> {
  try {
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        lastAccessAt: new Date(),
        accessCount: { increment: 1 },
      },
    });
  } catch (error) {
    console.error("Error updating access stats:", error);
  }
}
