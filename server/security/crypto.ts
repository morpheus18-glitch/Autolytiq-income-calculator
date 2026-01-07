import crypto from "crypto";

// Use environment variable or generate a secure key
// In production, this MUST be set via environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// Derive a key from the master key using PBKDF2
function deriveKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, ITERATIONS, KEY_LENGTH, "sha512");
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * Returns: salt:iv:authTag:encryptedData (all base64)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return "";

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Combine all parts: salt:iv:authTag:encrypted
  return [
    salt.toString("base64"),
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted,
  ].join(":");
}

/**
 * Decrypt data encrypted with encrypt()
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return "";

  const parts = encryptedData.split(":");
  if (parts.length !== 4) {
    throw new Error("Invalid encrypted data format");
  }

  const [saltB64, ivB64, authTagB64, encrypted] = parts;

  const salt = Buffer.from(saltB64, "base64");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const key = deriveKey(salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Hash sensitive data for comparison (one-way)
 */
export function hashData(data: string): string {
  return crypto
    .createHash("sha256")
    .update(data + ENCRYPTION_KEY)
    .digest("hex");
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// Warn if using auto-generated key in production
if (!process.env.ENCRYPTION_KEY && process.env.NODE_ENV === "production") {
  console.warn(
    "⚠️  WARNING: ENCRYPTION_KEY not set! Using auto-generated key. " +
    "Data will be unrecoverable after restart. Set ENCRYPTION_KEY environment variable."
  );
}
