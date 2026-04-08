import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jurvfwfkjborextmqsox.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1cnZmd2ZramJvcmV4dG1xc294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NjQwMjIsImV4cCI6MjA5MTI0MDAyMn0.bvkZZXmMvK_8VYgbzxFKNF5Vi6LVcVQAMdoC6Xw_cMw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
