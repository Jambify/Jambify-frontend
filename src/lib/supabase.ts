import { createClient, SupabaseClient, PostgrestError } from "@supabase/supabase-js";

// 🔧 Helper: Exponential Backoff with Jitter
function exponentialBackoff(
  fn: () => Promise<any>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 30000
): Promise<any> {
  return fn().catch(async (error) => {
    if (maxRetries <= 0) throw error;
    
    // Don't retry auth errors (401/403)
    if (
      (error as PostgrestError)?.code === "PGRST301" || // RLS denied
      (error as any)?.status === 401 ||
      (error as any)?.status === 403
    ) {
      throw error;
    }
    
    // Calculate delay with jitter
    const delay = Math.min(
      baseDelay * Math.pow(2, 3 - maxRetries) + Math.random() * 500,
      maxDelay
    );
    
    console.log(`🔄 Retrying in ${Math.round(delay)}ms... (${maxRetries - 1} retries left)`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return exponentialBackoff(fn, maxRetries - 1, baseDelay, maxDelay);
  });
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create our wrapped Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 🚀 Wrapped Postgrest query builder with retry and error handling
export async function supabaseQuery<T = any>(
  queryBuilder: (client: SupabaseClient) => any
): Promise<{ data: T | null; error: PostgrestError | null }> {
  try {
    const result = await exponentialBackoff(async () => {
      const { data, error } = await queryBuilder(supabase);
      if (error) throw error;
      return { data, error: null };
    });
    return result as { data: T | null; error: PostgrestError | null };
  } catch (error) {
    console.error("❌ Supabase query failed:", error);
    return { data: null, error: error as PostgrestError };
  }
}

