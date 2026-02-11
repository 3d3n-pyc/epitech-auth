import { prisma } from "../config/config.js";

/**
 * Upsert un utilisateur
 */
export async function upsertUser(
  azureOid: string,
  email: string | null,
  name: string | null
) {
  return prisma.user.upsert({
    where: { azureOid },
    update: { email, name },
    create: { azureOid, email, name },
  });
}
