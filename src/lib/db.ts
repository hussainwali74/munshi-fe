
import { createClient } from '@supabase/supabase-js'

/**
 * Returns a Supabase client configured with the service role key.
 * This function is called at runtime (inside server actions) so that
 * environment variables are available when the Worker executes.
 */
export function getDb() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing')
    }
    if (!supabaseServiceKey) {
        // In local dev you may have the service key in .env.local
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing')
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}
