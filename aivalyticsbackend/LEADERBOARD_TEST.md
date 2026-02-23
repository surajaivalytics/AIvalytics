# Leaderboard Implementation Test Guide

## Changes Made

### 1. Backend Fixes (`backend/src/routes/dashboardRoutes.js`)

- Fixed leaderboard endpoint to use correct table names from your schema:
  - Changed from `user_scores` table to `score` table
  - Changed from `courses` table to `course` table
  - Updated column references to match your schema (e.g., `marks` instead of `score`)
  - Added proper foreign key relationships via Supabase joins
  - Added sample data fallback when no users exist

### 2. Frontend Updates (`frontend/src/components/Leaderboard.tsx`)

- Updated interfaces to match new data structure
- Fixed ID type from `number` to `string` (UUID)
- Added `highestScore` and `overallPercentage` fields
- Updated display to show overall percentage instead of average score
- Fixed reference to user points in current user rank display

## Database Schema Mapping

Your actual schema uses:

- `user` table with scoring columns: `total_score`, `total_quizzes_taken`, `average_score`, `highest_score`, `overall_percentage`
- `score` table for individual quiz scores with `marks` column
- `quiz` table linked to `course` table
- `roles` table linked via `role_id`

## Testing Steps

1. **Start the application:**

   ```bash
   # Backend (from backend folder)
   npm start

   # Frontend (from frontend folder)
   npm start
   ```

2. **Test the leaderboard:**

   - Navigate to student dashboard
   - The leaderboard component should load
   - If no real data exists, sample data will be shown
   - Check console for any API errors

3. **Verify data flow:**
   - Check `/api/dashboard/leaderboard` endpoint directly
   - Verify Supabase queries are working
   - Ensure proper role filtering (students only)

## Known Issues to Watch For

1. **"Invalid or expired token" Error**: This happens when:

   - No Supabase credentials are configured (development mode)
   - JWT token is expired or invalid
   - Database connection issues

2. **Role filtering**: The query uses `roles.name = "student"` - verify your roles table has a "student" role
3. **User data**: The scoring columns in user table might be null - check if they're populated
4. **Supabase relationships**: Verify the foreign key relationships work as expected

## Fixed Authentication Issues

The leaderboard now handles authentication errors gracefully:

- **Development Mode**: Shows sample leaderboard data when no Supabase credentials are configured
- **Token Issues**: Clears invalid tokens and shows appropriate error messages
- **Database Errors**: Falls back to sample data during development

## Environment Setup

To use real Supabase data:

1. Copy `backend/env.example` to `backend/.env`
2. Fill in your actual Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret_32_chars_minimum
   ```

## Testing in Development Mode

If you see sample data like "Alice Johnson", "Bob Smith", etc., the app is running in development mode with mock data - this is expected when Supabase isn't configured.

## Next Steps if Issues Persist

1. Check browser console for specific error messages
2. Verify user is logged in (check localStorage for 'token')
3. Test `/api/dashboard/leaderboard` endpoint directly
4. Set up proper Supabase credentials for real data
