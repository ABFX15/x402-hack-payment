import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Supabase client
// Set these environment variables to enable Supabase:
// NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Only log warning once on server startup
let warnedOnce = false;
if (!supabaseUrl || !supabaseAnonKey) {
    if (!warnedOnce) {
        console.warn(
            "[Settlr] Supabase not configured. Using in-memory storage. " +
            "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for persistence."
        );
        warnedOnce = true;
    }
}

// Create client (with placeholder URL if not configured - won't be used anyway)
export const supabase: SupabaseClient = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-key"
);

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
    return Boolean(supabaseUrl && supabaseAnonKey);
}
