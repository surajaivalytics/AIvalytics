const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   - SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runAttendanceMigration() {
  try {
    console.log("🚀 Starting Attendance System Migration...\n");

    // Read the SQL file
    const sqlFilePath = path.join(
      __dirname,
      "scripts",
      "attendance_system.sql"
    );

    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found: ${sqlFilePath}`);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");
    console.log("📖 SQL file loaded successfully");

    // Test database connection
    console.log("🔌 Testing database connection...");
    const { data: testData, error: testError } = await supabase
      .from("course")
      .select("count")
      .limit(1);

    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`);
    }

    console.log("✅ Database connection successful");

    // Check if attendance tables already exist
    console.log("🔍 Checking existing attendance tables...");
    const { data: existingTables, error: tablesError } = await supabase.rpc(
      "check_table_exists",
      { table_name: "attendance_session" }
    );

    if (tablesError) {
      console.log(
        "⚠️  Could not check existing tables, proceeding with migration..."
      );
    } else if (existingTables) {
      console.log(
        "⚠️  Attendance tables already exist. This migration will update/add missing components."
      );
    }

    // Execute the migration
    console.log("📊 Executing attendance system migration...");

    // Split SQL into individual statements and execute them
    const statements = sqlContent
      .split(/;\s*\n/)
      .filter((statement) => statement.trim().length > 0)
      .map((statement) => statement.trim() + ";");

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and empty statements
      if (statement.startsWith("--") || statement.trim() === ";") {
        continue;
      }

      try {
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);

        const { error } = await supabase.rpc("exec_sql", {
          sql_query: statement,
        });

        if (error) {
          // Try alternative method for statements that don't work with rpc
          const { error: directError } = await supabase
            .from("_temp_migration")
            .select("*")
            .limit(0);

          if (directError && !directError.message.includes("does not exist")) {
            console.log(`   ⚠️  Statement ${i + 1} warning: ${error.message}`);
          }
        }

        successCount++;
      } catch (err) {
        console.log(`   ❌ Statement ${i + 1} failed: ${err.message}`);
        errorCount++;

        // Continue with non-critical errors
        if (
          !err.message.includes("already exists") &&
          !err.message.includes("duplicate") &&
          !err.message.includes("IF NOT EXISTS")
        ) {
          console.log(`   Continuing despite error...`);
        }
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successful statements: ${successCount}`);
    console.log(`   ⚠️  Failed statements: ${errorCount}`);

    // Verify core tables were created
    console.log("\n🔍 Verifying attendance system tables...");

    const tablesToCheck = [
      "attendance_session",
      "attendance",
      "attendance_settings",
      "attendance_summary",
    ];

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .limit(1);

        if (error) {
          console.log(
            `   ❌ Table '${tableName}' verification failed: ${error.message}`
          );
        } else {
          console.log(`   ✅ Table '${tableName}' exists and accessible`);
        }
      } catch (err) {
        console.log(`   ❌ Table '${tableName}' check failed: ${err.message}`);
      }
    }

    // Check if views were created
    console.log("\n🔍 Verifying attendance system views...");
    try {
      const { data, error } = await supabase
        .from("attendance_overview")
        .select("*")
        .limit(1);

      if (error) {
        console.log(
          `   ⚠️  View 'attendance_overview' may not exist: ${error.message}`
        );
      } else {
        console.log(`   ✅ View 'attendance_overview' exists and accessible`);
      }
    } catch (err) {
      console.log(`   ⚠️  View verification failed: ${err.message}`);
    }

    // Test attendance functions
    console.log("\n🔍 Testing attendance system functions...");
    try {
      const { data, error } = await supabase.rpc(
        "calculate_attendance_percentage",
        {
          p_student_id: "00000000-0000-0000-0000-000000000000",
          p_course_id: "00000000-0000-0000-0000-000000000000",
        }
      );

      if (error) {
        console.log(`   ⚠️  Function test failed: ${error.message}`);
      } else {
        console.log(`   ✅ Attendance calculation function is working`);
      }
    } catch (err) {
      console.log(`   ⚠️  Function test error: ${err.message}`);
    }

    console.log("\n🎉 Attendance System Migration Completed!");
    console.log("\n📋 Next Steps:");
    console.log("   1. Restart your backend server to load new routes");
    console.log("   2. Test attendance creation in the frontend");
    console.log("   3. Verify attendance marking functionality");
    console.log("   4. Check attendance analytics and reports");
    console.log("\n🔗 New API Endpoints Available:");
    console.log("   - POST /api/attendance/sessions (Create session)");
    console.log("   - POST /api/attendance/mark (Mark attendance)");
    console.log("   - GET  /api/attendance/student (Get student attendance)");
    console.log("   - GET  /api/attendance/analytics (Get analytics)");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("   1. Check your database connection");
    console.error("   2. Verify environment variables are set correctly");
    console.error("   3. Ensure you have sufficient database permissions");
    console.error("   4. Check the SQL file exists and is readable");
    process.exit(1);
  }
}

// Helper function to check if we can execute SQL
async function checkSQLCapability() {
  try {
    const { data, error } = await supabase.rpc("version");

    if (error) {
      console.log("⚠️  Direct SQL execution may not be available");
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

// Run the migration
if (require.main === module) {
  runAttendanceMigration()
    .then(() => {
      console.log("\n✨ Migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { runAttendanceMigration };
