# Production Deployment Checklist

Complete this checklist before deploying to production.

## Environment Configuration

- [ ] Create `.env.production` with production values
- [ ] Change `JWT_SECRET` to a long random string (min 32 chars)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas (production database)
- [ ] Enable MongoDB authentication
- [ ] Use LIVE Paystack credentials (not test)
- [ ] Update `NEXT_PUBLIC_API_BASE_URL` to production domain
- [ ] Configure `DATA_PROVIDER_API_KEY` with real provider

## Security

- [ ] Enable HTTPS only (upgrade insecure requests)
- [ ] Set secure headers in `next.config.js`
- [ ] Enable CORS properly for API endpoints
- [ ] Verify all Paystack webhook signatures
- [ ] Setup rate limiting on all public endpoints
- [ ] Implement API key validation for data provider
- [ ] Enable MongoDB SSL/TLS connection
- [ ] Setup firewall rules
- [ ] Regular security audits

## Database

- [ ] Backup existing MongoDB
- [ ] Enable authentication for all databases
- [ ] Create read-only user for reports
- [ ] Setup automated daily backups
- [ ] Test backup restoration
- [ ] Enable MongoDB Atlas alerts
- [ ] Monitor disk usage
- [ ] Optimize indexes for queries

## Payment Processing

- [ ] Configure Paystack live webhook URL
- [ ] Verify webhook signature validation
- [ ] Test payment flow end-to-end
- [ ] Test webhook retry mechanism
- [ ] Monitor transaction success rate
- [ ] Setup payment failure alerts
- [ ] Document manual refund process
- [ ] Test commission calculations

## Performance

- [ ] Run `npm run build` successfully
- [ ] Optimize images in public folder
- [ ] Enable gzip compression
- [ ] Setup CDN for static assets
- [ ] Test load time on 3G connection
- [ ] Monitor API response times
- [ ] Setup caching headers
- [ ] Test database query performance

## Monitoring & Logging

- [ ] Setup error tracking (Sentry, LogRocket, etc.)
- [ ] Configure logging service
- [ ] Monitor API error rates
- [ ] Setup alerts for payment failures
- [ ] Monitor database performance
- [ ] Track user signups and activity
- [ ] Monitor webhook delivery failures
- [ ] Setup uptime monitoring

## Deployment

- [ ] Test build on production config
- [ ] Test all APIs in production environment
- [ ] Verify environment variables are loaded
- [ ] Test email notifications (if added)
- [ ] Verify database migrations ran
- [ ] Backup production database before deploying
- [ ] Deploy during low-traffic window
- [ ] Monitor deployment logs

## Post-Deployment

- [ ] Verify all pages load correctly
- [ ] Test complete payment flow
- [ ] Verify admin dashboard works
- [ ] Check database for errors
- [ ] Monitor error logs
- [ ] Test data delivery to users
- [ ] Verify commission calculations
- [ ] Test webhook delivery

## Legal & Compliance

- [ ] Setup Privacy Policy page
- [ ] Setup Terms of Service page
- [ ] Implement GDPR compliance (if applicable)
- [ ] Verify KYC/AML requirements met
- [ ] Setup data retention policy
- [ ] Document transaction audit trail
- [ ] Setup complaint handling process
- [ ] Verify regulatory compliance

## Scaling Readiness

- [ ] Database can handle expected load
- [ ] API response times are acceptable
- [ ] Implement connection pooling
- [ ] Setup database read replicas
- [ ] Plan for horizontal scaling
- [ ] Document deployment process
- [ ] Setup automated deployments
- [ ] Plan disaster recovery

## Production Environment Variables Template

```env
# Environment
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dataapp?retryWrites=true&w=majority

# JWT
JWT_SECRET=<generate-with-crypto-module-above>
JWT_EXPIRY=7d

# Paystack (LIVE credentials)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxx

# Platform Config
PLATFORM_COMMISSION_PERCENTAGE=5

# Data Provider
DATA_PROVIDER_API_KEY=<production-api-key>
DATA_PROVIDER_URL=https://api.dataprovider.com

# Webhook
WEBHOOK_SECRET=<generate-random-secret>
```

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

```bash
npm i -g vercel
vercel --prod
```

- Automatic deployments from Git
- CDN included
- Serverless functions
- Easy environment setup

### Option 2: AWS Amplify

```bash
npm i -g @aws-amplify/cli
amplify init
amplify publish
```

### Option 3: Docker + Any Cloud

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Option 4: Traditional VPS

```bash
# On server
git clone <repo>
cd DataApp
npm install
npm run build

# Use PM2 for process management
npm i -g pm2
pm2 start npm --name "dataapp" -- start
pm2 save
pm2 startup
```

## Monitoring Commands

```bash
# Check system resources
top
df -h

# Check MongoDB
mongostat --uri="mongodb+srv://..."

# Check application logs
pm2 logs dataapp
tail -f /var/log/dataapp.log

# Monitor network
netstat -tuln | grep 3000
```

## Rollback Procedure

1. Backup current database
2. Revert to previous application version
3. Clear application cache
4. Restart services
5. Verify functionality
6. Monitor for errors

## Post-Launch Support

- [ ] Monitor error rates for 24 hours
- [ ] Check customer support for issues
- [ ] Monitor transaction success rate
- [ ] Verify commissions are calculated correctly
- [ ] Test data delivery for all networks
- [ ] Monitor database performance
- [ ] Review webhook delivery logs
- [ ] Be ready for hotfixes if needed

## Success Criteria

✅ All tests passing
✅ Payment processing working correctly
✅ No database errors
✅ API response times < 500ms
✅ All pages loading correctly
✅ Admin dashboard fully functional
✅ Commission calculations accurate
✅ Webhook delivery reliable
✅ Error logs clean
✅ Performance metrics acceptable

---

**Last Updated**: January 2026
**Status**: Ready for Production
