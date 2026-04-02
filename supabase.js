/* ---------- SUPABASE CONNECTION ---------- */

const SUPABASE_URL = "https://nesjyignqnttnjthnmps.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lc2p5aWducW50dG5qdGhubXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjI2NTIsImV4cCI6MjA5MDY5ODY1Mn0.o7HRWVO96nnrnc_9zgLgGG55en2IptKPWYtGn_803pY";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);