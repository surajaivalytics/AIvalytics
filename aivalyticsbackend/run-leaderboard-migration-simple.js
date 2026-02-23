const fs = require("fs");
const path = require("path");

async function runSimpleLeaderboardMigration() {
  try {
    console.log("🚀 Starting simple leaderboard system migration...");

    // Read the SQL migration file
    const migrationPath = path.join(
      __dirname,
      "scripts",
      "leaderboard_system.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("📄 Migration file loaded successfully");
    console.log("📝 Please run this SQL manually in your database:");
    console.log("=".repeat(80));
    console.log(migrationSQL);
    console.log("=".repeat(80));

    console.log("\n🔧 Manual Setup Instructions:");
    console.log("1. Copy the SQL above");
    console.log(
      "2. Open your database management tool (Supabase dashboard, pgAdmin, etc.)"
    );
    console.log("3. Paste and execute the SQL");
    console.log("4. Restart your backend server");
    console.log("5. Test the leaderboard in student dashboard");

    console.log("\n📊 Alternative: Execute via psql command line:");
    console.log(
      "psql -d your_database -f backend/scripts/leaderboard_system.sql"
    );
  } catch (error) {
    console.error("❌ Error reading migration file:", error);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  runSimpleLeaderboardMigration()
    .then(() => {
      console.log("\n✅ Migration instructions provided.");
      console.log(
        "Execute the SQL manually and then restart your backend server."
      );
    })
    .catch((error) => {
      console.error("💥 Script failed:", error);
      process.exit(1);
    });
}

module.exports = { runSimpleLeaderboardMigration };
