# MongoDB Setup Guide for DataApp

## Quick Setup (Recommended)

### Step 1: Download MongoDB

1. Go to: https://www.mongodb.com/try/download/community
2. Select "Windows" and download the `.msi` installer
3. Choose the latest stable version (currently 8.0.0)

### Step 2: Install MongoDB

1. Run the downloaded `.msi` file
2. Click "Next" through the setup wizard
3. **IMPORTANT**: Check the box "Install MongoDB as a Service"
4. Click "Install"
5. Wait for installation to complete (~2-3 minutes)

### Step 3: Start MongoDB Service

After installation, MongoDB should start automatically. To verify:

**Windows PowerShell (Admin):**

```powershell
Get-Service MongoDB | Start-Service
```

Or check if it's already running:

```powershell
Get-Process mongod
```

### Step 4: Verify Connection

Run in PowerShell:

```powershell
mongosh --eval "db.version()"
```

You should see a version number like: 8.0.0

### Step 5: Run Your App

```powershell
cd "c:\Users\abdul\Music\Web apps\DataApp"
npm run dev
```

### Step 6: Test Login

1. Go to http://localhost:3000/auth
2. Click "Register"
3. Enter test credentials:
   - Name: Test User
   - Email: test@example.com
   - Phone: 08012345678
   - Password: password123
4. Click Register

If it works, you'll be redirected to the dashboard!

## Troubleshooting

### MongoDB won't start

- Open Services (services.msc in Windows)
- Look for "MongoDB Server"
- Right-click → Start

### Still can't connect

- Check .env.local has: `MONGODB_URI=mongodb://localhost:27017/dataapp`
- Restart the Next.js dev server: `npm run dev`
- Check firewall isn't blocking localhost:27017

### Alternative: Use MongoDB Atlas Cloud

If you prefer cloud MongoDB:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Update .env.local with your connection string

---

Last updated: 2026-02-06
