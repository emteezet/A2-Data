# DataApp - Quick Reference Card

## 🚀 Start Development (3 Commands)

```bash
npm install                    # Install dependencies
npm run init && npm run seed   # Setup database
npm run dev                    # Start server → http://localhost:3000
```

---

## 📂 Important Directories

```
/app/api/           → All API endpoints (17 total)
/models/            → MongoDB schemas (7 collections)
/services/          → Business logic
/lib/               → Utilities & helpers
/app/dashboard/     → Customer pages
/app/admin/         → Admin pages
```

---

## 🔑 Default Credentials

```
Email:    admin@dataapp.com
Password: admin
Role:     admin
```

---

## 🌐 URLs (Development)

```
Homepage:        http://localhost:3000
Auth/Login:      http://localhost:3000/auth
Dashboard:       http://localhost:3000/dashboard
Admin Panel:     http://localhost:3000/admin
```

---

## 📋 Environment Variables Required

```env
MONGODB_URI=mongodb://localhost:27017/dataapp
JWT_SECRET=your_secret_key
PAYSTACK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

---

## 🔗 API Endpoints

### Authentication

```
POST /api/auth                    # Register/Login
```

### Wallet

```
GET  /api/wallet                  # Get balance
POST /api/wallet                  # Fund wallet / History
```

### Data

```
GET  /api/data                    # Get networks
GET  /api/data/:networkId         # Get plans
POST /api/data                    # Purchase data
```

### Payment

```
POST /api/wallet/paystack         # Init/Verify payment
```

### Admin

```
GET  /api/admin?section=...       # Dashboard/Transactions
POST /api/admin                   # Create plans / Refund
```

### Webhooks

```
POST /api/webhooks/paystack       # Payment confirmation
```

---

## 💾 Database Collections

```
users              → User accounts
wallets            → Wallet balances
transactions       → Purchase history
dataplans          → Available plans
networks           → MTN/Airtel/Glo/9mobile
commissionlogs     → Commission tracking
webhooklogs        → Webhook audit trail
```

---

## 🧪 Test API with cURL

### Register

```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"register","email":"test@example.com","password":"123456","phone":"08012345678","name":"John"}'
```

### Get Networks

```bash
curl -X GET http://localhost:3000/api/data
```

### Get Wallet (with token)

```bash
curl -X GET http://localhost:3000/api/wallet \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 Common Commands

```bash
npm run dev                # Start development server
npm run build              # Build for production
npm start                  # Start production server
npm run lint               # Run ESLint
npm run seed               # Seed database with data
npm run init               # Initialize database
npm cache clean --force    # Clear npm cache
```

---

## 📊 Check Database

```bash
# Connect to MongoDB
mongosh

# Switch database
use dataapp

# List collections
show collections

# Count documents
db.users.countDocuments()
db.transactions.countDocuments()

# View sample data
db.users.findOne()
db.transactions.findOne()

# View admin users
db.users.find({role: "admin"})
```

---

## 🔐 Security Reminders

- [ ] Change JWT_SECRET before production
- [ ] Use HTTPS in production
- [ ] Use live Paystack keys (pk*live*, sk*live*)
- [ ] Never commit .env.local
- [ ] Keep dependencies updated
- [ ] Enable database authentication
- [ ] Setup SSL certificate

---

## 📈 Performance Checklist

- [ ] Database indexes created
- [ ] API response times < 500ms
- [ ] Gzip compression enabled
- [ ] CDN configured
- [ ] Error tracking setup
- [ ] Monitoring alerts configured
- [ ] Backup schedule in place

---

## 🚨 Troubleshooting Quick Links

| Issue                     | Solution                                      |
| ------------------------- | --------------------------------------------- |
| Cannot connect to MongoDB | Start mongod or verify MONGODB_URI            |
| Login fails               | Check admin@dataapp.com / admin credentials   |
| Paystack not working      | Verify secret keys (sk*test*, not pk*test*)   |
| No data plans             | Run `npm run seed`                            |
| API returns 401           | Token expired or missing Authorization header |
| Dashboard blank           | Check browser console for errors              |
| Slow queries              | Add database indexes                          |

---

## 📚 Documentation Files

```
README.md                    → Complete setup guide (READ FIRST)
GETTING_STARTED.md          → 5-minute quick start
API_DOCUMENTATION.md        → All endpoints with examples
DEPLOYMENT_CHECKLIST.md     → Production deployment steps
TROUBLESHOOTING.md          → FAQ and error solutions
PROJECT_SUMMARY.md          → Project overview
```

---

## 🎯 Feature Checklist

### Customer Features

- [ ] Register/Login
- [ ] View wallet balance
- [ ] Select network
- [ ] Choose data plan
- [ ] Buy data
- [ ] View transaction history

### Admin Features

- [ ] Login as admin
- [ ] View dashboard
- [ ] View all transactions
- [ ] View commissions
- [ ] Create data plans
- [ ] Process refunds

### Payment Flow

- [ ] Initialize Paystack payment
- [ ] Redirect to Paystack
- [ ] Return from Paystack
- [ ] Verify payment
- [ ] Receive webhook
- [ ] Fund wallet

---

## 💡 Key Concepts

**JWT Token**: Secure authentication token, included in Authorization header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Idempotent Key**: Transaction reference prevents duplicate processing

```
reference: "DATA-123456789-abcdef"
```

**Atomic Operation**: Wallet deduction and transaction creation happen together

```
No double-spending guaranteed
```

**Provider Abstraction**: Data delivery logic can be changed without code updates

```
Configure DATA_PROVIDER_URL and API key
```

**Commission Split**: Automatic calculation per transaction

```
platformCommission = (amount * PLATFORM_COMMISSION_PERCENTAGE) / 100
```

---

## 🔄 Transaction Flow

```
1. User selects network → GET /api/data
2. User chooses plan → GET /api/data/:networkId
3. User buys data → POST /api/data (purchase)
4. Wallet deducted → UPDATE wallet balance
5. Transaction created → INSERT transaction
6. Provider called → Deliver data
7. Commission logged → INSERT commissionlog
8. Status updated → UPDATE transaction status
```

---

## 🌐 Deployment Flow

```
1. Configure .env with production values
2. Build: npm run build
3. Start: npm start
4. Monitor logs and errors
5. Configure Paystack webhook
6. Test complete flow
7. Go live!
```

---

## 💬 Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    /* ... */
  },
  "statusCode": 200
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400
}
```

---

## ⚙️ Environment Variables Reference

| Variable                        | Purpose             | Example                           |
| ------------------------------- | ------------------- | --------------------------------- |
| MONGODB_URI                     | Database connection | mongodb://localhost:27017/dataapp |
| JWT_SECRET                      | Token signing key   | very_long_random_string           |
| JWT_EXPIRY                      | Token expiry time   | 7d                                |
| PAYSTACK_SECRET_KEY             | Paystack auth       | sk_test_xxxxx                     |
| NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY | Paystack public key | pk_test_xxxxx                     |
| NEXT_PUBLIC_API_BASE_URL        | API base URL        | http://localhost:3000             |
| PLATFORM_COMMISSION_PERCENTAGE  | Commission %        | 5                                 |
| NODE_ENV                        | Environment         | development                       |

---

## 📞 Support Resources

- **Next.js**: https://nextjs.org/docs
- **MongoDB**: https://docs.mongodb.com
- **Paystack**: https://paystack.com/docs/api
- **Mongoose**: https://mongoosejs.com

---

## ✅ Pre-Launch Checklist

- [ ] All environment variables configured
- [ ] MongoDB connected and tested
- [ ] Paystack test credentials working
- [ ] All 17 API endpoints tested
- [ ] Admin dashboard accessible
- [ ] Customer flow tested end-to-end
- [ ] Commissions calculating correctly
- [ ] Error handling working
- [ ] Documentation reviewed
- [ ] Security checklist passed

---

## 🎉 You're All Set!

Your complete, production-ready Data Sales Platform is ready to go.

**Next Step**: Run `npm install && npm run init && npm run dev`

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: January 2026
