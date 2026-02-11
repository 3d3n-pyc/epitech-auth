import type { Request, Response, NextFunction } from "express";
import { API_SECRET } from "../config/config.js";

/**
 * Middleware pour vérifier le secret API
 */
export function requireApiSecret(req: Request, res: Response, next: NextFunction) {
  const providedSecret = req.headers["x-api-secret"] as string | undefined;

  if (!API_SECRET) {
    console.error("API_SECRET is not configured in environment variables");
    return res.status(500).json({
      error: "API authentication not configured"
    });
  }

  if (!providedSecret) {
    return res.status(401).json({
      error: "Missing API secret",
      message: "The 'x-api-secret' header is required"
    });
  }

  if (providedSecret !== API_SECRET) {
    return res.status(403).json({
      error: "Invalid API secret",
      message: "The provided API secret is incorrect"
    });
  }

  next();
}
