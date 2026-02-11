import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let appVersion = "";
try {
  const packageJson = JSON.parse(
    await readFile(join(__dirname, "..", "..", "package.json"), "utf-8")
  );
  appVersion = packageJson.version;
} catch (err) {
  console.error("Failed to load app version:", err);
}

/**
 * Charger un template HTML
 */
export async function loadTemplate(
  templateName: string,
  replacements: Record<string, string>
): Promise<string> {
  let html = await readFile(
    join(__dirname, "..", "views", `${templateName}.html`),
    "utf-8"
  );

  const logoHtml = await readFile(
    join(__dirname, "..", "views", "components", "logo.html"),
    "utf-8"
  );
  html = html.replace("{{LOGO}}", logoHtml);

  const versionHtml = appVersion
    ? `<div class="app-version">v${appVersion}</div>`
    : "";
  html = html.replace("{{APP_VERSION}}", versionHtml);

  for (const [key, value] of Object.entries(replacements)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }

  return html;
}

/**
 * Générer un code d'authentification
 */
export function generateAuthCode(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Générer un code PKCE
 */
export function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  return { codeVerifier, codeChallenge };
}
