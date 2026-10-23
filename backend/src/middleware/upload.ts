import multer from "multer";
import { AppError } from "../utils/errors.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/jpg"]);

export const uploadReceipt = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype) && !file.mimetype.startsWith("image/")) {
      cb(new AppError("Only image files can be uploaded as receipts", 400));
      return;
    }
    cb(null, true);
  },
});
