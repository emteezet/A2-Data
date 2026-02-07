# VT Pass Webhook Integration Guide

## Your Webhook URLs

### Development

```
http://localhost:3000/api/webhooks/vtpass
```

### Production

```
https://yourdomain.com/api/webhooks/vtpass
```

---

## Setup Steps

### 1. Get VT Pass Credentials

1. Go to https://vtpass.com
2. Create an account or log in
3. Navigate to **Settings > API Keys**
4. Copy your:
   - **API Key** (public)
   - **Secret Key** (keep safe!)

### 2. Update `.env.local`

```env
VTPASS_API_KEY=your_api_key_from_vtpass
VTPASS_SECRET_KEY=your_secret_key_from_vtpass
VTPASS_API_URL=https://api.vtpass.com/api
```

### 3. Configure Webhook in VT Pass Dashboard

1. Log in to VT Pass
2. Go to **Webhooks** settings
3. Click **Add Webhook**
4. Enter your webhook URL:
   - **URL**: `https://yourdomain.com/api/webhooks/vtpass`
   - **Events**: Select "Transaction Status Updates"
5. Test the webhook
6. Save

---

## How It Works

### Webhook Events VT Pass Sends:

```json
{
  "reference": "unique-transaction-ref",
  "status": "delivered|pending|failed|processing",
  "message": "Status message",
  "transaction_id": "vtpass-transaction-id"
}
```

### Transaction Status Mapping:

| VT Pass Status | Your App Status |
| -------------- | --------------- |
| `delivered`    | `success`       |
| `pending`      | `pending`       |
| `failed`       | `failed`        |
| `processing`   | `pending`       |

---

## Testing Webhook

### Test Webhook in VT Pass Dashboard

1. Go to Webhooks section
2. Click your webhook
3. Click "Send Test Event"
4. Check your WebhookLog model to verify it was received

### Manual Test (cURL)

```bash
curl -X POST http://localhost:3000/api/webhooks/vtpass \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "test-ref-123",
    "status": "delivered",
    "message": "Data successfully delivered",
    "transaction_id": "vtpass-tx-456"
  }'
```

---

## Files Created/Modified

### New Files:

- **[app/api/webhooks/vtpass.js](../../app/api/webhooks/vtpass.js)** - VT Pass webhook handler

### Modified Files:

- **[services/dataService.js](../../services/dataService.js)** - Added `handleVTPassWebhook()` function
- **[.env.local](.env.local)** - Added VT Pass credentials

---

## Webhook Logging

All webhooks are logged in the **WebhookLog** collection:

- Source: `vtpass`
- Event: Status from VT Pass
- Status: `processed` or `failed`
- IsValid: Signature validation result

Query recent webhooks:

```javascript
db.webhooklogs.find({ source: "vtpass" }).sort({ createdAt: -1 }).limit(10);
```

---

## Signature Verification

VT Pass includes a signature header: `x-vtpass-signature`

Your webhook automatically verifies it using:

```javascript
crypto
  .createHmac("sha512", VTPASS_SECRET_KEY)
  .update(JSON.stringify(payload))
  .digest("hex");
```

If signature doesn't match, webhook returns **401 Unauthorized**.

---

## Next Steps

1. ✅ Get VT Pass API credentials
2. ✅ Update `.env.local` with credentials
3. ✅ Deploy to production
4. ✅ Configure webhook URL in VT Pass dashboard
5. ✅ Test webhook delivery
6. ✅ Monitor WebhookLog for issues

---

## Troubleshooting

### Webhook Not Receiving Events

- [ ] Check webhook URL is correct and public
- [ ] Verify webhook is enabled in VT Pass dashboard
- [ ] Check server logs for errors
- [ ] Verify network connectivity

### Invalid Signature Error

- [ ] Ensure `VTPASS_SECRET_KEY` is correct
- [ ] Signature is calculated on raw payload
- [ ] Check header name: `x-vtpass-signature`

### Transaction Not Updated

- [ ] Verify `providerReference` in Transaction matches webhook `reference`
- [ ] Check Transaction collection for the reference
- [ ] Check WebhookLog for error messages
