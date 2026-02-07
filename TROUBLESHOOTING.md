# DataApp - FAQ & Troubleshooting

## Frequently Asked Questions

### General Questions

**Q: Is this production-ready?**
A: Yes! This is a complete, production-grade system. Just configure .env, setup MongoDB, and deploy.

**Q: Can I change the commission percentage?**
A: Yes! Edit `PLATFORM_COMMISSION_PERCENTAGE` in .env.local. Default is 5%.

**Q: Can I add more networks?**
A: Yes! Use the admin dashboard API or `npm run seed` to add MTN, Airtel, Glo, 9mobile.

**Q: How is data actually delivered?**
A: The `dataProvider` service abstracts provider APIs. Configure `DATA_PROVIDER_URL` and `DATA_PROVIDER_API_KEY` with your actual data provider.

**Q: Can users buy data without an account?**
A: Yes! Guest checkout is supported. Users don't need accounts for their first purchase.

---

## Troubleshooting

### Installation Issues

#### Problem: `npm install` fails

```
Error: cannot find module 'mongoose'
```

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -r node_modules package-lock.json

# Reinstall
npm install
```

#### Problem: Node version mismatch

```
Error: requires node 18+
```

**Solution:**

```bash
# Check Node version
node --version

# Update Node to 18+
# Visit https://nodejs.org/ and install latest LTS
```

---

### Database Issues

#### Problem: "Cannot connect to MongoDB"

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

1. Make sure MongoDB is running:

```bash
# For local MongoDB
mongod

# For MongoDB Atlas, test connection string:
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/dataapp"
```

2. Verify `MONGODB_URI` in `.env.local`

```env
# Local
MONGODB_URI=mongodb://localhost:27017/dataapp

# Cloud
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dataapp
```

#### Problem: "Database initialization failed"

```
Error: collection validation failed
```

**Solution:**

```bash
# Delete the database and reinitialize
# In MongoDB:
use dataapp
db.dropDatabase()

# Then run:
npm run init
npm run seed
```

#### Problem: "Query timeout"

```
MongooseError: Query takes too long
```

**Solution:**

1. Check indexes are created:

```bash
mongosh
use dataapp
db.transactions.getIndexes()
```

2. Restart MongoDB and app:

```bash
# Kill all Node processes
# Restart mongod
# npm run dev
```

---

### Authentication Issues

#### Problem: "Invalid credentials"

```
Login returns 401 Unauthorized
```

**Solution:**

1. Verify user exists:

```bash
mongosh
use dataapp
db.users.findOne({email: "user@example.com"})
```

2. Check password:

```bash
# Password is SHA256 hashed
# Test with correct credentials
```

#### Problem: "Token expired"

```
Error: Invalid or expired token
```

**Solution:**

1. Generate new token by logging in again
2. Adjust `JWT_EXPIRY` in .env.local if needed:

```env
JWT_EXPIRY=7d    # 7 days (default)
JWT_EXPIRY=30d   # 30 days
```

#### Problem: "Token validation failed"

```
Error: jwt malformed / jwt signature verification failed
```

**Solution:**

1. Verify `JWT_SECRET` is set in .env.local:

```env
JWT_SECRET=your_secret_key_here
```

2. Make sure you're not editing the secret after tokens are generated
3. Restart server after changing JWT_SECRET

---

### Payment Issues

#### Problem: "Paystack initialization fails"

```
Error: Unauthorized / Invalid key
```

**Solution:**

1. Verify Paystack credentials:

```env
# Should be TEST credentials during development
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxx
PAYSTACK_SECRET_KEY=sk_test_xxxx

# Check they're not swapped (public vs secret)
```

2. Verify credentials are from https://paystack.com/settings

3. Restart server after changing .env:

```bash
npm run dev
```

#### Problem: "Webhook not received"

```
Webhook status: failed / not processed
```

**Solution:**

1. Check webhook URL in Paystack:
   - Settings → API Keys & Webhooks
   - URL should be: `https://yourdomain.com/api/webhooks/paystack`

2. Verify signature verification:

```bash
# Check WebhookLog collection
use dataapp
db.webhooklogs.findOne({status: "failed"})
```

3. Check server logs for webhook errors:

```bash
# In development console output
# Look for "Webhook error:" messages
```

#### Problem: "Payment verified but wallet not funded"

```
Transaction successful but balance unchanged
```

**Solution:**

1. Check WebhookLog for processing errors:

```bash
db.webhooklogs.find().sort({createdAt: -1}).limit(5)
```

2. Manually fund wallet:

```bash
# Use admin API to manually fund:
POST /api/wallet
{
  "action": "fund",
  "amount": 10000
}
```

---

### Data Purchase Issues

#### Problem: "Data plan not found"

```
Error: Plan not found (404)
```

**Solution:**

1. Verify data plans exist:

```bash
db.dataplans.find()
```

2. If empty, seed database:

```bash
npm run seed
```

3. Verify network exists:

```bash
db.networks.find()
```

#### Problem: "Insufficient wallet balance"

```
Error: Insufficient wallet balance (400)
```

**Solution:**

1. Fund wallet first:

```bash
POST /api/wallet
{"action": "fund", "amount": 50000}
```

2. Check wallet balance:

```bash
GET /api/wallet
```

3. Verify transaction amount matches plan price

#### Problem: "Data stuck in pending"

```
Transaction status: pending for hours
```

**Solution:**

1. Check provider status:

```bash
db.transactions.findOne(
  {reference: "DATA-xxxxx"},
  {providerStatus: 1, errorMessage: 1}
)
```

2. Check retry count:

```bash
db.transactions.findOne(
  {reference: "DATA-xxxxx"},
  {retryCount: 1}
)
```

3. Admin can trigger manual retry:

```bash
# Retry endpoint (if implemented)
POST /api/data
{
  "action": "retry",
  "transactionId": "..."
}
```

4. Or process manual refund:

```bash
POST /api/admin
{
  "action": "manual-refund",
  "transactionId": "...",
  "reason": "Data stuck in pending"
}
```

---

### Admin Dashboard Issues

#### Problem: "Cannot access admin dashboard"

```
Redirect to /dashboard (permission denied)
```

**Solution:**

1. Verify user role is admin or agent:

```bash
db.users.findOne(
  {email: "user@example.com"},
  {role: 1}
)
```

2. Promote user to admin:

```bash
db.users.updateOne(
  {email: "user@example.com"},
  {$set: {role: "admin"}}
)
```

3. Logout and login again

#### Problem: "Dashboard loads but no data"

```
Dashboard is blank / tables empty
```

**Solution:**

1. Check transactions exist:

```bash
db.transactions.countDocuments()
```

2. Seed transactions if needed (development):

```bash
npm run seed
```

3. Check browser console for JavaScript errors

#### Problem: "Commission calculation wrong"

```
Platform commission doesn't match expected amount
```

**Solution:**

1. Verify `PLATFORM_COMMISSION_PERCENTAGE`:

```env
PLATFORM_COMMISSION_PERCENTAGE=5  # 5%
```

2. Check commission log:

```bash
db.commissionlogs.findOne(
  {transactionId: "..."},
  {amount: 1, percentage: 1}
)
```

3. Verify calculation: `(transaction.amount * percentage) / 100`

---

### Frontend Issues

#### Problem: "Pages not loading / 404 errors"

```
Cannot GET /dashboard
```

**Solution:**

1. Verify Next.js built successfully:

```bash
npm run build
```

2. Check server is running:

```bash
npm run dev
# Should show "ready - started server on 0.0.0.0:3000"
```

3. Clear browser cache:

```
Ctrl+Shift+Delete → Clear all
```

#### Problem: "Styling broken / Tailwind not working"

```
Page looks unstyled
```

**Solution:**

1. Verify Tailwind build:

```bash
npm run build
```

2. Check tailwind.config.js content paths:

```js
content: ["./app/**/*.{js,ts,jsx,tsx}"];
```

3. Restart dev server:

```bash
npm run dev
```

#### Problem: "API calls fail / CORS error"

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

1. Verify API base URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

2. Check API response headers
3. Verify API endpoint exists

---

### Performance Issues

#### Problem: "App is slow / pages lag"

```
Slow response times
```

**Solution:**

1. Check database indexes:

```bash
db.transactions.getIndexes()
```

2. Monitor database query performance:

```bash
db.setProfilingLevel(1)
```

3. Optimize queries in services:
   - Use `.populate()` selectively
   - Add `.limit()` and `.skip()`
   - Create compound indexes

#### Problem: "Memory leak / increasing RAM usage"

```
Node process grows continuously
```

**Solution:**

1. Check for leaking event listeners
2. Verify database connections close properly
3. Monitor with:

```bash
node --inspect app.js
# Visit chrome://inspect
```

---

### API Issues

#### Problem: "GET request returns 500"

```
Internal Server Error
```

**Solution:**

1. Check server console for error
2. Verify request parameters
3. Verify user is authenticated (if required)
4. Check database connection

#### Problem: "POST request always returns 400"

```
Bad Request / Missing required fields
```

**Solution:**

1. Verify request body format (JSON)
2. Check required fields are included
3. Verify field types match schema
4. Check Content-Type header: `application/json`

---

## Performance Optimization Tips

### Database Optimization

```bash
# Create indexes for frequent queries
db.transactions.createIndex({userId: 1, createdAt: -1})
db.users.createIndex({email: 1})
db.wallets.createIndex({userId: 1})
```

### Query Optimization

```javascript
// ❌ Bad
const users = await User.find({});

// ✅ Good
const users = await User.find({})
  .limit(50)
  .skip(offset)
  .select("-password")
  .lean();
```

### API Response Optimization

```javascript
// ❌ Bad - returns too much data
const transaction = await Transaction.findById(id)
  .populate("userId")
  .populate("dataPlanId")
  .populate("networkId");

// ✅ Good - select only needed fields
const transaction = await Transaction.findById(id)
  .populate("userId", "name email")
  .populate("dataPlanId", "name price")
  .select("reference amount status createdAt");
```

### Frontend Optimization

```javascript
// Implement request caching
const cache = new Map();

async function fetchNetworks() {
  if (cache.has("networks")) {
    return cache.get("networks");
  }

  const data = await fetch("/api/data");
  cache.set("networks", data);
  return data;
}
```

---

## Debugging Tips

### Enable Debug Logging

```bash
DEBUG=* npm run dev
```

### MongoDB Query Logging

```bash
mongosh
use dataapp
db.setProfilingLevel(1)
db.system.profile.find().sort({ts: -1}).limit(5)
```

### Check Server Logs

```bash
# All errors and info
npm run dev 2>&1 | tee app.log
```

### Browser DevTools

- F12 → Console tab for client-side errors
- F12 → Network tab to inspect API calls
- F12 → Application tab to check stored tokens

---

## Common Errors & Solutions

| Error                | Cause               | Solution                              |
| -------------------- | ------------------- | ------------------------------------- |
| ECONNREFUSED         | MongoDB not running | Start mongod or MongoDB service       |
| jwt malformed        | Token tampered      | Generate new token, don't edit secret |
| Invalid credentials  | Wrong password      | Check password is correct             |
| Webhook failed       | Invalid signature   | Verify PAYSTACK_SECRET_KEY            |
| Plan not found       | No data plans       | Run npm run seed                      |
| Insufficient balance | Not enough funds    | Fund wallet first                     |
| 404 Not Found        | Wrong endpoint      | Check API_DOCUMENTATION.md            |
| Timeout              | Slow query          | Add database indexes                  |

---

## Getting Help

1. **Check Documentation**
   - README.md - Complete guide
   - API_DOCUMENTATION.md - API reference
   - GETTING_STARTED.md - Quick start

2. **Review Code**
   - Check relevant service file
   - Review API route implementation
   - Check database schema

3. **Check Logs**
   - Console output in terminal
   - Browser developer tools
   - MongoDB profiler
   - WebhookLog collection

4. **Test Directly**
   - Use cURL to test API
   - Use MongoDB Compass to view data
   - Use Postman for API testing

---

## Prevention Tips

- ✅ Always backup before major changes
- ✅ Test in development first
- ✅ Use .env.local for sensitive data
- ✅ Enable error tracking (Sentry)
- ✅ Monitor application logs
- ✅ Regular database backups
- ✅ Security updates regularly
- ✅ Load testing before launch

---

**Last Updated**: January 2026
**Status**: Complete FAQ & Troubleshooting Guide
