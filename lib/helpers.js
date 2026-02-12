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
  // Nigerian phone numbers regex: ^(\+234|234|0)(70|80|81|90|91)\d{8}$
  const re = /^(\+234|234|0)(70|80|81|90|91)\d{8}$/;
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

export function normalizeForApi(phone) {
  let cleanNumber = phone.replace(/\D/g, '');
  if (cleanNumber.startsWith('234')) {
    return cleanNumber;
  }
  if (cleanNumber.startsWith('0')) {
    return '234' + cleanNumber.slice(1);
  }
  return '234' + cleanNumber;
}

export function detectNigerianNetwork(phoneNumber) {
  // 1. Remove non-digits and normalize to '080...' format
  let cleanNumber = phoneNumber.replace(/\D/g, '');

  if (cleanNumber.startsWith('234')) {
    cleanNumber = '0' + cleanNumber.slice(3);
  } else if (!cleanNumber.startsWith('0') && cleanNumber.length === 10) {
    cleanNumber = '0' + cleanNumber;
  }

  // 2. Extract the first 4 digits
  const prefix = cleanNumber.substring(0, 4);

  // 3. Define Prefix Map
  const networks = {
    MTN: ['0703', '0706', '0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906', '0913', '0916', '0702', '0704'],
    Airtel: ['0701', '0708', '0802', '0808', '0812', '0901', '0902', '0904', '0907', '0912', '0917'],
    Glo: ['0705', '0805', '0807', '0811', '0815', '0905', '0915'],
    '9mobile': ['0809', '0817', '0818', '0908', '0909']
  };

  // 4. Find the match
  for (const [network, prefixes] of Object.entries(networks)) {
    if (prefixes.includes(prefix)) {
      return network;
    }
  }

  return null;
}

export function calculateCommission(amount, percentage) {
  return (amount * percentage) / 100;
}

export function isIdempotent(key) {
  // Check if request is already processed using idempotency key
  // This would be implemented with caching (Redis) in production
  return false;
}
