import express from "express";
import { requireApiSecret } from "../middleware/apiAuth.js";
import {
  generateCode,
  startMicrosoftAuth,
  handleMicrosoftCallback,
  checkAuthStatus,
  getCgu,
} from "../controllers/auth.controller.js";

const router = express.Router();

/**
 * @route POST /auth/generate-code
 * @desc Générer un code d'authentification temporaire et une URL d'authentification
 * @access Private (API Secret)
 */
router.post("/auth/generate-code", requireApiSecret, generateCode);

/**
 * @route GET /auth/microsoft
 * @desc Démarrer le flux d'authentification Microsoft
 * @access Public
 */
router.get("/auth/microsoft", startMicrosoftAuth);

/**
 * @route GET /auth/microsoft/callback
 * @desc Gérer le callback d'authentification Microsoft
 * @access Public
 */
router.get("/auth/microsoft/callback", handleMicrosoftCallback);

/**
 * @route GET /auth/check/:code
 * @desc Vérifier le statut d'authentification
 * @access Private (API Secret)
 */
router.get("/auth/check/:code", requireApiSecret, checkAuthStatus);

/**
 * @route GET /cgu
 * @desc Afficher les TOS
 * @access Public
 */
router.get("/cgu", getCgu);

export default router;

