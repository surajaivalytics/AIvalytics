/**
 * One-time migration script: Supabase REST API → Firebase Firestore
 * Usage:  node scripts/migrate-from-supabase.js
 *         node scripts/migrate-from-supabase.js --dry-run
 */

require("dotenv").config();
const admin = require("firebase-admin");
const https = require("https");

// ─── Firebase Admin Init ──────────────────────────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
const db = admin.firestore();

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN       = process.argv.includes("--dry-run");
const BATCH_SIZE    = 400;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from .env");
  process.exit(1);
}

// ─── HTTPS helper (no external deps) ─────────────────────────────────────────
function supabaseFetch(table, select = "*") {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    urlObj.searchParams.set("select", select);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`Table "${table}" → HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`Table "${table}" → JSON parse error: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on("error", (e) => reject(new Error(`Table "${table}" → ${e.message}`)));
    req.end();
  });
}

// ─── Firestore batch writer ───────────────────────────────────────────────────
async function writeBatch(collection, docs) {
  if (!docs || docs.length === 0) return;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const chunk = docs.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    for (const doc of chunk) {
      batch.set(db.collection(collection).doc(String(doc.id)), doc, { merge: true });
    }
    if (!DRY_RUN) await batch.commit();
  }
}

// ─── Try table name variants ──────────────────────────────────────────────────
async function fetchTable(names, select = "*") {
  for (const name of names) {
    try {
      const rows = await supabaseFetch(name, select);
      console.log(`  → found as "${name}" (${rows.length} rows)`);
      return rows;
    } catch (e) {
      if (!e.message.includes("HTTP 404") && !e.message.includes("does not exist")) {
        // Real error - re-throw
        if (e.message.includes("HTTP 4") || e.message.includes("HTTP 5")) continue;
      }
    }
  }
  return [];
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("═".repeat(60));
  console.log("  AIvalytics: Supabase → Firebase Firestore Migration");
  console.log(`  Supabase: ${SUPABASE_URL}`);
  console.log(`  Mode: ${DRY_RUN ? "🔍 DRY RUN (no writes)" : "🚀 LIVE MIGRATION"}`);
  console.log("═".repeat(60));

  const results = {};

  // ── Roles (lookup only) ─────────────────────────────────────────────────
  console.log("\n🔑  Fetching roles...");
  const roles = await fetchTable(["roles", "role"]);
  const roleMap = Object.fromEntries((roles || []).map((r) => [String(r.id), r.name]));
  if (roles.length) console.log(`  Roles: ${roles.map((r) => r.name).join(", ")}`);

  // ── Users ───────────────────────────────────────────────────────────────
  console.log("\n👥  Fetching users...");
  const rawUsers = await fetchTable(["user", "users"]);
  if (rawUsers.length > 0) {
    const docs = rawUsers.map((u) => ({
      id: String(u.id),
      username: u.username || "",
      email: u.email || "",
      password_hash: u.password_hash || "",
      roll_number: u.roll_number || null,
      role: roleMap[String(u.role_id)] || u.role || "student",
      class_id: u.class_id ? String(u.class_id) : null,
      course_ids: Array.isArray(u.course_ids) ? u.course_ids.map(String) : [],
      deleted_at: u.deleted_at || null,
      created_at: u.created_at || new Date().toISOString(),
      updated_at: u.updated_at || new Date().toISOString(),
      total_score: u.total_score || 0,
      total_quizzes_taken: u.total_quizzes_taken || 0,
      average_score: u.average_score || 0,
      highest_score: u.highest_score || 0,
      overall_percentage: u.overall_percentage || 0,
      leaderboard_points: u.leaderboard_points || 0,
    }));
    if (DRY_RUN) {
      console.log("  Sample user document:");
      console.log(JSON.stringify(docs[0], null, 2));
    } else {
      await writeBatch("user", docs);
      console.log(`  ✅  Written ${docs.length} users`);
    }
    results.users = docs.length;
  }

  // ── Departments ─────────────────────────────────────────────────────────
  console.log("\n🏢  Fetching departments...");
  const rawDepts = await fetchTable(["department", "departments"]);
  if (rawDepts.length > 0) {
    const docs = rawDepts.map((d) => ({
      id: String(d.id),
      name: d.name || "",
      created_at: d.created_at || new Date().toISOString(),
      updated_at: d.updated_at || new Date().toISOString(),
    }));
    if (!DRY_RUN) { await writeBatch("department", docs); console.log(`  ✅  Written ${docs.length} departments`); }
    results.departments = docs.length;
  }

  // ── Classes ─────────────────────────────────────────────────────────────
  console.log("\n🏫  Fetching classes...");
  const rawClasses = await fetchTable(["class", "classes"]);
  if (rawClasses.length > 0) {
    const docs = rawClasses.map((c) => ({
      id: String(c.id),
      name: c.name || "",
      department_id: c.department_id ? String(c.department_id) : null,
      num_students: c.num_students || 0,
      class_teacher_id: c.class_teacher_id ? String(c.class_teacher_id) : null,
      created_at: c.created_at || new Date().toISOString(),
      updated_at: c.updated_at || new Date().toISOString(),
    }));
    if (!DRY_RUN) { await writeBatch("class", docs); console.log(`  ✅  Written ${docs.length} classes`); }
    results.classes = docs.length;
  }

  // ── Courses ─────────────────────────────────────────────────────────────
  console.log("\n📚  Fetching courses...");
  const rawCourses = await fetchTable(["course", "courses"]);
  if (rawCourses.length > 0) {
    const docs = rawCourses.map((c) => ({
      id: String(c.id),
      name: c.name || "",
      about: c.about || "",
      created_by: c.created_by ? String(c.created_by) : null,
      updated_by: c.updated_by ? String(c.updated_by) : null,
      duration_months: c.duration_months || 6,
      start_date: c.start_date || null,
      end_date: c.end_date || null,
      enrollment_deadline: c.enrollment_deadline || null,
      is_active: c.is_active !== false,
      progress_percentage: c.progress_percentage || 0,
      deleted_at: c.deleted_at || null,
      created_at: c.created_at || new Date().toISOString(),
      updated_at: c.updated_at || new Date().toISOString(),
    }));
    if (!DRY_RUN) { await writeBatch("course", docs); console.log(`  ✅  Written ${docs.length} courses`); }
    results.courses = docs.length;
  }

  // ── Quizzes ─────────────────────────────────────────────────────────────
  console.log("\n📝  Fetching quizzes...");
  const rawQuizzes = await fetchTable(["quiz", "quizzes", "mcq", "mcqs"]);
  if (rawQuizzes.length > 0) {
    const docs = rawQuizzes.map((q) => ({
      ...q,
      id: String(q.id),
      course_id: q.course_id ? String(q.course_id) : null,
      created_by: q.created_by ? String(q.created_by) : null,
      deleted_at: q.deleted_at || null,
    }));
    if (!DRY_RUN) { await writeBatch("quiz", docs); console.log(`  ✅  Written ${docs.length} quizzes`); }
    results.quizzes = docs.length;
  }

  // ── Scores ──────────────────────────────────────────────────────────────
  console.log("\n🏆  Fetching scores...");
  const rawScores = await fetchTable(["score", "scores", "user_scores"]);
  if (rawScores.length > 0) {
    const docs = rawScores.map((s) => ({
      ...s,
      id: String(s.id),
      user_id: s.user_id ? String(s.user_id) : null,
      quiz_id: s.quiz_id ? String(s.quiz_id) : null,
      deleted_at: s.deleted_at || null,
    }));
    if (!DRY_RUN) { await writeBatch("score", docs); console.log(`  ✅  Written ${docs.length} scores`); }
    results.scores = docs.length;
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("  Migration Summary");
  console.log("═".repeat(60));
  for (const [k, v] of Object.entries(results)) {
    console.log(`  ${k.padEnd(15)} ${v} records`);
  }
  if (Object.keys(results).length === 0) {
    console.log("  ⚠️  No data found in any table.");
  }
  console.log("═".repeat(60));

  if (DRY_RUN) {
    console.log("\n🔍  DRY RUN complete. Run without --dry-run to write to Firestore.");
  } else {
    console.log("\n✅  Migration complete! Existing credentials should now work.");
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌  Fatal:", err.message);
  process.exit(1);
});
