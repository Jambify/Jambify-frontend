// components/auth/SignUp.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../Store/UseUserStore";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Sparkles, ShieldCheck, User, Key, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const navigate = useNavigate();
  const { setEmail: setEmailStore, setName, syncProfile } = useUserStore();

  // Check if user already exists using Supabase Auth API
  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      // Method 1: Try to sign in with OTP - if user doesn't exist, Supabase returns an error
      // This is the most reliable way to check existence without creating a user
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create if doesn't exist
        },
      });
      
      // If error contains "Email not confirmed" or similar, user EXISTS
      if (error) {
        // These errors indicate the user exists
        if (error.message.includes("Email not confirmed") ||
            error.message.includes("User already registered") ||
            error.message.includes("already been registered")) {
          return true;
        }
        // "Invalid email" or "Email not found" means user doesn't exist
        return false;
      }
      
      // If no error and we got this far, user might exist
      return true;
    } catch (err) {
      console.error("Error checking user:", err);
      return false;
    }
  };

  // Alternative: Check via admin API (more accurate but requires service role)
  const checkUserExistsViaAdmin = async (email: string): Promise<boolean> => {
    try {
      // This requires setting up a Supabase Edge Function or using service role
      // For now, we'll use the profiles table as backup
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      return !!existingProfile;
    } catch (err) {
      return false;
    }
  };

  // Step 1: Send OTP to email (with existence check)
  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Check both methods to be certain
      const [userExistsAuth, userExistsProfile] = await Promise.all([
        checkUserExists(email),
        checkUserExistsViaAdmin(email)
      ]);
      
      const userExists = userExistsAuth || userExistsProfile;
      
      if (userExists) {
        setError("An account with this email already exists. Please sign in instead.");
        setIsLoading(false);
        return;
      }

      // Store name for later
      setName(fullName);
      setEmailStore(email);

      // Send OTP - this will create a new user
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Create new user
          data: {
            full_name: fullName,
          },
        },
      });

      if (signInError) {
        if (signInError.message.includes("already registered") || 
            signInError.message.includes("User already registered")) {
          setError("An account with this email already exists. Please sign in.");
        } else {
          throw signInError;
        }
        return;
      }

      // Move to OTP verification step
      setStep("otp");
    } catch (err) {
      console.error("OTP send error:", err);
      setError((err as Error).message || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
        // Set authenticated state manually
        useUserStore.setState({ 
          isAuthenticated: true,
          id: data.session.user.id,
          email: data.session.user.email || email,
          name: fullName
        });
        
        // Sync the profile with Zustand store
        await syncProfile();
        
        // Wait a bit for the profile to be created by the trigger
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the updated onboarding status directly from store
        const state = useUserStore.getState();
        const isOnboardingComplete = state.onboardingComplete;
        
        console.log("🔵 Verification complete - onboarding status:", isOnboardingComplete);
        
        // Navigate based on onboarding status
        if (isOnboardingComplete) {
          navigate("/", { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
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
          shouldCreateUser: true,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setError("An account already exists. Please sign in instead.");
        } else {
          throw error;
        }
      } else {
        setError(""); // Clear any errors
      }
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
        <div className="absolute w-100 h-100 bg-brand/10 blur-[120px] rounded-full" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          <div className="w-20 h-20 bg-brand/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand/30">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-10 h-10 text-brand-light" />
            </motion.div>
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            Checking Account
          </h2>
          <p className="text-textDim mb-8">
            Verifying email availability...
          </p>
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
        <div className="absolute top-0 left-1/4 w-125 h-125 bg-brand/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-bgCard border border-borderMuted rounded-brand-2xl p-8 w-full max-w-md relative z-10 shadow-2xl"
        >
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-brand rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/40">
              <Key className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">
              Verify Your Email
            </h1>
            <p className="text-textDim text-sm">
              Enter the 6-digit code sent to
            </p>
            <p className="text-brand-light font-medium mt-1">{email}</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-brand-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={verifyOTP} className="space-y-5">
            <div>
              <label
                htmlFor="otp"
                className="block text-xs font-bold uppercase tracking-widest text-textMuted mb-2 px-1"
              >
                Verification Code
              </label>
              <input
                type="text"
                id="otp"
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
              disabled={!otpCode || otpCode.length < 6 || isLoading}
              className="w-full bg-brand hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-brand-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-[0.98]"
            >
              {isLoading ? "Verifying..." : "Create Account"}
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
              ← Back to sign up
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Initial Sign Up Form
  return (
    <div className="min-h-screen bg-bgMain flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-125 h-125 bg-brand/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-bgCard border border-borderMuted rounded-brand-2xl p-8 w-full max-w-md relative z-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-brand rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/40">
            <span className="text-white text-2xl font-black">J</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">
            Create Account
          </h1>
          <p className="text-textDim text-sm">
            Get a 6-digit code sent to your email - no password needed!
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-brand-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-400">{error}</p>
              {error.includes("already exists") && (
                <Link to="/signin" className="text-sm text-brand-light hover:underline mt-1 inline-block">
                  Sign in instead →
                </Link>
              )}
            </div>
          </motion.div>
        )}

        <form onSubmit={sendOTP} className="space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-bold uppercase tracking-widest text-textMuted mb-2 px-1"
            >
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-textDim group-focus-within:text-brand-light transition-colors" />
              </div>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-bgDeep border border-borderMuted rounded-brand-lg text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all placeholder:text-textDim/50"
                placeholder="e.g., Peter Ezinwa"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-widest text-textMuted mb-2 px-1"
            >
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
                placeholder="e.g., peter.ezinwa@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!email || !fullName || isLoading}
            className="w-full bg-brand hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-brand-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-[0.98]"
          >
            Send Verification Code
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 text-center space-y-6">
          <p className="text-sm text-textDim">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-brand-light hover:underline font-semibold"
            >
              Sign In
            </Link>
          </p>

          <div className="flex items-center justify-center gap-2 text-[10px] text-textMuted uppercase tracking-widest pt-6 border-t border-borderMuted/50">
            <ShieldCheck size={14} className="text-green-500" />
            6-digit code will be sent to your email
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;