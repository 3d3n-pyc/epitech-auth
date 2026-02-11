import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

const { SESSION_SECRET } = process.env;

if (!SESSION_SECRET) {
  throw new Error("Missing SESSION_SECRET environment variable");
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
    authCode?: string;
  }
}

export const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
});
