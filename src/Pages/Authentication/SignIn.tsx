// components/auth/SignIn.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../../Store/UseUserStore";
import { Mail, ArrowRight, UserCheck, AlertCircle, Key } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const navigate = useNavigate();
  const setEmailStore = useUserStore((s) => s.setEmail);
  const { syncProfile } = useUserStore(); // Removed isAuthenticated since it wasn't used

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await syncProfile();
        navigate("/");
      }
    };
    checkSession();
  }, [navigate, syncProfile]);

  // Check if user exists before sending OTP
  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      // Check profiles table for existing user
      const { data: existingProfile } = await supabase // Removed profileError since it wasn't used
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      if (existingProfile) {
        return true;
      }
      
      // Alternative: Try to get session info
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });
      
      // If we get a rate limit error, user likely exists
      if (signInError && signInError.status === 429) {
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Error checking user:", err);
      return false;
    }
  };

  // Step 1: Send OTP to email (with existence check)
  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      setEmailStore(email);

      // Check if user exists before sending OTP
      const userExists = await checkUserExists(email);
      
      if (!userExists) {
        setError("No account found with this email. Would you like to create one?");
        setIsLoading(false);
        return;
      }

      // Send OTP to existing user
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create new user for sign in
        },
      });

      if (signInError) {
        if (signInError.message.includes("Email not confirmed")) {
          setError("Please verify your email first. Check your inbox for the verification link.");
        } else {
          throw signInError;
        }
        return;
      }

      setStep("otp");
    } catch (err) {
      console.error("OTP send error:", err);
      setError((err as Error).message || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // components/auth/SignIn.tsx - Update the verifyOTP function

// Step 2: Verify OTP
const verifyOTP = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'email',
    });

    if (verifyError) {
      if (verifyError.message.includes("Invalid token")) {
        setError("Invalid verification code. Please check and try again.");
      } else if (verifyError.message.includes("expired")) {
        setError("Code has expired. Please request a new code.");
      } else {
        setError(verifyError.message);
      }
      return;
    }

    if (data?.session) {
      // IMPORTANT: Sync the profile with Zustand store
      await syncProfile();
      
      // Get the updated onboarding status
      const { onboardingComplete: isOnboardingComplete } = useUserStore.getState();
      
      // Navigate based on onboarding status
      if (isOnboardingComplete) {
        navigate("/");
      } else {
        navigate("/onboarding");
      }
    }
  } catch (err) {
    console.error("OTP verify error:", err);
    setError("Invalid or expired code. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  // Resend OTP
  const resendOTP = async () => {
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;
      setError("");
    } catch (err) {
      console.error("Resend error:", err);
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading && step === "form") {
    return (
      <div className="min-h-screen bg-bgMain flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="absolute w-125 h-125 bg-brand/10 blur-[120px] rounded-full" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          <div className="w-20 h-20 bg-brand/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand/30">
             <UserCheck className="w-10 h-10 text-brand-light" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Checking Account</h2>
          <p className="text-textDim mb-8">Verifying email address...</p>
          
          <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
            <motion.div 
              className="h-full bg-brand"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // OTP Verification Form
  if (step === "otp") {
    return (
      <div className="min-h-screen bg-bgMain flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-125 h-125 bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-bgCard border border-borderMuted rounded-brand-2xl p-8 w-full max-w-md relative z-10 shadow-2xl"
        >
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-brand rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/40">
              <Key className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Verify Your Email</h1>
            <p className="text-textDim text-sm">Enter the 6-digit code sent to</p>
            <p className="text-brand-light font-medium mt-1">{email}</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-brand-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={verifyOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-textMuted mb-2 px-1">
                Verification Code
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                maxLength={6}
                className="w-full px-5 py-4 bg-bgDeep border border-borderMuted rounded-brand-lg text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!otpCode || otpCode.length < 6}
              className="w-full bg-brand hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-brand-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-[0.98]"
            >
              {isLoading ? "Verifying..." : "Sign In"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={resendOTP}
              disabled={isLoading}
              className="text-textDim hover:text-brand-light text-sm transition-colors"
            >
              Didn't receive code? Resend
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setStep("form")}
              className="text-textMuted hover:text-textDim text-xs transition-colors"
            >
              ← Back to sign in
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Initial Sign In Form
  return (
    <div className="min-h-screen bg-bgMain flex items-center justify-center p-4 relative overflow-hidden text-textMain pb-[env(safe-area-inset-bottom)]">
      <div className="absolute top-0 right-1/4 w-125 h-125 bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-bgCard border border-borderMuted rounded-brand-2xl p-8 w-full max-w-md relative z-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-brand rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/40">
            <span className="text-white text-2xl font-black">J</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Sign In</h1>
          <p className="text-textDim text-sm">We'll send a 6-digit code to your email</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-brand-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{error}</p>
                {error.includes("No account found") && (
                  <Link to="/signup" className="text-sm text-brand-light hover:underline mt-1 inline-block">
                    Create an account →
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={sendOTP} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-textMuted mb-2 px-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-textDim group-focus-within:text-brand-light transition-colors" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-bgDeep border border-borderMuted rounded-brand-lg text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all placeholder:text-textDim/50"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!email}
            className="w-full bg-brand hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-brand-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-[0.98]"
          >
            Send Verification Code
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 text-center space-y-6">
          <p className="text-sm text-textDim">
            New to JAMBify?{" "}
            <Link 
              to="/signup" 
              className="text-brand-light hover:underline font-semibold"
            >
              Create Account
            </Link>
          </p>

          <div className="flex items-center justify-center gap-4 text-[10px] text-textMuted uppercase tracking-widest pt-6 border-t border-borderMuted/50">
            <span className="hover:text-textDim cursor-pointer">Terms</span>
            <span className="hover:text-textDim cursor-pointer">Privacy</span>
            <span className="hover:text-textDim cursor-pointer">Help Center</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;