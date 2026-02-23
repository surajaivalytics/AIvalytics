const { supabase } = require("./src/config/database");

async function testAttendanceDirectly() {
  try {
    console.log("🔍 Testing attendance data with real database connection...");

    // Test raw attendance table
    console.log("\n1. Testing raw attendance table:");
    const { data: rawAttendance, error: rawError } = await supabase
      .from("attendance")
      .select("*")
      .limit(3);

    if (rawError) {
      console.error("❌ Raw attendance error:", rawError);
    } else {
      console.log(`✅ Found ${rawAttendance?.length || 0} attendance records`);
      if (rawAttendance && rawAttendance.length > 0) {
        console.log("Sample record:", {
          id: rawAttendance[0].id?.substring(0, 8) + "...",
          student_id: rawAttendance[0].student_id?.substring(0, 8) + "...",
          course_id: rawAttendance[0].course_id?.substring(0, 8) + "...",
          attendance_status: rawAttendance[0].attendance_status,
          session_id: rawAttendance[0].session_id?.substring(0, 8) + "...",
        });
      }
    }

    // Test attendance_overview view
    console.log("\n2. Testing attendance_overview view:");
    const { data: overviewData, error: overviewError } = await supabase
      .from("attendance_overview")
      .select("*")
      .limit(3);

    if (overviewError) {
      console.error("❌ Overview view error:", overviewError);
      console.log("This might be why the frontend is failing!");
    } else {
      console.log(`✅ Found ${overviewData?.length || 0} overview records`);
      if (overviewData && overviewData.length > 0) {
        console.log("Sample overview record:", {
          student_name: overviewData[0].student_name,
          course_name: overviewData[0].course_name,
          attendance_status: overviewData[0].attendance_status,
          session_date: overviewData[0].session_date,
        });
      }
    }

    // Test attendance_summary table
    console.log("\n3. Testing attendance_summary table:");
    const { data: summaryData, error: summaryError } = await supabase
      .from("attendance_summary")
      .select("*")
      .limit(3);

    if (summaryError) {
      console.error("❌ Summary table error:", summaryError);
    } else {
      console.log(`✅ Found ${summaryData?.length || 0} summary records`);
      if (summaryData && summaryData.length > 0) {
        console.log("Sample summary record:", {
          course_name: summaryData[0].course_name,
          attendance_percentage: summaryData[0].attendance_percentage,
          status: summaryData[0].status,
        });
      }
    }

    // Test with a specific student query (simulate the controller)
    if (rawAttendance && rawAttendance.length > 0) {
      const testStudentId = rawAttendance[0].student_id;
      console.log(
        `\n4. Testing student-specific query (${testStudentId?.substring(
          0,
          8
        )}...):`
      );

      const { data: studentAttendance, error: studentError } = await supabase
        .from("attendance_overview")
        .select("*")
        .eq("student_id", testStudentId)
        .order("session_date", { ascending: false })
        .range(0, 49);

      if (studentError) {
        console.error("❌ Student query error:", studentError);
      } else {
        console.log(
          `✅ Found ${studentAttendance?.length || 0} records for this student`
        );
      }

      // Test summary for the same student
      const { data: studentSummary, error: summaryQueryError } = await supabase
        .from("attendance_summary")
        .select("*")
        .eq("student_id", testStudentId);

      if (summaryQueryError) {
        console.error("❌ Student summary error:", summaryQueryError);
      } else {
        console.log(
          `✅ Found ${
            studentSummary?.length || 0
          } summary records for this student`
        );
      }
    }

    console.log("\n🎉 Direct database test completed!");
  } catch (error) {
    console.error("💥 Unexpected error:", error);
  }
}

testAttendanceDirectly();
