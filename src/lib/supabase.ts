import { createClient } from "@supabase/supabase-js";
import { useUserStore } from "../Store/useUserStore";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

supabase.auth.onAuthStateChange((event, session) => {
  console.log("🔵 Auth state changed:", event, session?.user?.id);
  const { syncProfile } = useUserStore.getState();

  if (event === "SIGNED_IN" && session) {
    useUserStore.setState({
      isAuthenticated: true,
      id: session.user.id,
      email: session.user.email || "",
    });
    syncProfile();
  } else if (event === "SIGNED_OUT") {
    useUserStore.setState({
      isAuthenticated: false,
      id: null,
      onboardingComplete: false,
    });
  }
});
