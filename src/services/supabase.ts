import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zqadlxzefiohdptalikp.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYWRseHplZmlvaGRwdGFsaWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDMzNTksImV4cCI6MjEwNTQxOTM1OX0.CuTCnTSJL00uYO_ly0caZW9GNLKNVnwYdRuXlGBYyxw";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYWRseHplZmlvaGRwdGFsaWtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTg0MzM1OSwiZXhwIjoyMTA1NDE5MzU5fQ.mi1iAYrjzpjDC7RRn4b2-HXLqEc-4EdJi4oistjDZXs";

/**
 * Public Supabase client for browser-side requests and public data queries.
 * Respects RLS policies based on anon or authenticated user role.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Admin Supabase client with elevated service role privileges.
 * Strictly used in server actions, API route handlers, and background services.
 * Bypasses RLS to guarantee atomic appointment creation, staff lookups, and audit logging.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
