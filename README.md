# DataApp - Data & Airtime Sales Platform

A complete, production-ready wallet-based data sales platform built with Next.js for Nigeria. Enable users to buy mobile data instantly with automatic delivery and secure payments via Paystack.

## 🚀 Features

### Customer Features

- **Buy Data Instantly** - No account creation needed for first-time guests
- **Multiple Networks** - MTN, Airtel, Glo, 9mobile support
- **Secure Payments** - Paystack integration for safe transactions
- **Wallet System** - Fund wallet and track balance
- **Transaction History** - View all past purchases and receipts
- **Mobile-First** - Fully responsive design

### Admin/Agent Features

- **Secure Dashboard** - Role-based access control
- **Transaction Management** - View all transactions and user activity
- **Data Plan Management** - Create and update data plans per network
- **Manual Refunds** - Process refunds for failed transactions
- **Commission Tracking** - Real-time commission calculations and logs
- **Network Settings** - Manage network providers and commissions

### Platform Owner Features

- **Automatic Commission** - Percentage-based commission per transaction
- **Commission Logs** - Detailed audit trail of all commissions
- **Provider Abstraction** - Switch data providers without code changes
- **Webhook Verification** - Secure Paystack webhook handling

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Payments**: Paystack API
- **Styling**: Tailwind CSS
- **Security**: bcryptjs, crypto modules


## 📏 Development Standards

- **File Extensions**:
  - Use `.jsx` for all React components (e.g., `page.jsx`, `components/Button.jsx`).
  - Use `.js` for pure JavaScript files (e.g., utilities, API routes, configurations).

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or cloud)
- Paystack account (for payment processing)
- Data provider API credentials

## 🔧 Installation

### 1. Clone and Setup

```bash
cd "c:\Users\abdul\Music\Web apps\DataApp"
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/dataapp

# JWT
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRY=7d

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key

# Platform Config
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NODE_ENV=development

# Commission
PLATFORM_COMMISSION_PERCENTAGE=5

# Data Provider
DATA_PROVIDER_API_KEY=your_api_key_here
DATA_PROVIDER_URL=https://api.dataprovider.com

# Webhook
WEBHOOK_SECRET=your_webhook_secret_key
```

### 3. Database Setup

Ensure MongoDB is running:

```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 📁 Project Structure

```
DataApp/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── auth/              # Authentication routes
│   │   ├── wallet/            # Wallet management
│   │   ├── data/              # Data purchase
│   │   ├── admin/             # Admin dashboard APIs
│   │   └── webhooks/          # Payment webhooks
│   ├── dashboard/             # Customer dashboard
│   ├── admin/                 # Admin dashboard
│   ├── auth/                  # Login/Register
│   ├── page.js               # Homepage
│   ├── layout.js             # Root layout
│   └── globals.css           # Global styles
├── lib/
│   ├── mongodb.js            # Database connection
│   ├── jwt.js                # Token generation/verification
│   ├── crypto.js             # Signature verification
│   ├── helpers.js            # Utility functions
│   └── response.js           # API response formatting
├── models/
│   ├── User.js               # User schema
│   ├── Wallet.js             # Wallet schema
│   ├── Transaction.js        # Transaction schema
│   ├── DataPlan.js           # Data plan schema
│   ├── Network.js            # Network schema
│   ├── CommissionLog.js      # Commission tracking
│   └── WebhookLog.js         # Webhook audit trail
├── services/
│   ├── authService.js        # Authentication logic
│   ├── walletService.js      # Wallet operations
│   ├── dataService.js        # Data purchase logic
│   ├── paystackService.js    # Paystack integration
│   └── dataProvider.js       # Data delivery abstraction
├── middlewares/
│   ├── auth.js               # JWT authentication
│   ├── role.js               # Role-based access
│   └── rateLimit.js          # Rate limiting
├── config/
│   └── constants.js          # App constants
├── public/                   # Static assets
├── .env.example              # Environment template
├── next.config.js            # Next.js config
├── tailwind.config.js        # Tailwind config
├── postcss.config.js         # PostCSS config
└── package.json              # Dependencies
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth` - Register/Login
  - Body: `{ action: 'register|login', email, password, name?, phone? }`

### Wallet

- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet` - Fund wallet or get history
  - Body: `{ action: 'fund|history', amount?, limit?, skip? }`

### Data Purchase

- `GET /api/data` - Get all networks
- `GET /api/data/:networkId` - Get plans for network
- `POST /api/data` - Purchase data
  - Body: `{ action: 'purchase|transaction-details', dataPlanId, phoneNumber, transactionId? }`

### Payment

- `POST /api/wallet/paystack` - Initialize/Verify payment
  - Body: `{ action: 'initialize|verify', email, amount, reference? }`

### Admin

- `GET /api/admin?section=dashboard|transactions|commissions` - Get admin data
- `POST /api/admin` - Admin actions
  - Body: `{ action: 'create-data-plan|update-data-plan|create-network|manual-refund', ... }`

### Webhooks

- `POST /api/webhooks/paystack` - Paystack webhook handler

## 🔐 Security Features

1. **JWT Authentication** - Stateless, secure token-based auth
2. **Password Hashing** - SHA256 with bcryptjs for enhanced security
3. **Webhook Signature Verification** - HMAC-SHA512 for Paystack webhooks
4. **Rate Limiting** - Prevents abuse of API endpoints
5. **Role-Based Access Control** - Customer, Agent, Admin roles
6. **Transaction Idempotency** - Prevents duplicate charges
7. **Input Validation** - All user inputs validated server-side
8. **Environment Secrets** - Never expose API keys in code

## 💳 Payment Flow

```
1. User initiates payment → /api/wallet/paystack (initialize)
2. Paystack returns authorization URL
3. User redirects to Paystack → pays via card/bank
4. Paystack redirects back → /api/wallet/paystack (verify)
5. Backend verifies payment with Paystack
6. Webhook from Paystack → /api/webhooks/paystack
7. Transaction updated, commission logged
8. Data delivery triggered via dataProvider
```

## 📊 Database Models

### User

```javascript
{
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  name: String,
  role: String (customer|agent|admin),
  isVerified: Boolean,
  kycVerified: Boolean,
  status: String (active|suspended|deleted),
  timestamps
}
```

### Wallet

```javascript
{
  userId: ObjectId (ref: User),
  balance: Number,
  totalFunded: Number,
  totalSpent: Number,
  lastFundedAt: Date,
  status: String (active|frozen|suspended),
  timestamps
}
```

### Transaction

```javascript
{
  reference: String (unique, idempotent key),
  userId: ObjectId (ref: User),
  dataPlanId: ObjectId (ref: DataPlan),
  networkId: ObjectId (ref: Network),
  phoneNumber: String,
  amount: Number,
  platformCommission: Number,
  agentProfit: Number,
  status: String (pending|success|failed|refunded),
  paystackReference: String (unique),
  providerReference: String (unique),
  providerStatus: String (pending|delivered|failed|retry),
  errorMessage: String,
  retryCount: Number,
  paymentMethod: String (wallet|paystack),
  metadata: Object,
  timestamps
}
```

### DataPlan

```javascript
{
  networkId: ObjectId (ref: Network),
  name: String,
  dataSize: String (e.g., "1GB"),
  price: Number,
  validity: String (e.g., "30 days"),
  providerCode: String,
  isActive: Boolean,
  description: String,
  timestamps
}
```

### Network

```javascript
{
  name: String (MTN|Airtel|Glo|9mobile),
  code: String (unique),
  isActive: Boolean,
  commissionPercentage: Number,
  providerCode: String,
  description: String,
  timestamps
}
```

### CommissionLog

```javascript
{
  transactionId: ObjectId (ref: Transaction, unique),
  amount: Number,
  percentage: Number,
  description: String,
  status: String (pending|paid|reversed),
  timestamps
}
```

### WebhookLog

```javascript
{
  event: String,
  source: String (paystack|provider),
  reference: String,
  payload: Object,
  signature: String,
  isValid: Boolean,
  status: String (received|processed|failed),
  errorMessage: String,
  transactionId: ObjectId (ref: Transaction),
  timestamps
}
```

## 🚀 Deployment

### Prepare for Production

1. Update `.env.local` with production values:

```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com
JWT_SECRET=<very-long-random-string>
MONGODB_URI=<production-mongodb-url>
PAYSTACK_SECRET_KEY=<live-paystack-key>
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=<live-paystack-public-key>
PLATFORM_COMMISSION_PERCENTAGE=5
```

2. Build the project:

```bash
npm run build
```

3. Start production server:

```bash
npm start
```

### Deploy to Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Other Platforms

- **AWS**: Use Amplify or EC2 with PM2
- **Heroku**: Deploy with Git push
- **DigitalOcean**: Use App Platform or Droplets
- **Railway/Render**: Push-to-deploy platforms

## 🔄 Automatic Data Retries

Failed data deliveries are automatically retried:

1. Initial attempt at transaction creation
2. Retry mechanism in `dataProvider.js`
3. Max 3 retries with 5-second delays
4. Transaction status tracked in real-time
5. Webhook logs capture all attempts

## 🧪 Testing Endpoints

### Register User

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

### Get Wallet Balance

```bash
curl -X GET http://localhost:3000/api/wallet \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Networks

```bash
curl -X GET http://localhost:3000/api/data
```

## ⚙️ Configuration

### Adjusting Commission Percentage

Edit `.env.local`:

```env
PLATFORM_COMMISSION_PERCENTAGE=5  # 5% commission per transaction
```

### Changing Retry Settings

Edit `config/constants.js`:

```javascript
export const MAX_RETRIES = 3; // Max retry attempts
export const RETRY_DELAY = 5000; // 5 seconds between retries
```

### Adding New Networks

Use the admin dashboard or API:

```bash
POST /api/admin
{
  "action": "create-network",
  "name": "MTN",
  "code": "mtn",
  "commissionPercentage": 10,
  "providerCode": "mtn-ng"
}
```

## 🐛 Troubleshooting

### MobileNig "Invalid API Key" Error (400 Bad Request)

- **Cause**: The API keys in `.env.local` are invalid, expired, or your IP address is not whitelisted.
- **Solution**:
  1. Log in to your MobileNig dashboard.
  2. Regenerate your API keys if needed.
  3. **CRITICAL**: Go to Developer > Register IP and whitelist your current IP address.
  4. Ensure your account is upgraded to at least "STANDARD" level.
  5. Update `.env.local` with the new keys.
  6. **If error persists with valid keys**: Contact MobileNig support (+2347064764979) as your account may not be fully provisioned for API transactions despite the upgrade.

```
Solution: Ensure MongoDB is running and MONGODB_URI is correct
- Local: mongodb://localhost:27017/dataapp
- Cloud: Get connection string from MongoDB Atlas
```

### Paystack Webhook Not Working

```
Solution:
1. Verify PAYSTACK_SECRET_KEY is correct (sk_ not pk_)
2. Ensure webhook URL is publicly accessible
3. Configure Paystack webhook URL: https://yourdomain.com/api/webhooks/paystack
4. Check WebhookLog collection for errors
```

### Transaction Stuck in Pending

```
Solution:
1. Check WebhookLog for webhook errors
2. Verify data provider is responding
3. Admin can trigger manual retry or refund
4. Check provider API status and logs
```

## 📞 Support

For issues or questions:

1. Check the README troubleshooting section
2. Review MongoDB indexes for performance
3. Check server logs for detailed error messages
4. Verify all environment variables are set correctly

## 📜 License

This project is provided as-is for production use. Ensure compliance with Nigerian regulations for fintech operations.

## ⚠️ Important Notes

1. **Security**: Never commit `.env.local` to version control
2. **Passwords**: Change `JWT_SECRET` before production deployment
3. **Data Provider**: Configure actual data provider credentials
4. **Compliance**: Ensure KYC/AML compliance for fintech operations
5. **Testing**: Test payment flow thoroughly with Paystack test credentials
6. **Monitoring**: Set up error tracking (Sentry) for production
7. **Backup**: Regular database backups are essential

## 🎯 Next Steps

1. Configure MongoDB connection
2. Set up Paystack test/live credentials
3. Integrate your data provider API
4. Create initial networks and data plans
5. Deploy to production
6. Monitor transactions and commission logs

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: Production Ready


..