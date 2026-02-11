import express from "express";

/**
 * Middleware pour vérifier l'authentification
 */
export function ensureAuthenticated(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).send("Unauthorized");
}
