# ⚡ Quick Start - Fix "User already exists" Error

## The Problem
Your backend is running in **development mode** with in-memory storage. User data is temporary and persists only while the server is running.

## Quick Solutions

### Solution 1: Restart Server (Temporary Fix)
**Use this if you just want to test quickly:**

1. Stop the server: Press `Ctrl+C` in the terminal
2. Start it again: `npm run dev`
3. The in-memory database is cleared - you can register "student1" again

**Note:** Data will be lost every time you restart!

---

### Solution 2: Set Up Real Database (Permanent Fix)
**Use this for persistent data storage:**

#### Step 1: Get Your Service Role Key
1. Go to: https://supabase.com/dashboard/project/novwicpageiuftzpenyw/settings/api
2. Scroll to **Project API keys**
3. Copy the **`service_role`** key (starts with `eyJ...`, NOT `sb_publishable_...`)

#### Step 2: Update .env File
Open `.env` and replace this line:
```env
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

With your actual key:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_ACTUAL_KEY
```

#### Step 3: Set Up Database Tables
1. Go to: https://supabase.com/dashboard/project/novwicpageiuftzpenyw/sql/new
2. Open file: `scripts/complete-schema.sql` (in your project folder)
3. Copy ALL the SQL code
4. Paste it in the Supabase SQL Editor
5. Click **"Run"**

#### Step 4: Restart Server
```powershell
npm run dev
```

You should see:
```
✅ Supabase clients initialized successfully
✅ Database connection test successful
```

---

## How to Know Which Mode You're In

### Development Mode (Mock Database)
```
⚠️ DEVELOPMENT MODE: Using mock database clients
⚠️ Database operations will be simulated
```
- Data is temporary (in RAM)
- Data lost on restart
- Pre-configured test users available

### Production Mode (Real Database)
```
✅ Supabase clients initialized successfully
✅ Database connection test successful
```
- Data is persistent (in Supabase)
- Data survives restarts
- Real user registration

---

## Test Users (Development Mode Only)

| Username    | Password  | Role      |
|-------------|-----------|-----------|
| student1    | Test@123  | student   |
| teacher1    | Test@123  | teacher   |
| hod1        | Test@123  | hod       |
| principal1  | Test@123  | principal |

---

## Need More Help?

See the full guide: `SETUP_GUIDE.md`
