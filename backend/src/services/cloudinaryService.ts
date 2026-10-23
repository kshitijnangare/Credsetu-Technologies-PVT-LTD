import { Readable } from "node:stream";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

type UploadResult = {
  secure_url: string;
};

export const uploadReceiptBuffer = async (
  buffer: Buffer,
  mimeType: string,
): Promise<string> => {
  if (!isCloudinaryConfigured()) {
    throw new AppError(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      500,
    );
  }

  const uploaded = await new Promise<UploadResult>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinaryFolder,
        resource_type: "image",
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary did not return a receipt URL"));
          return;
        }
        resolve({ secure_url: result.secure_url });
      },
    );

    Readable.from(buffer).pipe(stream);
  });

  void mimeType;
  return uploaded.secure_url;
};
