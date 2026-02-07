# DataApp API Documentation

Complete API reference for all endpoints with examples.

## Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User

**POST** `/api/auth`

Register a new user account.

**Request:**

```json
{
  "action": "register",
  "email": "user@example.com",
  "password": "password123",
  "phone": "08012345678",
  "name": "John Doe"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**

- `400` - Invalid email/phone format or duplicate account
- `500` - Server error

---

### Login User

**POST** `/api/auth`

Login to existing account.

**Request:**

```json
{
  "action": "login",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**

- `400` - Email/password required
- `401` - Invalid credentials
- `403` - Account suspended

---

## Wallet Endpoints

### Get Wallet Balance

**GET** `/api/wallet`

Get current wallet balance and statistics.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "balance": 5000,
    "totalFunded": 50000,
    "totalSpent": 45000,
    "lastFundedAt": "2026-01-31T10:30:00Z",
    "status": "active",
    "createdAt": "2026-01-15T08:00:00Z",
    "updatedAt": "2026-01-31T10:30:00Z"
  }
}
```

**Errors:**

- `401` - Unauthorized
- `404` - Wallet not found

---

### Fund Wallet

**POST** `/api/wallet`

Add funds to wallet (requires Paystack integration).

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "action": "fund",
  "amount": 10000
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Wallet funded",
  "data": {
    "newBalance": 15000,
    "totalFunded": 60000
  }
}
```

**Errors:**

- `400` - Invalid amount (must be > 0)
- `401` - Unauthorized
- `404` - Wallet not found

---

### Get Wallet Transaction History

**POST** `/api/wallet`

Retrieve transaction history for wallet.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "action": "history",
  "limit": 50,
  "skip": 0
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "reference": "DATA-XXXX-YYYY",
        "phoneNumber": "08012345678",
        "amount": 500,
        "status": "success",
        "dataPlanId": {
          "name": "MTN 1GB"
        },
        "networkId": {
          "name": "MTN"
        },
        "createdAt": "2026-01-31T10:00:00Z"
      }
    ],
    "total": 45,
    "limit": 50,
    "skip": 0
  }
}
```

---

## Data/Network Endpoints

### Get All Networks

**GET** `/api/data`

Get list of available networks.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "MTN",
      "code": "mtn",
      "commissionPercentage": 10,
      "isActive": true
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "name": "Airtel",
      "code": "airtel",
      "commissionPercentage": 10,
      "isActive": true
    }
  ]
}
```

---

### Get Data Plans by Network

**GET** `/api/data/:networkId`

Get all data plans for a specific network.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "name": "MTN 1GB",
      "dataSize": "1GB",
      "price": 500,
      "validity": "30 days",
      "networkId": "507f1f77bcf86cd799439014"
    },
    {
      "_id": "507f1f77bcf86cd799439017",
      "name": "MTN 2GB",
      "dataSize": "2GB",
      "price": 1000,
      "validity": "30 days",
      "networkId": "507f1f77bcf86cd799439014"
    }
  ]
}
```

**Errors:**

- `404` - Network not found

---

### Purchase Data

**POST** `/api/data`

Buy data for a phone number.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "action": "purchase",
  "dataPlanId": "507f1f77bcf86cd799439016",
  "phoneNumber": "08012345678"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Purchase successful",
  "data": {
    "transactionId": "507f1f77bcf86cd799439018",
    "reference": "DATA-XXXXXXXXXXXX",
    "status": "success"
  }
}
```

**Response (202):**

```json
{
  "success": false,
  "message": "Purchase initiated",
  "data": {
    "transactionId": "507f1f77bcf86cd799439018",
    "reference": "DATA-XXXXXXXXXXXX",
    "status": "pending"
  }
}
```

**Errors:**

- `400` - Insufficient wallet balance or invalid data plan
- `401` - Unauthorized
- `404` - Data plan not found

---

### Get Transaction Details

**POST** `/api/data`

Get detailed information about a transaction.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "action": "transaction-details",
  "transactionId": "507f1f77bcf86cd799439018"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439018",
    "reference": "DATA-XXXXXXXXXXXX",
    "userId": {
      "name": "John Doe",
      "email": "user@example.com"
    },
    "phoneNumber": "08012345678",
    "amount": 500,
    "status": "success",
    "providerStatus": "delivered",
    "platformCommission": 25,
    "agentProfit": 475,
    "dataPlanId": {
      "name": "MTN 1GB",
      "dataSize": "1GB"
    },
    "networkId": {
      "name": "MTN"
    },
    "createdAt": "2026-01-31T10:00:00Z"
  }
}
```

**Errors:**

- `401` - Unauthorized
- `404` - Transaction not found

---

## Payment Endpoints

### Initialize Payment

**POST** `/api/wallet/paystack`

Initialize a Paystack payment.

**Request:**

```json
{
  "action": "initialize",
  "email": "user@example.com",
  "amount": 10000,
  "metadata": {
    "purpose": "wallet_funding"
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "xxxxxxxxxx",
    "reference": "PSK-XXXXXXXXXXXX"
  }
}
```

**Errors:**

- `400` - Invalid email or amount

---

### Verify Payment

**POST** `/api/wallet/paystack`

Verify a Paystack payment after redirect.

**Request:**

```json
{
  "action": "verify",
  "reference": "PSK-XXXXXXXXXXXX"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "reference": "PSK-XXXXXXXXXXXX",
    "amount": 10000,
    "status": "success",
    "message": "Approved",
    "customer": {
      "email": "user@example.com"
    }
  }
}
```

**Errors:**

- `400` - Invalid reference

---

## Admin Endpoints

### Get Dashboard Summary

**GET** `/api/admin?section=dashboard`

Get dashboard statistics (Admin/Agent only).

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "totalTransactions": 250,
    "successfulTransactions": 248,
    "totalCommission": 12500,
    "recentTransactions": [
      {
        "_id": "507f1f77bcf86cd799439018",
        "reference": "DATA-XXXXXXXXXXXX",
        "userId": { "name": "John Doe" },
        "amount": 500,
        "status": "success",
        "networkId": { "name": "MTN" }
      }
    ]
  }
}
```

**Errors:**

- `401` - Unauthorized
- `403` - Insufficient permissions

---

### Get All Transactions

**GET** `/api/admin?section=transactions&limit=50&status=success`

Get transaction list with filters.

**Query Parameters:**

- `limit` - Number of transactions (default: 50)
- `skip` - Offset for pagination (default: 0)
- `status` - Filter by status (pending|success|failed|refunded)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "total": 250
  }
}
```

---

### Get Commission Logs

**GET** `/api/admin?section=commissions&limit=50`

Get commission tracking data.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "commissions": [
      {
        "_id": "507f1f77bcf86cd799439019",
        "transactionId": { "reference": "DATA-XXXX" },
        "amount": 25,
        "percentage": 5,
        "status": "pending",
        "createdAt": "2026-01-31T10:00:00Z"
      }
    ],
    "total": 248,
    "totalAmount": 12400
  }
}
```

---

### Create Data Plan

**POST** `/api/admin`

Create a new data plan (Admin only).

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**

```json
{
  "action": "create-data-plan",
  "networkId": "507f1f77bcf86cd799439014",
  "name": "MTN 1GB",
  "dataSize": "1GB",
  "price": 500,
  "validity": "30 days",
  "providerCode": "MTN1GB"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Data plan created",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "networkId": "507f1f77bcf86cd799439014",
    "name": "MTN 1GB",
    ...
  }
}
```

---

### Update Data Plan

**POST** `/api/admin`

Update an existing data plan.

**Request:**

```json
{
  "action": "update-data-plan",
  "planId": "507f1f77bcf86cd799439016",
  "price": 550,
  "isActive": true
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Plan updated",
  "data": { ... }
}
```

---

### Create Network

**POST** `/api/admin`

Create a new network (Admin only).

**Request:**

```json
{
  "action": "create-network",
  "name": "MTN",
  "code": "mtn",
  "commissionPercentage": 10,
  "providerCode": "mtn-ng"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Network created",
  "data": { ... }
}
```

---

### Process Manual Refund

**POST** `/api/admin`

Process a manual refund for a transaction (Admin only).

**Request:**

```json
{
  "action": "manual-refund",
  "transactionId": "507f1f77bcf86cd799439018",
  "reason": "Customer requested refund"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Refund processed",
  "data": {
    "_id": "507f1f77bcf86cd799439018",
    "status": "refunded",
    "errorMessage": "Customer requested refund"
  }
}
```

---

## Webhook Endpoints

### Paystack Webhook

**POST** `/api/webhooks/paystack`

Paystack webhook for payment confirmation.

**Headers (from Paystack):**

```
x-paystack-signature: <signature>
Content-Type: application/json
```

**Payload:**

```json
{
  "event": "charge.success",
  "data": {
    "reference": "PSK-XXXXXXXXXXXX",
    "amount": 1000000,
    "customer": {
      "email": "user@example.com"
    }
  }
}
```

**Response:**

```json
{
  "status": "ok"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": null,
  "statusCode": 400
}
```

### Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 202  | Accepted (processing) |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 429  | Too Many Requests     |
| 500  | Server Error          |

---

## Rate Limiting

All public endpoints are rate limited:

- **100 requests** per minute per IP
- Returns `429` when exceeded

---

## Examples Using cURL

### Register

```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "email": "user@example.com",
    "password": "password123",
    "phone": "08012345678",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Wallet (with token)

```bash
curl -X GET http://localhost:3000/api/wallet \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Purchase Data

```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "action": "purchase",
    "dataPlanId": "507f1f77bcf86cd799439016",
    "phoneNumber": "08012345678"
  }'
```

---

**Last Updated**: January 2026
**API Version**: 1.0.0
