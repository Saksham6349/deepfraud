import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise use the provided credentials
// Project ID: dvidjxbriwckcpiaxpft
const supabaseUrl = process.env.SUPABASE_URL || 'https://dvidjxbriwckcpiaxpft.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2aWRqeGJyaXdja2NwaWF4cGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTc5NjMsImV4cCI6MjA4NDIzMzk2M30.IHXXnFRlTE3GqiEY6Qwj6a908nydG-WdjSZ3N8mf9F4';

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase connection initialized.");