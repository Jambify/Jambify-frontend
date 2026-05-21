import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../../Store/UseUserStore";
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  AlertCircle,
  Key,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import ThemeToggle from "../../components/ui/ThemeToggle";

type Step = "form" | "otp";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const { setEmail: storeEmail, setName, syncProfile } = useUserStore();

  // Cooldown countdown
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // ── Step 1: Send OTP ──────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step A: Check if this email already has a confirmed account
      const { data: statusData, error: statusErr } = await supabase.rpc(
        "check_email_status",
        { p_email: email.trim().toLowerCase() },
      );

      if (statusErr) throw statusErr;

      if (statusData?.confirmed === true) {
        setError(
          "An account with this email already exists. Please sign in instead.",
        );
        setLoading(false);
        return;
      }

      // Step B: If email exists but is unconfirmed (ghost record),
      // clean it up so Supabase will send a fresh OTP
      if (statusData?.exists === true && statusData?.confirmed === false) {
        const { data: cleanupData } = await supabase.rpc(
          "cleanup_unverified_user",
          { p_email: email.trim().toLowerCase() },
        );

        // If cleanup returned 'pending', the OTP may still be valid —
        // jump straight to the OTP step so they can try entering it
        if (cleanupData?.status === "pending") {
          storeEmail(email);
          setName(fullName);
          setStep("otp");
          setCooldown(30);
          setLoading(false);
          return;
        }
        // If 'deleted', fall through and send a fresh OTP below
      }

      // Step C: Send the OTP
      storeEmail(email);
      setName(fullName);

      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          data: { full_name: fullName },
        },
      });

      if (otpErr) {
        if (otpErr.status === 429) {
          setCooldown(60);
          throw new Error("Too many requests. Please wait 60 seconds.");
        }
        throw otpErr;
      }

      setStep("otp");
      setCooldown(30);
    } catch (err) {
      setError(
        (err as Error).message || "Failed to send code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: "email",
      });

      if (verifyErr) {
        if (verifyErr.message.toLowerCase().includes("expired")) {
          setError('Code expired. Click "Resend" to get a new one.');
        } else if (verifyErr.message.toLowerCase().includes("invalid")) {
          setError("Invalid code. Please check and try again.");
        } else {
          setError(verifyErr.message);
        }
        return;
      }

      if (data?.session) {
        useUserStore.setState({
          isAuthenticated: true,
          id: data.session.user.id,
          email: data.session.user.email || email,
          name: fullName,
        });

        await syncProfile();

        const state = useUserStore.getState();
        navigate(state.onboardingComplete ? "/" : "/onboarding", {
          replace: true,
        });
      }
    } catch (err) {
      setError(
        (err as Error).message || "Verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Resend ────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      // Clean up ghost record first so resend always works
      await supabase.rpc("cleanup_unverified_user", {
        p_email: email.trim().toLowerCase(),
      });

      const { error: resendErr } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true, data: { full_name: fullName } },
      });
      if (resendErr) throw resendErr;
      setCooldown(30);
    } catch (err) {
      setError((err as Error).message || "Failed to resend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Screen ────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="min-h-screen bg-bgMain flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-125 h-125 bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-bgCard border border-borderMuted rounded-brand-2xl p-8 w-full max-w-md relative z-10 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-brand rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/40">
              <Key className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">
              Check your Email
            </h1>
            <p className="text-textDim text-sm">
              6-digit code sent to{" "}
              <span className="text-brand-light font-medium">{email}</span>
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden"
              >
                <div className="p-4 bg-danger/10 border border-danger/20 rounded-brand-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-textMuted mb-2 px-1">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setError("");
                  setOtp(e.target.value.replace(/\D/g, ""));
                }}
                placeholder="000000"
                style={{ fontSize: "16px" }}
                className="w-full text-center text-2xl font-mono tracking-[0.5em] py-4 bg-bgDeep border border-borderMuted rounded-brand-lg text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={otp.length !== 6 || loading}
              className="w-full bg-brand hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-brand-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying…
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              onClick={handleResend}
              disabled={loading || cooldown > 0}
              className="text-sm text-textDim hover:text-brand-light transition-colors disabled:opacity-50"
            >
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Didn't receive it? Resend"}
            </button>
            <button
              onClick={() => {
                setStep("form");
                setOtp("");
                setError("");
              }}
              className="block w-full text-xs text-textMuted hover:text-textDim transition-colors"
            >
              ← Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Signup Form ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-bgMain flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-125 h-125 bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-bgCard border border-borderMuted rounded-brand-2xl p-8 w-full max-w-md relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="relative mb-8">
            {/* Theme Toggle - Top Right */}
            <div className="absolute right-0 top-0">
              <ThemeToggle />
            </div>

            {/* Centered Logo */}
            <div className="flex justify-center">
              <div className="w-14 h-14 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/40">
                <span className="text-white text-2xl font-black">J</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-display font-bold text-brand mb-2 tracking-tight">
            Create Account
          </h1>
          <p className="text-textDim text-sm">
            No password needed — we email you a 6-digit code.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="err"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="p-4 bg-danger/10 border border-danger/20 rounded-brand-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-300">{error}</p>
                  {error.includes("already exists") && (
                    <Link
                      to="/signin"
                      className="text-xs text-brand-light hover:underline mt-1 block"
                    >
                      Sign in instead →
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-textMuted mb-2 px-1">
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-textDim group-focus-within:text-brand-light transition-colors" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ fontSize: "16px" }}
                className="w-full pl-12 pr-4 py-3.5 bg-bgDeep border border-borderMuted rounded-brand-lg text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all placeholder:text-textDim/50"
                placeholder="e.g. Adeola Okafor"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-textMuted mb-2 px-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-textDim group-focus-within:text-brand-light transition-colors" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ fontSize: "16px" }}
                className="w-full pl-12 pr-4 py-3.5 bg-bgDeep border border-borderMuted rounded-brand-lg text-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all placeholder:text-textDim/50"
                placeholder="e.g. adeola@example.com"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!email || !fullName || loading || cooldown > 0}
            className="w-full bg-brand hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-brand-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Sending…
              </>
            ) : cooldown > 0 ? (
              `Wait ${cooldown}s`
            ) : (
              <>
                Send Code <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-5">
          <p className="text-sm text-textDim">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-brand-light hover:underline font-semibold"
            >
              Sign In
            </Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-textMuted uppercase tracking-widest pt-4 border-t border-borderMuted/50">
            <ShieldCheck size={14} className="text-green-500" />
            Secure · No spam · 6-digit code
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
