const { supabase } = require("./src/config/database");

async function runMigration() {
  try {
    console.log("Running migration: add-quiz-status-column.sql");

    // First, let's check if the status column already exists
    console.log("Checking if status column exists...");
    const { data: columns, error: checkError } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "quiz")
      .eq("column_name", "status");

    if (checkError) {
      console.error("Error checking column existence:", checkError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log("✓ Status column already exists");
    } else {
      console.log(
        "Status column does not exist. This migration requires manual execution."
      );
      console.log("Please run the following SQL in your Supabase SQL editor:");
      console.log(`
ALTER TABLE quiz ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive'));

CREATE INDEX IF NOT EXISTS idx_quiz_status ON quiz (status);

UPDATE quiz SET status = 'active' WHERE status IS NULL OR status = 'draft';
      `);
      return;
    }

    // Update existing quizzes to active status if they don't have a status
    console.log("Updating existing quizzes to active status...");
    const { error: updateError } = await supabase
      .from("quiz")
      .update({ status: "active" })
      .is("status", null);

    if (updateError) {
      console.error("Error updating existing quizzes:", updateError);
    } else {
      console.log("✓ Existing quizzes updated successfully");
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

runMigration();
