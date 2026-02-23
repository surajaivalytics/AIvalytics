# 🚀 Backend Setup Guide - Complete Instructions

## Current Status

Your backend is running in **development mode** because the database hasn't been set up yet. Follow the steps below to configure your production database.

---

## 📋 Prerequisites

1. A Supabase account and project
2. Node.js installed (v14 or higher)
3. Your Supabase credentials

---

## 🔧 Step-by-Step Setup

### Step 1: Get Your Supabase Credentials

1. **Go to your Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/novwicpageiuftzpenyw/settings/api

2. **Copy the following keys:**
   - ✅ **Project URL** (already in your .env)
   - ✅ **anon/public key** (already in your .env)
   - ⚠️ **service_role key** (THIS IS WHAT YOU NEED!)

3. **Important:** The `service_role` key should:
   - Start with `eyJ...` (it's a JWT token)
   - Be very long (several hundred characters)
   - **NOT** start with `sb_publishable_...`

### Step 2: Update Your `.env` File

Open `D:\Internship\aivalyticsbackend-main\.env` and replace this line:

```env
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

With your actual service_role key:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdndpY3BhZ2VpdWZ0enBlbnl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUwMTI4NywiZXhwIjoyMDg1MDc3Mjg3fQ.YOUR_ACTUAL_KEY_HERE
```

### Step 3: Initialize Your Database

#### Option A: Using Supabase SQL Editor (Recommended)

1. **Go to Supabase SQL Editor:**
   - URL: https://supabase.com/dashboard/project/novwicpageiuftzpenyw/sql/new

2. **Open the schema file:**
   - File location: `D:\Internship\aivalyticsbackend-main\scripts\complete-schema.sql`
   - Open it in any text editor and copy ALL the contents

3. **Paste and Run:**
   - Paste the SQL into the Supabase SQL Editor
   - Click the **"Run"** button (or press Ctrl+Enter)
   - Wait for it to complete (should take 5-10 seconds)

4. **Verify Success:**
   - You should see "Success. No rows returned" or similar
   - Check the "Table Editor" tab - you should see tables like `roles`, `user`, `course`, etc.

#### Option B: Using the Setup Script

1. **Run the setup verification script:**
   ```powershell
   node setup-database.js
   ```

2. **Follow the on-screen instructions**
   - The script will guide you through the process
   - It will verify your credentials and check database status

### Step 4: Verify Your Setup

Run the verification script:

```powershell
node setup-database.js
```

You should see:
```
✅ All required tables exist!
Your database is ready to use.
```

### Step 5: Start Your Server

```powershell
npm run dev
```

You should now see:
```
✅ Supabase clients initialized successfully
✅ Database connection test successful
🚀 Server running on port 5000
```

Instead of the development mode warnings.

---

## 🎯 Quick Reference

### Development Mode (Current State)
```
⚠️ DEVELOPMENT MODE: Using mock database clients with in-memory storage
⚠️ Database operations will be simulated but not persisted between server restarts
```

**What this means:**
- Data is stored in RAM (temporary)
- Data is lost when server restarts
- Pre-configured test users are available
- Good for testing, but not for production

### Production Mode (After Setup)
```
✅ Supabase clients initialized successfully
✅ Database connection test successful
```

**What this means:**
- Data is stored in Supabase (persistent)
- Data survives server restarts
- Real user registration and authentication
- Ready for production use

---

## 👥 Test Users (Development Mode Only)

When running in development mode, these users are pre-configured:

| Username    | Password  | Role      | Roll Number |
|-------------|-----------|-----------|-------------|
| student1    | Test@123  | student   | S001        |
| teacher1    | Test@123  | teacher   | T001        |
| hod1        | Test@123  | hod       | H001        |
| principal1  | Test@123  | principal | P001        |

**Note:** These users only exist in development mode and reset on every server restart.

---

## ❓ Troubleshooting

### Error: "User already exists"
**Cause:** In development mode, data persists in memory during the session.

**Solution:** Restart the server (Ctrl+C, then `npm run dev`)

### Error: "Could not find the table 'public.roles'"
**Cause:** Database schema hasn't been initialized.

**Solution:** Follow Step 3 above to run the schema SQL

### Error: "Invalid Supabase credentials"
**Cause:** Wrong service_role key in .env file.

**Solution:**
1. Verify you copied the **service_role** key (not anon or publishable)
2. Make sure the key starts with `eyJ...`
3. Check for extra spaces or line breaks in the .env file

### Server crashes with "Assertion failed"
**Cause:** Database connection issue when using invalid credentials.

**Solution:**
1. Either fix the credentials (production mode)
2. Or use placeholder values to run in development mode

---

## 🔒 Security Notes

### Important Security Warnings:

1. **Never commit `.env` to Git**
   - Make sure `.env` is in your `.gitignore`
   - The service_role key has full database access

2. **Keep your service_role key secret**
   - Don't share it in screenshots or messages
   - Don't expose it in client-side code
   - Only use it in backend/server code

3. **Use environment variables in production**
   - Don't hardcode credentials
   - Use secure environment variable management

---

## 📁 Project Structure

```
aivalyticsbackend-main/
├── .env                          # Your environment variables (DO NOT COMMIT)
├── setup-database.js             # Database setup verification script
├── scripts/
│   └── complete-schema.sql       # Complete database schema
├── src/
│   ├── config/
│   │   └── database.js           # Database configuration
│   ├── services/
│   │   └── authService.js        # Authentication logic
│   └── server.js                 # Main server file
└── SETUP_GUIDE.md               # This file
```

---

## 🆘 Need More Help?

### Check These Files:
- `README.md` - General project documentation
- `scripts/complete-schema.sql` - Database schema details
- `src/config/database.js` - Database configuration logic

### Common Commands:
```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Verify database setup
node setup-database.js

# Check environment variables
cat .env
```

---

## ✅ Setup Checklist

- [ ] Supabase project created
- [ ] Got service_role key from Supabase dashboard
- [ ] Updated `.env` file with correct service_role key
- [ ] Ran `complete-schema.sql` in Supabase SQL Editor
- [ ] Verified setup with `node setup-database.js`
- [ ] Started server with `npm run dev`
- [ ] Confirmed "Supabase clients initialized successfully" message
- [ ] Tested user registration/login

---

**Last Updated:** 2026-01-27

**Need help?** Check the troubleshooting section above or review the error messages carefully.
