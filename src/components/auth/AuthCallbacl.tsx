// components/auth/AuthCallback.tsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useUserStore } from "../../Store/useUserStore";
import { motion } from "framer-motion";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { syncProfile } = useUserStore(); // Removed setEmail since it's not used

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the session after magic link click
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth callback error:", error);
        navigate("/signin");
        return;
      }

      if (session) {
        // Wait for profile to sync
        await syncProfile();
        
        // Check if onboarding is complete
        const { onboardingComplete } = useUserStore.getState();
        
        if (onboardingComplete) {
          navigate("/");
        } else {
          navigate("/onboarding");
        }
      } else {
        navigate("/signin");
      }
    };

    handleAuthCallback();
  }, [navigate, syncProfile]);

  return (
    <div className="min-h-screen bg-bgMain flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl text-white">Verifying your link...</h2>
        <p className="text-textDim mt-2">Please wait while we log you in.</p>
      </motion.div>
    </div>
  );
};

export default AuthCallback;
