
import { createClient } from '@supabase/supabase-js'

// Note: This client should ONLY be used on the server-side.
// We use the SERVICE_ROLE_KEY to bypass RLS, as we are handling auth manually.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const db = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})
