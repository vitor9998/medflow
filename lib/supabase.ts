import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lhfnaatckhqtkckvcbuq.supabase.co'
const supabaseKey = 'sb_publishable_sYj9hsY-HuRtyU-DwEoTGA_DAUkc4qA'

export const supabase = createClient(supabaseUrl, supabaseKey)