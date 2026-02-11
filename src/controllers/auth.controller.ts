import type { Request, Response } from "express";
import {
    createAuthCode,
    getAuthCode,
    updateAuthCodeStatus,
    updateAuthCodeVerifier,
    getAuthCodeWithUser,
} from "../services/authCode.service.js";
import { upsertUser } from "../services/user.service.js";
import { loadTemplate, generatePKCE } from "../utils/helpers.js";
import {
    confidentialClient,
    SCOPES,
    AZURE_REDIRECT_URI_VALUE,
    BASE_URL_VALUE,
} from "../config/config.js";

const ERROR_TEMPLATE = "error";

/**
 * Générer un code d'authentification
 */
export const generateCode = async (req: Request, res: Response) => {
    try {
        const authUrl = `${BASE_URL_VALUE}/auth/microsoft?code=`;
        const tempCode = "TEMP";
        const fullAuthUrl = authUrl + tempCode;

        const authCodeData = await createAuthCode(fullAuthUrl);
        const finalAuthUrl = authUrl + authCodeData.code;

        const createdAuthCode = await getAuthCode(authCodeData.code);
        if (createdAuthCode) {
            await updateAuthCodeStatus(createdAuthCode.id, "pending", {});
        }

        res.json({
            code: authCodeData.code,
            authUrl: finalAuthUrl,
            expiresAt: authCodeData.expiresAt,
            message: "Veuillez vous rendre sur authUrl pour vous authentifier",
        });
    } catch (err) {
        console.error("Error generating auth code:", err);
        res.status(500).json({ error: "Failed to generate auth code" });
    }
};

/**
 * Gérer le démarrage du flux d'authentification Microsoft
 */
export const startMicrosoftAuth = async (req: Request, res: Response) => {
    const code = req.query.code as string | undefined;

    if (!code) {
        const errorHtml = await loadTemplate(ERROR_TEMPLATE, {
            ERROR_TITLE: "Paramètre manquant",
            ERROR_SUBTITLE: "Le code d'authentification est requis",
            ERROR_MESSAGE:
                "L'URL d'authentification doit contenir un paramètre 'code'. Veuillez utiliser le lien fourni par votre application.",
        });
        return res.status(400).send(errorHtml);
    }

    try {
        const authCode = await getAuthCode(code);

        if (!authCode) {
            const errorHtml = await loadTemplate(ERROR_TEMPLATE, {
                ERROR_TITLE: "Code invalide",
                ERROR_SUBTITLE: "Ce code d'authentification n'existe pas",
                ERROR_MESSAGE:
                    "Le code fourni n'est pas reconnu. Veuillez vérifier que vous avez utilisé le bon lien ou générer un nouveau code.",
            });
            return res.status(404).send(errorHtml);
        }

        if (authCode.expiresAt < new Date()) {
            await updateAuthCodeStatus(authCode.id, "expired");
            const expiredHtml = await loadTemplate("expired", {});
            return res.status(410).send(expiredHtml);
        }

        if (authCode.status !== "pending") {
            const errorHtml = await loadTemplate(ERROR_TEMPLATE, {
                ERROR_TITLE: "Code déjà utilisé",
                ERROR_SUBTITLE: "Ce code d'authentification a déjà été utilisé",
                ERROR_MESSAGE:
                    "Chaque code ne peut être utilisé qu'une seule fois. Veuillez générer un nouveau code depuis votre application.",
            });
            return res.status(400).send(errorHtml);
        }

        const { codeVerifier, codeChallenge } = generatePKCE();
        await updateAuthCodeVerifier(authCode.id, codeVerifier);

        if (req.session) req.session.authCode = code;

        const authCodeUrlParameters = {
            scopes: SCOPES,
            redirectUri: AZURE_REDIRECT_URI_VALUE,
            codeChallenge,
            codeChallengeMethod: "S256" as const,
        };

        const authUrlResponse = await confidentialClient.getAuthCodeUrl(
            authCodeUrlParameters
        );
        res.redirect(authUrlResponse);
    } catch (err) {
        console.error("Error starting auth flow:", err);
        const errorHtml = await loadTemplate(ERROR_TEMPLATE, {
            ERROR_TITLE: "Erreur d'authentification",
            ERROR_SUBTITLE: "Une erreur s'est produite lors du démarrage de l'authentification",
            ERROR_MESSAGE:
                "Une erreur technique s'est produite. Veuillez réessayer ou contacter un administrateur si le problème persiste.",
        });
        res.status(500).send(errorHtml);
    }
};

/**
 * Gérer le callback d'authentification Microsoft
 */
export const handleMicrosoftCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string | undefined;
    const error = req.query.error as string | undefined;
    // @ts-ignore
    const authCode = req.session?.authCode;

    if (error) {
        console.error("MSAL returned error on callback:", req.query);
        const errorHtml = await loadTemplate(ERROR_TEMPLATE, {
            ERROR_TITLE: "Erreur Microsoft",
            ERROR_SUBTITLE: "Microsoft a retourné une erreur",
            ERROR_MESSAGE:
                `Une erreur s'est produite lors de l'authentification avec Microsoft. ${req.query.error_description || "Veuillez réessayer ou contacter un administrateur."}`,
        });
        return res.status(400).send(errorHtml);
    }

    if (!code) {
        const errorHtml = await loadTemplate(ERROR_TEMPLATE, {
            ERROR_TITLE: "Code manquant",
            ERROR_SUBTITLE: "Le code d'autorisation est manquant",
            ERROR_MESSAGE:
                "Microsoft n'a pas retourné de code d'autorisation. Veuillez réessayer l'authentification.",
        });
        return res.status(400).send(errorHtml);
    }

    if (!authCode) {
        const errorHtml = await loadTemplate(ERROR_TEMPLATE, {
            ERROR_TITLE: "Session expirée",
            ERROR_SUBTITLE: "Votre session d'authentification a expiré",
            ERROR_MESSAGE:
                "La session a expiré pendant l'authentification. Veuillez recommencer le processus d'authentification.",
        });
        return res.status(400).send(errorHtml);
    }

    try {
        const authCodeRecord = await getAuthCode(authCode);

        if (!authCodeRecord?.codeVerifier) {
            const errorHtml = await loadTemplate(ERROR_TEMPLATE, {
                ERROR_TITLE: "Code invalide",
                ERROR_SUBTITLE: "Le code d'authentification est invalide",
                ERROR_MESSAGE:
                    "Le code d'authentification n'est pas valide ou a déjà été utilisé. Veuillez générer un nouveau code.",
            });
            return res.status(400).send(errorHtml);
        }

        const tokenRequest = {
            code,
            scopes: SCOPES,
            redirectUri: AZURE_REDIRECT_URI_VALUE,
            codeVerifier: authCodeRecord.codeVerifier,
        };

        const tokenResponse = await confidentialClient.acquireTokenByCode(
            tokenRequest
        );

        if (!tokenResponse) throw new Error("No token response from MSAL");

        const claims = (tokenResponse.idTokenClaims as any) || {};
        const oid = claims.oid || claims.sub;
        const email = claims.preferred_username || claims.email || null;
        const name = claims.name || null;

        if (!oid) throw new Error("No oid (object id) in token claims");

        const user = await upsertUser(oid, email, name);

        await updateAuthCodeStatus(authCodeRecord.id, "authenticated", {
            userId: user.id,
            authenticatedAt: new Date(),
        });

        if (req.session) {
            // @ts-ignore
            req.session.userId = user.id;
        }

        const successHtml = await loadTemplate("success", {
            USER_NAME: name || "Utilisateur",
            USER_EMAIL: email || "",
        });

        res.send(successHtml);
    } catch (err) {
        console.error("Error in callback processing:", err);
        const errorHtml = await loadTemplate(ERROR_TEMPLATE, {
            ERROR_TITLE: "Erreur de traitement",
            ERROR_SUBTITLE: "Une erreur s'est produite lors du traitement de l'authentification",
            ERROR_MESSAGE:
                "Impossible de finaliser l'authentification. Veuillez réessayer ou contacter un administrateur si le problème persiste.",
        });
        res.status(500).send(errorHtml);
    }
};

/**
 * Vérifier le statut d'authentification
 */
export const checkAuthStatus = async (req: Request, res: Response) => {
    const { code } = req.params;

    if (!code) {
        return res.status(400).json({
            authenticated: false,
            error: "Code parameter is required",
        });
    }

    try {
        const authCode = await getAuthCodeWithUser(code);

        if (!authCode) {
            return res.status(404).json({
                authenticated: false,
                error: "Code not found",
            });
        }

        if (authCode.expiresAt < new Date()) {
            return res.json({
                authenticated: false,
                status: "expired",
                error: "Code expired",
            });
        }

        if (authCode.status === "authenticated" && authCode.user) {
            return res.json({
                authenticated: true,
                status: "authenticated",
                user: authCode.user,
                authenticatedAt: authCode.authenticatedAt || undefined,
            });
        }

        return res.json({
            authenticated: false,
            status: authCode.status,
            message: "Waiting for user authentication",
        });
    } catch (err) {
        console.error("Error checking auth status:", err);
        res.status(500).json({ error: "Failed to check authentication status" });
    }
};

/**
 * Afficher la page des CGU
 */
export const getCgu = async (req: Request, res: Response) => {
    try {
        const cguHtml = await loadTemplate("cgu", {});
        res.send(cguHtml);
    } catch (err) {
        console.error("Error loading CGU page:", err);
        res.status(500).send("Error loading page");
    }
};
