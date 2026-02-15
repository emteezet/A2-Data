# Technical Explanation of A2 Data App Logic

This document provides a detailed explanation of how the application handles payment verification, transaction storage, duplicate requests, and vendor API timeouts.

## 1. Where is Payment Verification Handled?

Payment verification is primarily managed through two mechanisms: **Direct API Verification** and **Secure Webhooks**.

### A. Direct Verification
When a payment is initialized, the application can verify its status using the Paystack API. This is implemented in [paystackService.js](file:///c:/Users/abdul/Music/Web%20apps/A2%20Data/services/paystackService.js):

- **Function**: `verifyPayment(reference)`
- **Process**: Calls Paystack's GET `/transaction/verify/:reference` endpoint using the secret key for authorization.

### B. Webhook Verification
For asynchronous payment updates (e.g., when a user pays and the gateway notifies the app), a webhook is used.
- **Route**: [app/api/webhooks/paystack/route.js](file:///c:/Users/abdul/Music/Web%20apps/A2%20Data/app/api/webhooks/paystack/route.js)
- **Security**: The app validates the `x-paystack-signature` header using HMAC SHA512 to ensure the request truly came from Paystack.
- **Service**: [paystackService.js](file:///c:/Users/abdul/Music/Web%20apps/A2%20Data/services/paystackService.js#L78) - `handlePaystackWebhook(payload, signature)` processes the event and updates the database.

---

## 2. Where are Transactions Stored?

Transactions are stored in a **MongoDB** database using **Mongoose** for schema enforcement.

- **Model**: [models/Transaction.js](file:///c:/Users/abdul/Music/Web%20apps/A2%20Data/models/Transaction.js)
- **Key Fields**:
    - `reference`: Unique app-side reference (e.g., DATA-K6O-...).
    - `paystackReference`: The reference from the payment gateway.
    - `providerReference`: The reference from the data/airtime provider (e.g., MobileNig).
    - `status`: Tracks the app-level state (`pending`, `success`, `failed`, `refunded`).
    - `providerStatus`: Tracks the vendor-level state (`delivered`, `failed`, `retry`).

Transactions are created in [services/dataService.js](file:///c:/Users/abdul/Music/Web%20apps/A2%20Data/services/dataService.js) for purchases and [services/walletService.js](file:///c:/Users/abdul/Music/Web%20apps/A2%20Data/services/walletService.js) for funding.

---

## 3. How are Duplicate Requests Handled?

The application employs multiple layers of protection against duplicate transactions (Idempotency):

1. **Database Uniqueness**: The `reference` field in the `Transaction` model is marked as `unique: true`. If a duplicate request attempts to create a transaction with the same reference, MongoDB will reject it.
2. **Reference Lookup**: Before processing webhooks or vendor updates, the system searches for an existing transaction using the reference provided. If found, it updates the existing record instead of creating a new one.
3. **Reference Generation**: Every new purchase generates a fresh, unique reference using a timestamp and random string (see [lib/helpers.js](file:///c:/Users/abdul/Music/Web%20apps/A2%20Data/lib/helpers.js#L3)).
4. **Idempotency Logic**: There are hooks for an `isIdempotent` check in the services (e.g., [walletService.js](file:///c:/Users/abdul/Music/Web%20apps/A2%20Data/services/walletService.js#L127)) which are designed to be integrated with a cache like Redis for high-frequency protection.

---

## 4. What Happens if Vendor API Times Out?

The application is built to handle vendor latency and failures gracefully:

### A. Request Timeouts
Requests to vendors (like MobileNig) in [dataProvider.js](file:///c:/Users/abdul/Music/Web%20apps/A2%20Data/services/dataProvider.js) have a defined timeout (e.g., `15000ms` or 15 seconds). If the vendor doesn't respond in time, Axios throws an error.

### B. Error Catching
All vendor interactions are wrapped in `try-catch` blocks. A timeout is caught and treated as a `failed` attempt.

### C. Automatic Refunds
If a purchase attempt fails at the provider level (including timeouts):
1. The transaction status is set to `FAILED`.
2. The user's wallet is **automatically refunded** for the deducted amount.
3. This logic is found in [dataService.js](file:///c:/Users/abdul/Music/Web%20apps/A2%20Data/services/dataService.js#L180-L183).

### D. Retry Mechanism
Failed or timed-out transactions can be re-attempted via the `retryFailedTransaction` function in `dataService.js`, which allows for a controlled number of retries (`MAX_RETRIES`).
