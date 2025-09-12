import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

// Create client with safe fallbacks for build-time environments without env.
// On v0 runtime, real env values will be present.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key', 
  {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
