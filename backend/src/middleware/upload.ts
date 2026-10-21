import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../utils/errors.js";

export const uploadsDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${uuidv4()}${extension}`);
  },
});

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);

export const uploadReceipt = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype) && !file.mimetype.startsWith("image/")) {
      cb(new AppError("Only image files can be uploaded as receipts", 400));
      return;
    }
    cb(null, true);
  },
});
