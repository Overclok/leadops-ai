import { createClient } from '@supabase/supabase-js';

// Requires Node.js 20.6+ for --env-file support
// Usage: node --env-file=.env.local scripts/healthcheck.mjs

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
    console.error('   Please run with: node --env-file=.env.local scripts/healthcheck.mjs');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkHealth() {
    console.log(`Connecting to Supabase at ${SUPABASE_URL}...`);

    try {
        // Attempt to query the 'tenants' table which is created by 001_init.sql
        // We just want to check if the table exists and we can access it using service role key.
        const { count, error } = await supabase
            .from('tenants')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Supabase Healthcheck Failed:', error.message);
            if (error.code === '42P01') { // undefined_table
                console.error('   Hint: The table "tenants" does not exist. Did you apply migrations?');
                console.error('   Check infra/supabase/migrations/001_init.sql');
            }
            process.exit(1);
        }

        console.log(`✅ Supabase Healthcheck Passed. Connection successful. Table 'tenants' exists.`);
        console.log(`   Tenant count: ${count}`);
        process.exit(0);

    } catch (err) {
        console.error('❌ Supabase Healthcheck Failed with unexpected error:', err);
        process.exit(1);
    }
}

checkHealth();
