# 🏆 Leaderboard System Documentation

## Overview

The leaderboard system automatically calculates and ranks student performance based on their quiz scores. It uses PostgreSQL triggers to update statistics in real-time whenever a student completes a quiz.

## 🚀 Features

- **Automatic Calculation**: Student stats are updated automatically when quiz scores are recorded
- **Real-time Updates**: Leaderboard rankings update immediately after quiz completion
- **Weighted Scoring**: Uses a sophisticated point system that considers multiple factors
- **Performance Optimized**: Uses database views and indexes for fast queries
- **Fallback Support**: Provides sample data for development environments

## 📊 Scoring System

The leaderboard uses a weighted point system:

```
Leaderboard Points = (Total Score × 2) + (Quiz Count × 10) + (Overall Percentage × 1.5)
```

### Ranking Priority:

1. **Leaderboard Points** (primary)
2. **Overall Percentage** (secondary)
3. **Total Score** (tertiary)

## 🗃️ Database Structure

### New User Table Fields

| Field                 | Type         | Description                           |
| --------------------- | ------------ | ------------------------------------- |
| `total_score`         | INTEGER      | Sum of all marks obtained             |
| `total_quizzes_taken` | INTEGER      | Number of quizzes completed           |
| `average_score`       | DECIMAL(5,2) | Average marks per quiz                |
| `highest_score`       | INTEGER      | Best single quiz score                |
| `overall_percentage`  | DECIMAL(5,2) | Overall percentage across all quizzes |
| `leaderboard_points`  | INTEGER      | Calculated ranking points             |

### Score Table (Updated)

| Field            | Type         | Description                |
| ---------------- | ------------ | -------------------------- |
| `marks_obtained` | INTEGER      | Points earned in quiz      |
| `total_marks`    | INTEGER      | Maximum possible points    |
| `percentage`     | DECIMAL(5,2) | Auto-calculated percentage |

## 🔧 Installation & Setup

### 1. Run the Migration

```bash
# Option A: Using the migration script
cd backend
node run-leaderboard-migration.js

# Option B: Manual SQL execution
# Run the SQL from backend/scripts/leaderboard_system.sql
# in your database management tool
```

### 2. Restart Backend Server

```bash
cd backend
npm start
```

### 3. Verify Installation

- Check student dashboard for leaderboard display
- Take a quiz to test automatic updates
- Verify rankings update correctly

## 🔄 How It Works

### Automatic Triggers

The system uses PostgreSQL triggers that fire when:

- A new score is inserted (`INSERT`)
- An existing score is updated (`UPDATE`)
- A score is deleted (`DELETE`)

### Trigger Flow:

1. Student completes quiz → Score inserted into `score` table
2. Trigger fires → Calls `update_user_leaderboard_stats(user_id)`
3. Function calculates new statistics from all user's scores
4. User table updated with new stats
5. Leaderboard view automatically reflects changes

### Database Functions

| Function                              | Purpose                                   |
| ------------------------------------- | ----------------------------------------- |
| `update_user_leaderboard_stats(uuid)` | Updates stats for specific user           |
| `refresh_all_leaderboard_stats()`     | Refreshes all student stats (maintenance) |
| `get_leaderboard(limit, user_id)`     | Retrieves ranked leaderboard data         |

## 🎯 API Endpoints

### Get Leaderboard

```
GET /api/dashboard/leaderboard?limit=10
```

**Response:**

```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "id": "user-uuid",
        "name": "Student Name",
        "points": 450,
        "quizCount": 12,
        "averageScore": 92.5,
        "highestScore": 98,
        "overallPercentage": 92.5,
        "isCurrentUser": false
      }
    ],
    "currentUserRank": {
      "rank": 4,
      "id": "current-user-uuid",
      "name": "Current User",
      "points": 375,
      "quizCount": 9,
      "averageScore": 79.8,
      "highestScore": 87,
      "overallPercentage": 79.8,
      "isCurrentUser": true
    }
  }
}
```

## 🎨 Frontend Integration

### Leaderboard Component

The `Leaderboard.tsx` component:

- Fetches data from the API endpoint
- Displays rankings with user positions
- Shows performance metrics
- Handles loading and error states
- Provides fallback data for development

### Usage in Dashboard

```tsx
import Leaderboard from "../components/Leaderboard";

// In your dashboard component
<Leaderboard maxItems={10} title="Class Leaderboard" />;
```

## 🛠️ Maintenance

### Manual Stats Refresh

If you need to recalculate all statistics:

```sql
SELECT refresh_all_leaderboard_stats();
```

### Performance Monitoring

The system includes several indexes for optimal performance:

- `idx_user_leaderboard_points` - For ranking queries
- `idx_user_total_score` - For score-based sorting
- `idx_user_overall_percentage` - For percentage-based sorting

### Troubleshooting

#### No Leaderboard Data

1. Check if students have completed quizzes
2. Verify triggers are installed: `\df trigger_update_leaderboard_stats`
3. Manual refresh: `SELECT refresh_all_leaderboard_stats();`

#### Performance Issues

1. Check index usage: `EXPLAIN ANALYZE SELECT * FROM leaderboard_view;`
2. Monitor trigger execution time
3. Consider pagination for large datasets

## 🔒 Security Considerations

- Leaderboard data respects user privacy (only shows usernames)
- API requires authentication
- Row Level Security (RLS) policies protect data access
- Only students with quiz attempts appear in rankings

## 🚀 Future Enhancements

Potential improvements:

- Course-specific leaderboards
- Time-based rankings (weekly/monthly)
- Achievement badges
- Leaderboard history tracking
- Export functionality

## 📝 Migration Notes

- **Safe Operation**: Migration uses `IF NOT EXISTS` clauses
- **Backwards Compatible**: Existing data is preserved
- **Automatic Population**: Existing scores are processed during setup
- **Rollback**: Can be reversed by dropping added columns and functions

## 🤝 Contributing

When modifying the leaderboard system:

1. Update this documentation
2. Test with sample data
3. Verify trigger performance
4. Update frontend components accordingly
5. Consider backwards compatibility

---

**Last Updated**: January 2025  
**Version**: 1.0.0
