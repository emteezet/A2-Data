import crypto from "crypto";

export function generateReference(prefix = "TXN") {
  const timestamp = Date.now().toString(36);
  const randomStr = crypto.randomBytes(8).toString("hex");
  return `${prefix}-${timestamp}-${randomStr}`.toUpperCase();
}

export function generateUniqueCode(length = 12) {
  return crypto
    .randomBytes(length / 2)
    .toString("hex")
    .toUpperCase();
}

export function hashPassword(password) {
  // This should use bcryptjs in production
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhoneNumber(phone) {
  // Nigerian phone numbers
  const re = /^(\+234|0)[789]\d{9}$/;
  return re.test(phone.replace(/\s/g, ""));
}

export function normalizePhoneNumber(phone) {
  let normalized = phone.replace(/\s/g, "");
  if (normalized.startsWith("+234")) {
    return normalized;
  }
  if (normalized.startsWith("0")) {
    return "+234" + normalized.substring(1);
  }
  if (normalized.startsWith("234")) {
    return "+" + normalized;
  }
  return "+234" + normalized;
}

export function calculateCommission(amount, percentage) {
  return (amount * percentage) / 100;
}

export function isIdempotent(key) {
  // Check if request is already processed using idempotency key
  // This would be implemented with caching (Redis) in production
  return false;
}
