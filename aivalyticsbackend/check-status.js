/**
 * Quick Status Checker
 * Run this to see if your backend is configured for development or production mode
 */

require('dotenv').config();

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

console.clear();
log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
log('║          Backend Configuration Status Checker             ║', 'bright');
log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

// Check environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Placeholder values that indicate development mode
const placeholders = [
    'your_supabase_project_url',
    'your_supabase_anon_key_here',
    'your_supabase_service_role_key_here',
    'https://your-project.supabase.co',
];

// Check each credential
log('📋 Checking Configuration:\n', 'cyan');

// SUPABASE_URL
if (!supabaseUrl) {
    log('  ❌ SUPABASE_URL: Missing', 'red');
} else if (placeholders.includes(supabaseUrl)) {
    log('  ⚠️  SUPABASE_URL: Placeholder value', 'yellow');
} else {
    log(`  ✅ SUPABASE_URL: ${supabaseUrl}`, 'green');
}

// SUPABASE_ANON_KEY
if (!supabaseAnonKey) {
    log('  ❌ SUPABASE_ANON_KEY: Missing', 'red');
} else if (placeholders.includes(supabaseAnonKey)) {
    log('  ⚠️  SUPABASE_ANON_KEY: Placeholder value', 'yellow');
} else if (supabaseAnonKey.startsWith('eyJ')) {
    log('  ✅ SUPABASE_ANON_KEY: Valid JWT token', 'green');
} else {
    log('  ⚠️  SUPABASE_ANON_KEY: Set but may be invalid', 'yellow');
}

// SUPABASE_SERVICE_ROLE_KEY
if (!supabaseServiceKey) {
    log('  ❌ SUPABASE_SERVICE_ROLE_KEY: Missing', 'red');
} else if (placeholders.includes(supabaseServiceKey)) {
    log('  ⚠️  SUPABASE_SERVICE_ROLE_KEY: Placeholder value', 'yellow');
} else if (supabaseServiceKey.startsWith('eyJ')) {
    log('  ✅ SUPABASE_SERVICE_ROLE_KEY: Valid JWT token', 'green');
} else if (supabaseServiceKey.startsWith('sb_publishable_')) {
    log('  ❌ SUPABASE_SERVICE_ROLE_KEY: Wrong key type (publishable key)', 'red');
    log('     You need the service_role key, not the publishable key!', 'yellow');
} else {
    log('  ⚠️  SUPABASE_SERVICE_ROLE_KEY: Set but may be invalid', 'yellow');
}

log('\n' + '─'.repeat(60) + '\n', 'cyan');

// Determine mode
const isDevelopmentMode =
    !supabaseUrl ||
    !supabaseAnonKey ||
    !supabaseServiceKey ||
    placeholders.includes(supabaseUrl) ||
    placeholders.includes(supabaseAnonKey) ||
    placeholders.includes(supabaseServiceKey) ||
    !supabaseServiceKey.startsWith('eyJ');

if (isDevelopmentMode) {
    log('🔧 Current Mode: DEVELOPMENT', 'yellow');
    log('\nYour backend will use:', 'cyan');
    log('  • Mock database (in-memory storage)', 'yellow');
    log('  • Pre-configured test users', 'yellow');
    log('  • Temporary data (lost on restart)', 'yellow');

    log('\n💡 To enable production mode:', 'cyan');
    log('  1. Get your service_role key from Supabase dashboard', 'blue');
    log('  2. Update SUPABASE_SERVICE_ROLE_KEY in .env file', 'blue');
    log('  3. Run the database schema in Supabase SQL Editor', 'blue');
    log('\n📖 See SETUP_GUIDE.md for detailed instructions\n', 'green');
} else {
    log('🚀 Current Mode: PRODUCTION', 'green');
    log('\nYour backend will use:', 'cyan');
    log('  • Real Supabase database', 'green');
    log('  • Persistent data storage', 'green');
    log('  • Real user registration', 'green');

    log('\n⚠️  Important:', 'yellow');
    log('  Make sure you have run the database schema!', 'yellow');
    log('  Run: node setup-database.js to verify\n', 'blue');
}

log('─'.repeat(60) + '\n', 'cyan');

// Test users info
if (isDevelopmentMode) {
    log('👥 Available Test Users (Development Mode):\n', 'cyan');
    const testUsers = [
        { username: 'student1', password: 'Test@123', role: 'student' },
        { username: 'teacher1', password: 'Test@123', role: 'teacher' },
        { username: 'hod1', password: 'Test@123', role: 'hod' },
        { username: 'principal1', password: 'Test@123', role: 'principal' },
    ];

    testUsers.forEach(user => {
        log(`  • ${user.username.padEnd(12)} | Password: ${user.password} | Role: ${user.role}`, 'blue');
    });

    log('\n  Note: These users reset on every server restart\n', 'yellow');
}

log('─'.repeat(60) + '\n', 'cyan');

// Quick commands
log('📝 Quick Commands:\n', 'cyan');
log('  npm run dev              # Start the development server', 'blue');
log('  node check-status.js     # Run this status checker', 'blue');
log('  node setup-database.js   # Verify database setup', 'blue');
log('\n');
