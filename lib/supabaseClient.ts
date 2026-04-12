import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://lhfnaatckhqtkckvcbuq.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZm5hYXRja2hxdGtja3ZjYnVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzE0OTcsImV4cCI6MjA5MTUwNzQ5N30.6dXFnx_oy58GRj6Pba-XbtvQWmcG_tTilv7TzZaazuo"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)