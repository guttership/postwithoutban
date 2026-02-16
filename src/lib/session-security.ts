import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import crypto from "crypto";

const MAX_CONCURRENT_SESSIONS = 2; // Max 2 appareils simultanément
const SESSION_TIMEOUT = 30 * 24 * 60 * 60 * 1000; // 30 jours
const MAX_REQUESTS_PER_MINUTE = 100; // Rate limiting

/**
 * Extrait l'IP de la requête
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "0.0.0.0";
}

/**
 * Extrait et normalise l'User-Agent
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

/**
 * Génère un hash unique pour un device basé sur User-Agent
 * (En prod, on pourrait aussi utiliser fingerprinting JS côté client)
 */
export function getDeviceHash(userAgent: string): string {
  return crypto
    .createHash("sha256")
    .update(userAgent)
    .digest("hex")
    .substring(0, 16);
}

/**
 * Vérifie et crée une session pour un token d'accès
 * Détecte les accès suspects et limite les sessions simultanées
 */
export async function validateAndCreateSession(
  request: NextRequest,
  accessToken: string
): Promise<{
  valid: boolean;
  email?: string;
  error?: string;
  suspiciousActivity?: string;
}> {
  try {
    // Récupérer l'info du token
    const purchase = await prisma.purchase.findUnique({
      where: { accessToken },
      include: { activeSessions: true },
    });

    console.log(`[Session] Recherche token: ${accessToken.substring(0,10)}...`);
    console.log(`[Session] Purchase trouvé: ${purchase ? purchase.email : 'NOT FOUND'}`);

    if (!purchase || !purchase.isActive) {
      return { valid: false, error: "Token invalide ou désactivé" };
    }

    const clientIp = getClientIp(request);
    const userAgent = getUserAgent(request);
    const deviceHash = getDeviceHash(userAgent);

    // DÉTECTION DE PARTAGE D'ACCÈS
    const activeSessions = purchase.activeSessions.filter(
      (s) => new Date(s.expiresAt) > new Date()
    );

    // 1. Vérifier s'il y a trop de sessions simultanées
    if (activeSessions.length >= MAX_CONCURRENT_SESSIONS) {
      // Chercher si ce device existe déjà
      const existingSession = activeSessions.find(
        (s) => s.deviceHash === deviceHash
      );

      if (!existingSession) {
        // Nouveau device avec déjà 2+ sessions = PARTAGE DÉTECTÉ
        console.warn(
          `[Security] Partage d'accès suspecté: ${purchase.email} - ${activeSessions.length} sessions simultanées`
        );
        return {
          valid: false,
          error: "Trop de connexions simultanées. Accès limité à 2 appareils.",
          suspiciousActivity: "multiple_sessions",
        };
      }
    }

    // 2. Vérifier les changements d'IP suspects
    const recentIpChanges = activeSessions.filter((s) => s.ipAddress !== clientIp);
    if (recentIpChanges.length > 0) {
      const timeDiff =
        Date.now() - new Date(recentIpChanges[0].lastSeenAt).getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      // Si changement d'IP en moins de 30 minutes = impossible géographiquement
      if (minutesDiff < 30) {
        console.warn(
          `[Security] Changement d'IP suspect: ${purchase.email} - IP1=${recentIpChanges[0].ipAddress} IP2=${clientIp} (${minutesDiff} minutes)`
        );
        return {
          valid: false,
          error: "Accès depuis plusieurs géolocalisations simultanément. Accès refusé.",
          suspiciousActivity: "rapid_ip_change",
        };
      }
    }

    // 3. Nettoyer les anciennes sessions expirées
    await prisma.activeSession.deleteMany({
      where: {
        purchaseId: purchase.id,
        expiresAt: { lt: new Date() },
      },
    });

    // 4. Ou mettre à jour la session existante si elle existe
    const existingSessionForDevice = activeSessions.find(
      (s) => s.deviceHash === deviceHash
    );

    if (existingSessionForDevice) {
      // Mettre à jour la session existante
      await prisma.activeSession.update({
        where: { id: existingSessionForDevice.id },
        data: {
          lastSeenAt: new Date(),
          ipAddress: clientIp, // Mettre à jour l'IP si elle change légèrement
          expiresAt: new Date(Date.now() + SESSION_TIMEOUT),
        },
      });
    } else {
      // Créer une nouvelle session
      await prisma.activeSession.create({
        data: {
          purchaseId: purchase.id,
          ipAddress: clientIp,
          userAgent,
          deviceHash,
          expiresAt: new Date(Date.now() + SESSION_TIMEOUT),
        },
      });
    }

    // 5. Mettre à jour les stats d'accès du Purchase
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        lastAccessAt: new Date(),
        accessCount: { increment: 1 },
      },
    });

    return { valid: true, email: purchase.email };
  } catch (error) {
    console.error("Session validation error:", error);
    return { valid: false, error: "Erreur de validation de session" };
  }
}

/**
 * Rate limiting simple par token
 * Peut être amélioré avec Redis en production
 */
const requestCounts: Map<string, { count: number; resetAt: number }> =
  new Map();

export function checkRateLimit(accessToken: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const entry = requestCounts.get(accessToken);

  if (!entry || entry.resetAt < now) {
    // Nouveau compte ou reset
    requestCounts.set(accessToken, {
      count: 1,
      resetAt: now + 60000, // 1 minute
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - 1 };
  }

  if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    console.warn(
      `[Security] Rate limit exceeded for token: ${accessToken.substring(0, 10)}...`
    );
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  const remaining = MAX_REQUESTS_PER_MINUTE - entry.count;
  return { allowed: true, remaining };
}

/**
 * Révoquer une session spécifique (utile si l'utilisateur détecte la partage)
 */
export async function revokeSession(purchaseId: string, sessionId: string) {
  try {
    await prisma.activeSession.delete({
      where: { id: sessionId },
    });
    console.log(`[Security] Session revoquee: ${purchaseId} - ${sessionId}`);
    return { success: true };
  } catch (error) {
    console.error("Error revoking session:", error);
    return { success: false, error: "Session introuvable" };
  }
}

/**
 * Révoquer TOUTES les sessions d'un token (utile en cas d'accès suspect)
 */
export async function revokeAllSessions(purchaseId: string) {
  try {
    const result = await prisma.activeSession.deleteMany({
      where: { purchaseId },
    });
    console.log(`[Security] Toutes les sessions révoquées: ${purchaseId}`);
    return { success: true, revokedCount: result.count };
  } catch (error) {
    console.error("Error revoking all sessions:", error);
    return { success: false, error: "Erreur lors de la révocation" };
  }
}
