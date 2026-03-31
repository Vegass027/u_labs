import { createClient } from '@supabase/supabase-js'
import { config } from '../config'

// Service role — только на бэкенде, никогда на фронте
// RLS bypass — бэкенд сам отвечает за авторизацию через middleware
export const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Алиас для явности в коде — тот же клиент с service role
export const supabaseAdmin = supabase
