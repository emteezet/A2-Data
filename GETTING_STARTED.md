# Getting Started - DataApp Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd "c:\Users\abdul\Music\Web apps\DataApp"
npm install
```

### 2. Setup Environment

```bash
# Copy the example environment file
copy .env.example .env.local
```

**Edit `.env.local` with your values:**

**Minimum configuration to start:**

```env
MONGODB_URI=mongodb://localhost:27017/dataapp
JWT_SECRET=your_secret_key_here_change_for_production
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
PLATFORM_COMMISSION_PERCENTAGE=5

# Paystack (get from https://paystack.com)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxx
PAYSTACK_SECRET_KEY=sk_test_xxxx

# Data Provider (placeholder - configure actual provider)
DATA_PROVIDER_API_KEY=demo_key
DATA_PROVIDER_URL=https://api.dataprovider.com
```

### 3. Start MongoDB

**Option A: Local MongoDB**

```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**

- Create account at https://cloud.mongodb.com
- Create a cluster
- Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/dataapp`
- Add to `.env.local`

### 4. Initialize Database

```bash
# Create admin user and seed data
npm run init
```

Output should show:

```
✓ Admin user already exists / Sample admin created
✓ Networks in database: 0 / 4
✓ Data plans in database: 0 / 16
```

If networks and plans are 0, also run:

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

## Accessing the Application

### Landing Page

- URL: `http://localhost:3000`
- Shows platform features and networks

### Register / Login

- URL: `http://localhost:3000/auth`
- Default admin: `admin@dataapp.com` / `admin`

### Customer Dashboard

- URL: `http://localhost:3000/dashboard` (after login)
- Buy data, check wallet, view history

### Admin Dashboard

- URL: `http://localhost:3000/admin` (admin/agent only)
- View transactions, commissions, manage plans

## Testing the Platform

### 1. Register as Customer

1. Go to `/auth`
2. Click "Register"
3. Fill in details: name, email, phone, password
4. Click Register

### 2. Fund Wallet

1. Login to `/dashboard`
2. See "Wallet Balance" section
3. Click "Fund Wallet" (requires Paystack setup)

### 3. Buy Data

1. Select Network (MTN, Airtel, Glo, 9mobile)
2. Choose Data Plan (1GB, 2GB, 5GB, 10GB)
3. Enter recipient phone number
4. Click "Buy Now"

### 4. Check Admin Dashboard

1. Login with admin credentials
2. Go to `/admin`
3. View Dashboard: transactions, commissions
4. View Transactions: detailed transaction history

## Paystack Integration Setup

### Get Test Credentials

1. Visit https://paystack.com
2. Sign up for account
3. Go to Settings → API Keys & Webhooks
4. Get:
   - **Public Key**: starts with `pk_test_`
   - **Secret Key**: starts with `sk_test_`

### Configure Webhook

1. In Paystack Dashboard: Settings → API Keys & Webhooks
2. Add Webhook URL: `http://localhost:3000/api/webhooks/paystack`
3. Select events: `charge.success`, `charge.failed`

### Test Payment Flow

1. Add test credentials to `.env.local`
2. Restart dev server: `npm run dev`
3. In dashboard, click "Fund Wallet"
4. Use Paystack test card:
   - **Card**: 4111 1111 1111 1111
   - **Exp**: 01/25
   - **CVV**: 123

## Database Structure

### Collections Created

- `users` - Registered users
- `wallets` - Wallet balances
- `transactions` - Purchase history
- `dataplans` - Available plans per network
- `networks` - MTN, Airtel, Glo, 9mobile
- `commissionlogs` - Platform commission tracking
- `webhooklogs` - Paystack webhook audit trail

### View in MongoDB

```bash
# Install MongoDB Compass (GUI)
# Or use command line:
mongo
use dataapp
show collections
db.users.find()
db.transactions.find()
```

## Troubleshooting

### "Cannot connect to MongoDB"

```bash
# Check if MongoDB is running
# Local: mongod should be running in another terminal
# Cloud: Check connection string in .env.local

# Test connection
mongosh "mongodb://localhost:27017/dataapp"
```

### "Payments not working"

```bash
# Check Paystack credentials
# - Are they test credentials (pk_test_, sk_test_)?
# - Are they correctly pasted in .env.local?
# - Restart server after changing .env.local
npm run dev
```

### "Data not delivering"

```bash
# Check data provider configuration
# - Is DATA_PROVIDER_URL correct?
# - Is DATA_PROVIDER_API_KEY valid?
# - Check WebhookLog collection for errors
# db.webhooklogs.find().sort({createdAt: -1})
```

### "Admin dashboard not accessible"

```bash
# Only admin and agent roles can access /admin
# Login as admin@dataapp.com (password: admin)
# Or create admin user in MongoDB:
db.users.updateOne(
  {email: "your@email.com"},
  {$set: {role: "admin"}}
)
```

## File Structure Reference

```
DataApp/
├── app/api/                    # Backend APIs
│   ├── auth/route.js          # Register/Login
│   ├── wallet/route.js        # Wallet ops
│   ├── data/route.js          # Data purchase
│   ├── admin/route.js         # Admin actions
│   └── webhooks/paystack.js   # Payment webhooks
├── app/dashboard/page.js      # Customer page
├── app/admin/page.js          # Admin dashboard
├── app/auth/page.js           # Login/Register
├── models/                    # MongoDB schemas
├── services/                  # Business logic
├── lib/                       # Utilities
├── config/                    # Constants
└── scripts/
    ├── init.js               # Initialize DB
    └── seed.js               # Seed data
```

## Development Workflow

### Making API Changes

1. Edit files in `/app/api/`
2. Server auto-reloads (no restart needed)
3. Test with curl or Postman
4. Check browser console for frontend errors

### Adding Features

1. Create service in `/services/`
2. Create route in `/app/api/`
3. Update frontend page
4. Test thoroughly

### Database Migrations

1. Edit model in `/models/`
2. Add indexes as needed
3. Create migration script if needed
4. Test with test data

## Performance Tips

### Optimize Queries

- Use `.populate()` only when needed
- Add indexes to frequently queried fields
- Limit results with `.limit()` and `.skip()`

### Caching

- Implement Redis for rate limiting (production)
- Cache network/plan data on client
- Cache commission calculations

### Monitoring

- Log all transactions
- Monitor webhook delivery
- Track API response times
- Alert on errors

## Security Checklist

- [ ] Change `JWT_SECRET` to random long string
- [ ] Use HTTPS in production
- [ ] Verify all Paystack signatures
- [ ] Enable MongoDB authentication
- [ ] Setup firewall rules
- [ ] Regular database backups
- [ ] Monitor unusual activity
- [ ] Update dependencies regularly

## Next Steps

1. ✅ Install and setup complete
2. Test all features in development
3. Configure production environment
4. Deploy to hosting service
5. Setup monitoring and alerts
6. Go live!

## Support Resources

- Next.js Docs: https://nextjs.org/docs
- MongoDB Docs: https://docs.mongodb.com
- Paystack API: https://paystack.com/docs/api
- Tailwind CSS: https://tailwindcss.com/docs

---

**Need Help?**

- Check README.md for detailed info
- Review API endpoints documentation
- Check database logs for errors
- Monitor WebhookLog for payment issues
