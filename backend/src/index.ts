import path from "node:path";
import cors from "cors";
import express from "express";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { uploadsDir } from "./middleware/upload.js";
import { initializeModels, sequelize } from "./models/index.js";
import { authRouter } from "./routes/auth.js";
import { loanRouter } from "./routes/loans.js";

initializeModels();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "miniledger-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/loans", loanRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const start = async (): Promise<void> => {
  await connectDatabase();
  await sequelize.sync({ alter: env.nodeEnv !== "production" });
  app.listen(env.port, () => {
    console.log(`MiniLedger API listening on http://localhost:${env.port}`);
    console.log(`Receipt uploads directory: ${path.resolve(uploadsDir)}`);
  });
};

void start().catch((error: unknown) => {
  console.error("Failed to start MiniLedger API", error);
  process.exit(1);
});
