/**
 * Database Setup Script
 * This script initializes your Supabase database with the complete schema
 * Run this ONCE after setting up your Supabase credentials
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Colors for console output
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

async function setupDatabase() {
    try {
        log('\n🚀 Starting Database Setup...', 'bright');
        log('━'.repeat(60), 'cyan');

        // Validate environment variables
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            log('\n❌ Error: Missing Supabase credentials', 'red');
            log('\nPlease set the following in your .env file:', 'yellow');
            log('  - SUPABASE_URL', 'yellow');
            log('  - SUPABASE_SERVICE_ROLE_KEY', 'yellow');
            log('\nGet these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api\n', 'cyan');
            process.exit(1);
        }

        // Check if service key looks valid (should start with eyJ)
        if (!supabaseServiceKey.startsWith('eyJ')) {
            log('\n⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY does not look like a valid JWT token', 'yellow');
            log('It should start with "eyJ..." not "sb_publishable_..."', 'yellow');
            log('\nPlease get the correct service_role key from:', 'cyan');
            log('https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api\n', 'cyan');
            process.exit(1);
        }

        log('\n✓ Environment variables validated', 'green');

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        log('✓ Supabase client created', 'green');

        // Test connection
        log('\n📡 Testing database connection...', 'cyan');
        const { data: testData, error: testError } = await supabase
            .from('roles')
            .select('count')
            .limit(1);

        if (testError && testError.message.includes('does not exist')) {
            log('✓ Database is empty (as expected for first setup)', 'green');
        } else if (testError) {
            log(`\n❌ Database connection failed: ${testError.message}`, 'red');
            process.exit(1);
        } else {
            log('✓ Database connection successful', 'green');
            log('\n⚠️  Warning: Database already has tables', 'yellow');
            log('This script will create tables if they don\'t exist (safe to run)', 'yellow');
        }

        // Read the schema file
        log('\n📄 Reading schema file...', 'cyan');
        const schemaPath = path.join(__dirname, 'scripts', 'complete-schema.sql');

        if (!fs.existsSync(schemaPath)) {
            log(`\n❌ Schema file not found: ${schemaPath}`, 'red');
            process.exit(1);
        }

        const schema = fs.readFileSync(schemaPath, 'utf8');
        log('✓ Schema file loaded', 'green');

        // Execute the schema
        log('\n⚙️  Executing database schema...', 'cyan');
        log('This may take a few moments...', 'yellow');

        // Note: Supabase JS client doesn't support raw SQL execution
        // We need to guide the user to run it manually
        log('\n━'.repeat(60), 'cyan');
        log('⚠️  IMPORTANT: Manual Step Required', 'yellow');
        log('━'.repeat(60), 'cyan');

        log('\nThe Supabase JavaScript client cannot execute raw SQL.', 'yellow');
        log('Please follow these steps to set up your database:\n', 'yellow');

        log('1. Go to your Supabase SQL Editor:', 'cyan');
        log('   https://supabase.com/dashboard/project/novwicpageiuftzpenyw/sql/new\n', 'blue');

        log('2. Copy the contents of this file:', 'cyan');
        log(`   ${schemaPath}\n`, 'blue');

        log('3. Paste it into the SQL Editor and click "Run"\n', 'cyan');

        log('4. After running the SQL, come back and run this script again to verify\n', 'cyan');

        log('━'.repeat(60), 'cyan');

        // Offer to open the file for easy copying
        log('\n📋 Schema file location:', 'cyan');
        log(`   ${schemaPath}`, 'blue');

        log('\n💡 Tip: You can also run individual migration scripts from the scripts/ folder\n', 'yellow');

        // Verify if tables exist
        log('\n🔍 Checking current database state...', 'cyan');

        const tablesToCheck = ['roles', 'user', 'course', 'quiz', 'score'];
        const existingTables = [];

        for (const table of tablesToCheck) {
            const { data, error } = await supabase
                .from(table)
                .select('count')
                .limit(1);

            if (!error) {
                existingTables.push(table);
            }
        }

        if (existingTables.length === 0) {
            log('❌ No tables found - Database needs to be initialized', 'red');
            log('\nPlease run the schema SQL in Supabase SQL Editor (see instructions above)\n', 'yellow');
        } else if (existingTables.length === tablesToCheck.length) {
            log('✅ All required tables exist!', 'green');
            log('\nYour database is ready to use. You can now start the server with:', 'green');
            log('   npm run dev\n', 'blue');
        } else {
            log(`⚠️  Partial setup detected (${existingTables.length}/${tablesToCheck.length} tables found)`, 'yellow');
            log('Existing tables:', 'cyan');
            existingTables.forEach(table => log(`   ✓ ${table}`, 'green'));
            log('\nPlease complete the setup by running the schema SQL\n', 'yellow');
        }

    } catch (error) {
        log(`\n❌ Setup failed: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Run the setup
setupDatabase();
