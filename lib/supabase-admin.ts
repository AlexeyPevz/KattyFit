import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

// Create client with safe fallbacks for build-time environments without env.
// On v0 runtime, real env values will be present.
export const supabaseAdmin = createClient(env.supabaseUrl || 'http://localhost', env.supabaseServiceRoleKey || 'service-role-key', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

