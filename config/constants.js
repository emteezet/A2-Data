export const NETWORKS = {
  MTN: { code: "mtn", name: "MTN", providerCode: "mtn-ng" },
  AIRTEL: { code: "airtel", name: "Airtel", providerCode: "airtel-ng" },
  GLO: { code: "glo", name: "Glo", providerCode: "glo-ng" },
  MOBILE9: { code: "9mobile", name: "9mobile", providerCode: "9mobile-ng" },
};

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const TRANSACTION_TYPE = {
  PURCHASE: "purchase",
  FUNDING: "funding",
};

export const PROVIDER_STATUS = {
  PENDING: "pending",
  DELIVERED: "delivered",
  FAILED: "failed",
  RETRY: "retry",
};

export const PAYMENT_METHOD = {
  WALLET: "wallet",
  PAYSTACK: "paystack",
};

export const USER_ROLE = {
  CUSTOMER: "customer",
  AGENT: "agent",
  ADMIN: "admin",
};

export const WALLET_STATUS = {
  ACTIVE: "active",
  FROZEN: "frozen",
  SUSPENDED: "suspended",
};

export const COMMISSION_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  REVERSED: "reversed",
};

export const MAX_RETRIES = 3;
export const RETRY_DELAY = 5000; // 5 seconds
