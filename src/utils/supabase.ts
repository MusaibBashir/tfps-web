import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vgowgvadmwtjcuacgolz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnb3dndmFkbXd0amN1YWNnb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTU3NDcsImV4cCI6MjA2NDE5MTc0N30.fxZg1uyASGZFZzIUWabg6ITAfOiud8ba7dldl1lxzAE';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);