-- Leaderboard System Setup (Adapted for Existing Schema)
-- This script works with your existing database structure without breaking anything

-- Step 1: Add missing leaderboard fields to the user table (only if they don't exist)
-- Note: Some fields like total_score already exist in your schema
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS leaderboard_points INTEGER DEFAULT 0;

-- Step 2: Add indexes for better leaderboard query performance
CREATE INDEX IF NOT EXISTS idx_user_total_score ON "user" (total_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_leaderboard_points ON "user" (leaderboard_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_overall_percentage ON "user" (overall_percentage DESC);

-- Step 3: Create function to calculate and update user statistics
-- This version uses your existing schema field names
CREATE OR REPLACE FUNCTION update_user_leaderboard_stats(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    user_total_score INTEGER;
    user_quiz_count INTEGER;
    user_avg_score NUMERIC;
    user_highest_score INTEGER;
    user_overall_percentage NUMERIC;
    user_leaderboard_points INTEGER;
    user_total_possible INTEGER;
BEGIN
    -- Calculate statistics from score table using existing field names
    SELECT 
        COALESCE(SUM(s.marks), 0) as total_score,
        COALESCE(COUNT(*), 0) as quiz_count,
        COALESCE(AVG(s.marks), 0) as avg_score,
        COALESCE(MAX(s.marks), 0) as highest_score,
        COALESCE(SUM(q.max_score), 0) as total_possible
    INTO 
        user_total_score,
        user_quiz_count,
        user_avg_score,
        user_highest_score,
        user_total_possible
    FROM score s
    JOIN quiz q ON s.quiz_id = q.id
    WHERE s.user_id = user_uuid 
      AND s.deleted_at IS NULL;
    
    -- Calculate overall percentage
    IF user_total_possible > 0 THEN
        user_overall_percentage = (user_total_score::NUMERIC / user_total_possible::NUMERIC) * 100;
    ELSE
        user_overall_percentage = 0;
    END IF;
    
    -- Calculate leaderboard points (weighted scoring system)
    -- Points = (total_score * 2) + (quiz_count * 10) + (overall_percentage * 1.5)
    user_leaderboard_points = 
        (user_total_score * 2) + 
        (user_quiz_count * 10) + 
        ROUND(user_overall_percentage * 1.5);
    
    -- Update user table with calculated statistics
    UPDATE "user" 
    SET 
        total_score = user_total_score,
        total_quizzes_taken = user_quiz_count,
        average_score = user_avg_score,
        highest_score = user_highest_score,
        total_possible_score = user_total_possible,
        overall_percentage = user_overall_percentage,
        leaderboard_points = user_leaderboard_points,
        score_updated_at = NOW(),
        updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Log the update for debugging
    RAISE NOTICE 'Updated leaderboard stats for user %: Score=%, Quizzes=%, Points=%', 
        user_uuid, user_total_score, user_quiz_count, user_leaderboard_points;
        
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger function for automatic updates
CREATE OR REPLACE FUNCTION trigger_update_leaderboard_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats for the affected user
    IF TG_OP = 'DELETE' THEN
        PERFORM update_user_leaderboard_stats(OLD.user_id);
        RETURN OLD;
    ELSE
        PERFORM update_user_leaderboard_stats(NEW.user_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create triggers on score table
DROP TRIGGER IF EXISTS trigger_score_insert_update ON score;
DROP TRIGGER IF EXISTS trigger_score_delete ON score;

CREATE TRIGGER trigger_score_insert_update
    AFTER INSERT OR UPDATE ON score
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_leaderboard_stats();

CREATE TRIGGER trigger_score_delete
    AFTER DELETE ON score
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_leaderboard_stats();

-- Step 6: Create function to refresh all user statistics (for maintenance)
CREATE OR REPLACE FUNCTION refresh_all_leaderboard_stats()
RETURNS INTEGER AS $$
DECLARE
    user_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    -- Update stats for all students
    FOR user_record IN 
        SELECT u.id 
        FROM "user" u 
        JOIN roles r ON u.role_id = r.id 
        WHERE r.name = 'student' AND u.deleted_at IS NULL
    LOOP
        PERFORM update_user_leaderboard_stats(user_record.id);
        updated_count := updated_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Refreshed leaderboard stats for % users', updated_count;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create leaderboard view for easy querying
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    u.id,
    u.username,
    u.total_score,
    u.total_quizzes_taken,
    u.average_score,
    u.highest_score,
    u.overall_percentage,
    u.leaderboard_points,
    ROW_NUMBER() OVER (ORDER BY u.leaderboard_points DESC, u.overall_percentage DESC, u.total_score DESC) as rank
FROM "user" u
JOIN roles r ON u.role_id = r.id
WHERE r.name = 'student' 
  AND u.deleted_at IS NULL
  AND u.total_quizzes_taken > 0;

-- Step 8: Create function to get top N leaderboard entries
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 10, user_id_filter UUID DEFAULT NULL)
RETURNS TABLE(
    id UUID,
    username VARCHAR,
    total_score INTEGER,
    total_quizzes_taken INTEGER,
    average_score NUMERIC,
    highest_score INTEGER,
    overall_percentage NUMERIC,
    leaderboard_points INTEGER,
    rank BIGINT,
    is_current_user BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lv.id,
        lv.username,
        lv.total_score,
        lv.total_quizzes_taken,
        lv.average_score,
        lv.highest_score,
        lv.overall_percentage,
        lv.leaderboard_points,
        lv.rank,
        CASE WHEN user_id_filter IS NOT NULL THEN lv.id = user_id_filter ELSE FALSE END as is_current_user
    FROM leaderboard_view lv
    ORDER BY lv.rank
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Add comments for documentation
COMMENT ON COLUMN "user".leaderboard_points IS 'Calculated points for leaderboard ranking (weighted formula)';
COMMENT ON FUNCTION update_user_leaderboard_stats(UUID) IS 'Updates leaderboard statistics for a specific user based on their quiz scores';
COMMENT ON FUNCTION refresh_all_leaderboard_stats() IS 'Refreshes leaderboard statistics for all students - use for maintenance';
COMMENT ON VIEW leaderboard_view IS 'View showing current leaderboard rankings with all relevant statistics';

-- Step 10: Initial data population
-- Run this to populate existing data (this will be automatically handled by triggers going forward)
SELECT refresh_all_leaderboard_stats();

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '✅ Leaderboard system setup completed successfully!';
    RAISE NOTICE '📊 Adapted to existing database schema';
    RAISE NOTICE '🔄 Created automatic triggers for score updates';
    RAISE NOTICE '🏆 Created leaderboard view and helper functions';
    RAISE NOTICE '🚀 System is ready to track student performance automatically';
END $$; 