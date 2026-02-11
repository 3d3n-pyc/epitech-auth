import express from "express";
import authRouter from "./routes/auth.routes.js";
import { sessionMiddleware } from "./middleware/session.js";
import { loadTemplate } from "./utils/helpers.js";
import { PORT } from "./config/config.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, "..", "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(authRouter);

app.use(async (req, res) => {
  const notFoundHtml = await loadTemplate("notfound", {});
  res.status(404).send(notFoundHtml);
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
