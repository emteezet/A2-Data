# DataApp - Authentication & Security Guide

## Authentication Overview

DataApp uses JWT (JSON Web Token) for stateless authentication. Each user receives a token upon login that must be included in subsequent requests.

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  1. User registers/logs in                               │
│     POST /api/auth                                       │
│     { action: "login", email, password }                 │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  2. Server validates credentials                         │
│     - Check email exists                                 │
│     - Verify password hash                               │
│     - Check account status                               │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  3. Server generates JWT token                           │
│     - Payload: {userId, email, role}                     │
│     - Sign with JWT_SECRET                               │
│     - Set expiry: JWT_EXPIRY (7d)                        │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  4. Return token to client                               │
│     {                                                    │
│       success: true,                                     │
│       data: {                                            │
│         token: "eyJhbGc...",                             │
│         userId: "...",                                   │
│         role: "customer"                                 │
│       }                                                  │
│     }                                                    │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  5. Client stores token (localStorage)                   │
│     localStorage.setItem('token', token)                 │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  6. Client includes token in requests                    │
│     Authorization: Bearer eyJhbGc...                     │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  7. Server verifies token                                │
│     - Extract from Authorization header                  │
│     - Verify signature with JWT_SECRET                   │
│     - Check expiry                                       │
│     - Decode payload                                     │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  8. Token valid → Access allowed                         │
│     Token expired → Redirect to login                    │
│     Token invalid → 401 Unauthorized                     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Registration

### Endpoint

```
POST /api/auth
```

### Request

```json
{
  "action": "register",
  "email": "user@example.com",
  "password": "password123",
  "phone": "08012345678",
  "name": "John Doe"
}
```

### Validation Rules

**Email**

- Must be valid format (contains @ and .)
- Must be unique in database
- Converted to lowercase

**Phone**

- Nigerian format required
- Valid formats:
  - +2348012345678
  - 08012345678
  - 234801234567
- Normalized to +234 format

**Password**

- Minimum 6 characters
- Stored as SHA256 hash (production: use bcrypt)
- Never stored in plain text

**Name**

- Required, non-empty
- No validation on format

### Response (201)

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

### Errors

```
400 - Invalid email format
400 - Invalid phone number format
400 - Password must be at least 6 characters
400 - User already exists
500 - Server error
```

---

## Login

### Endpoint

```
POST /api/auth
```

### Request

```json
{
  "action": "login",
  "email": "user@example.com",
  "password": "password123"
}
```

### Validation

1. Email must exist in database
2. Password hash must match stored hash
3. Account status must be "active"

### Response (200)

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

### Errors

```
400 - Email and password required
401 - Invalid credentials
403 - Account is not active
500 - Server error
```

---

## JWT Token Structure

### Header

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "customer",
  "iat": 1675116600,
  "exp": 1675721400
}
```

### Signature

```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_SECRET
)
```

---

## Using Authentication

### Store Token (Frontend)

```javascript
// After successful login
const response = await fetch("/api/auth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "login",
    email: "user@example.com",
    password: "password123",
  }),
});

const data = await response.json();

// Store token
localStorage.setItem("token", data.data.token);
localStorage.setItem("user", JSON.stringify(data.data));
```

### Send Token (Frontend)

```javascript
// Include in API requests
const token = localStorage.getItem("token");

const response = await fetch("/api/wallet", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

### Verify Token (Backend)

```javascript
// In API route
const token = request.headers.get("authorization")?.split(" ")[1];

if (!token) {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

try {
  const decoded = verifyToken(token);
  request.user = decoded;
  // Continue to handler
} catch (error) {
  return Response.json({ error: "Invalid token" }, { status: 401 });
}
```

---

## Token Expiry & Refresh

### Token Expiration

- Default: 7 days (set by `JWT_EXPIRY=7d`)
- After expiry: User must login again
- No refresh token mechanism (stateless)

### Handling Expired Tokens

```javascript
// Frontend error handling
const handleApiError = (error) => {
  if (error.statusCode === 401) {
    // Token expired
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth";
  }
};
```

### Change Token Expiry

Edit `.env.local`:

```env
JWT_EXPIRY=30d      # 30 days
JWT_EXPIRY=1d       # 1 day
JWT_EXPIRY=12h      # 12 hours
```

---

## Role-Based Access Control

### User Roles

1. **customer** - Regular users who buy data
2. **agent** - Can manage transactions
3. **admin** - Full platform access

### Role Restrictions

**Customer (default)**

- Access: /dashboard
- Can: Buy data, view balance, transactions
- Cannot: Access /admin

**Agent**

- Access: /admin, /dashboard
- Can: All customer features + manage transactions
- Cannot: Create networks, system settings

**Admin**

- Access: All routes
- Can: Everything
- Cannot: Nothing (full access)

### Checking Role (Backend)

```javascript
// Middleware example
if (request.user.role !== "admin") {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
```

---

## Password Security

### Hashing Algorithm

```javascript
// Current (SHA256 - development)
const hash = crypto.createHash("sha256").update(password).digest("hex");

// Production (bcryptjs - recommended)
const hash = await bcrypt.hash(password, 10);
```

### Password Best Practices

- ✅ Always hash passwords
- ✅ Never store plain text
- ✅ Use strong hashing (bcrypt in production)
- ✅ Require minimum 6 characters
- ✅ Consider password strength meter
- ✅ Implement password reset flow

### Updating to bcryptjs (Production)

```bash
npm install bcryptjs
```

```javascript
// In authService.js
import bcrypt from "bcryptjs";

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const isMatch = await bcrypt.compare(password, user.password);
```

---

## Webhook Security

### Signature Verification

```javascript
// Paystack sends signature in header
const signature = request.headers.get("x-paystack-signature");

// Verify signature
const hash = crypto
  .createHmac("sha512", PAYSTACK_SECRET_KEY)
  .update(JSON.stringify(payload))
  .digest("hex");

const isValid = hash === signature;
```

### Why Signature Verification?

- Confirms webhook came from Paystack
- Prevents unauthorized webhooks
- Ensures data hasn't been tampered

---

## Security Checklist

### Development

- ✅ Use test credentials only
- ✅ JWT_SECRET can be simple
- ✅ HTTP is fine for localhost

### Production

- ✅ Change JWT_SECRET to random string
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- ✅ Enable HTTPS only
- ✅ Use live Paystack keys
- ✅ Enable MongoDB authentication
- ✅ Setup firewall rules
- ✅ Regular security audits
- ✅ Monitor failed login attempts
- ✅ Implement brute force protection

---

## Common Authentication Issues

### "Invalid token" Error

```
Possible causes:
- Token expired
- JWT_SECRET changed
- Token tampered with
- Wrong secret in .env

Solution:
- User logs in again
- Don't change JWT_SECRET after tokens generated
- Verify .env variables
```

### "Unauthorized" Error

```
Possible causes:
- No token in header
- Token missing Authorization header
- Wrong header format

Solution:
- Include: Authorization: Bearer <token>
- Don't include "Bearer" twice
- Check token is not truncated
```

### "Token validation failed"

```
Possible causes:
- Wrong JWT_SECRET
- Token from different app

Solution:
- Ensure JWT_SECRET is correct
- Only use tokens from same app
- Test with different secret
```

---

## Testing Authentication

### Test Registration

```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "email": "test@example.com",
    "password": "123456",
    "phone": "08012345678",
    "name": "Test User"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "test@example.com",
    "password": "123456"
  }'
```

### Test Protected Endpoint

```bash
# Extract token from login response
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X GET http://localhost:3000/api/wallet \
  -H "Authorization: Bearer $TOKEN"
```

---

## Advanced Topics

### Session Management

- No sessions (stateless JWT)
- Client stores token
- Token expires after JWT_EXPIRY
- Logout just removes client-side token

### Token Refresh

- Current system: No refresh tokens
- User logs in again when expired
- Consider implementing refresh tokens for production

### Multi-Device Support

- Each device has separate token
- Logging out device-by-device
- Or logout all (need token revocation list)

### Security Events

- Log all login attempts
- Monitor failed logins
- Alert on suspicious activity
- Track token usage

---

## Performance Considerations

### Token Verification

- Done on every protected request
- Cached in request object
- No database lookup (stateless)
- Very fast operation

### Optimization

- Minimize payload size
- Don't include sensitive data in token
- Use middleware for repeated verification
- Consider token caching in Redis (production)

---

## Compliance & Standards

- **JWT Standard**: RFC 7519
- **HS256 Algorithm**: HMAC with SHA-256
- **OWASP**: Follows security guidelines
- **Industry Standard**: Used by major platforms

---

## Migration Path

### From Test to Production

1. **Update JWT_SECRET**

   ```bash
   # Generate random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

   # Update .env
   JWT_SECRET=<generated-value>
   ```

2. **Upgrade Password Hashing**

   ```bash
   npm install bcryptjs
   # Update authService.js to use bcrypt
   ```

3. **Enable HTTPS**
   - Get SSL certificate
   - Force HTTPS redirects
   - Update API_BASE_URL to https://

4. **Add Token Revocation**
   - Implement logout blacklist (Redis)
   - Check blacklist on token verification

5. **Monitoring**
   - Log all auth events
   - Monitor for suspicious patterns
   - Setup alerts

---

**Last Updated**: January 2026
**Status**: Complete Security & Auth Guide
