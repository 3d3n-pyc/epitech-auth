import { PrismaClient } from "@prisma/client";
import * as msal from "@azure/msal-node";
import dotenv from "dotenv";

dotenv.config();

export const prisma = new PrismaClient();

const {
  AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET,
  AZURE_TENANT_ID,
  BASE_URL,
} = process.env;

if (!AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET || !AZURE_TENANT_ID || !BASE_URL) {
  throw new Error("Missing required Azure environment variables");
}

const msalConfig: msal.Configuration = {
  auth: {
    clientId: AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`,
    clientSecret: AZURE_CLIENT_SECRET,
  },
};

export const confidentialClient = new msal.ConfidentialClientApplication(msalConfig);

export const SCOPES = ["openid", "profile", "email", "User.Read"];
export const AZURE_REDIRECT_URI_VALUE = BASE_URL + "/auth/microsoft/callback";
export const AZURE_TENANT_ID_VALUE = AZURE_TENANT_ID;

export const BASE_URL_VALUE = BASE_URL;

export const API_SECRET = process.env.API_SECRET || "";

export const PORT = Number.parseInt(process.env.PORT || "3000", 10);
