import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

// Ensure upload directories exist
const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads", "receipts");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, WebP, and HEIC allowed.")
    );
  }
};

export const receiptUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

/**
 * Process and optimize uploaded receipt image for better OCR.
 * Returns path to the processed image.
 */
export async function processReceiptImage(filePath: string): Promise<string> {
  const ext = path.extname(filePath);
  const outputPath = filePath.replace(ext, "_processed.jpg");

  await sharp(filePath)
    .rotate() // Auto-rotate based on EXIF
    .resize(1200, 1600, { fit: "inside", withoutEnlargement: true })
    .normalize() // Improve contrast for OCR
    .sharpen()
    .jpeg({ quality: 85 })
    .toFile(outputPath);

  // Remove original, keep processed
  try {
    fs.unlinkSync(filePath);
  } catch (e) {
    // Ignore if original can't be deleted
  }

  return outputPath;
}

/**
 * Get relative path from absolute path for storage in DB.
 */
export function getRelativePath(absolutePath: string): string {
  return path.relative(process.cwd(), absolutePath);
}

/**
 * Get absolute path from relative path stored in DB.
 */
export function getAbsolutePath(relativePath: string): string {
  return path.join(process.cwd(), relativePath);
}
