import { createClient } from '@supabase/supabase-js'

// 환경변수가 없으면 placeholder로 대체 (Mock 모드에서는 실제로 호출되지 않음)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL  || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
