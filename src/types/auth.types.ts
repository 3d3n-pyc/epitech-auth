/**
 * Interface pour un code d'authentification
 */
export interface AuthCodeData {
  code: string;
  authUrl: string;
  expiresAt: Date;
}

/**
 * Interface pour un utilisateur
 */
export interface UserData {
  id: number;
  azureOid: string;
  email: string | null;
  name: string | null;
}

/**
 * Interface pour une réponse de vérification d'authentification
 */
export interface AuthCheckResponse {
  authenticated: boolean;
  status: string;
  user?: UserData;
  authenticatedAt?: Date;
  message?: string;
  error?: string;
}
