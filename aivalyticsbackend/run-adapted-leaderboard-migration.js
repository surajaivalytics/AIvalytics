const fs = require("fs");
const path = require("path");

async function runAdaptedLeaderboardMigration() {
  try {
    console.log("🚀 Starting adapted leaderboard system migration...");
    console.log("📊 This version works with your existing database schema");

    // Read the adapted SQL migration file
    const migrationPath = path.join(
      __dirname,
      "scripts",
      "leaderboard_system_adapted.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("📄 Adapted migration file loaded successfully");
    console.log(
      "📝 Please copy and execute this SQL in your Supabase SQL Editor:"
    );
    console.log("=".repeat(80));
    console.log(migrationSQL);
    console.log("=".repeat(80));

    console.log("\n🔧 Setup Instructions:");
    console.log("1. Copy the SQL above");
    console.log("2. Open Supabase Dashboard → SQL Editor");
    console.log('3. Paste the SQL and click "Run"');
    console.log("4. Restart your backend server");
    console.log("5. Test the leaderboard in student dashboard");

    console.log("\n✅ Key Adaptations Made:");
    console.log('• Uses existing "marks" field (not marks_obtained)');
    console.log("• Joins with quiz table to get max_score");
    console.log("• Works with your current user table structure");
    console.log("• Only adds leaderboard_points field (others exist)");
    console.log("• Preserves all existing data and functionality");
  } catch (error) {
    console.error("❌ Error reading migration file:", error);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  runAdaptedLeaderboardMigration()
    .then(() => {
      console.log(
        "\n🎉 Ready to execute! Copy the SQL and run it in Supabase."
      );
    })
    .catch((error) => {
      console.error("💥 Script failed:", error);
      process.exit(1);
    });
}

module.exports = { runAdaptedLeaderboardMigration };
