import { prisma } from "../config/config.js";
import { generateAuthCode } from "../utils/helpers.js";
import type { AuthCodeData } from "../types/auth.types.js";

/**
 * Créer un code d'authentification
 */
export async function createAuthCode(authUrl: string): Promise<AuthCodeData> {
  const code = generateAuthCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const authCode = await prisma.authCode.create({
    data: {
      code,
      status: "pending",
      expiresAt,
      authUrl,
    },
  });

  return {
    code: authCode.code,
    authUrl: authCode.authUrl || "",
    expiresAt: authCode.expiresAt,
  };
}

/**
 * Récupérer un code d'authentification
 */
export async function getAuthCode(code: string) {
  return prisma.authCode.findUnique({
    where: { code },
  });
}

/**
 * Mettre à jour le statut d'un code d'authentification
 */
export async function updateAuthCodeStatus(
  id: number,
  status: string,
  data?: { userId?: number; authenticatedAt?: Date }
) {
  return prisma.authCode.update({
    where: { id },
    data: {
      status,
      ...data,
    },
  });
}

/**
 * Mettre à jour le code PKCE d'un code d'authentification
 */
export async function updateAuthCodeVerifier(id: number, codeVerifier: string) {
  return prisma.authCode.update({
    where: { id },
    data: { codeVerifier },
  });
}

/**
 * Récupérer un code d'authentification avec l'utilisateur associé
 */
export async function getAuthCodeWithUser(code: string) {
  return prisma.authCode.findUnique({
    where: { code },
    include: {
      user: {
        select: {
          id: true,
          azureOid: true,
          email: true,
          name: true,
        },
      },
    },
  });
}
