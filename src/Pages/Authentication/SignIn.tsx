import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../../Store/UseUserStore";
import {
  Mail,
  ArrowRight,
  AlertCircle,
  Key,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import ThemeToggle from "../../components/ui/ThemeToggle";

type Step = "form" | "otp";

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const { setEmail: storeEmail, syncProfile } = useUserStore();

  // Redirect if session already exists
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        useUserStore.setState({
          isAuthenticated: true,
          id: session.user.id,
          email: session.user.email || "",
        });
        // FIX: force:true + use returned value
        const { onboardingComplete } = await syncProfile(true);
        navigate(onboardingComplete ? "/" : "/onboarding", { replace: true });
      }
    });
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // ── Send OTP (sign in — don't create user) ────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      storeEmail(email);

      // Check if this email is confirmed before sending OTP
      // This gives a much clearer error than Supabase's generic message
      const { data: status } = await supabase.rpc("check_email_status", {
        p_email: email.trim().toLowerCase(),
      });

      if (!status?.exists) {
        setError(
          "No account found with this email. Would you like to create one?",
        );
        setLoading(false);
        return;
      }

      if (!status?.confirmed) {
        setError(
          "Your email is not yet verified. Please sign up again to complete verification.",
        );
        setLoading(false);
        return;
      }

      // Email exists and is confirmed — send the OTP
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: false },
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

  // ── Verify OTP ────────────────────────────────────────
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
        // Set identity first
        useUserStore.setState({
          isAuthenticated: true,
          id: data.session.user.id,
          email: data.session.user.email || email,
        });

        // FIX 1: force:true bypasses the 5-second cache
        // FIX 2: use returned value — not getState() after set()
        const { onboardingComplete } = await syncProfile(true);

        console.log("✅ SignIn — onboardingComplete:", onboardingComplete);

        // Navigate based on fresh DB value — no stale state
        navigate(onboardingComplete ? "/" : "/onboarding", { replace: true });
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
      const { error: resendErr } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: false },
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
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-125 h-125 bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-125 h-125 bg-brand/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-bgCard border border-borderMuted rounded-brand-2xl p-8 w-full max-w-md relative z-10 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-brand rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/40">
              <Key className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-textMain mb-2 tracking-tight">
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
                  <p className="text-sm text-danger">{error}</p>
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
                className="w-full text-center text-2xl font-mono tracking-[0.5em] py-4 bg-bgSurface border border-borderMuted rounded-brand-lg text-textMain focus:ring-2 focus:ring-brand/40 focus:border-transparent outline-none transition-all placeholder:text-textDim/30"
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
                  Sign In <ArrowRight className="w-5 h-5" />
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

  // ── Sign In Form ──────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-bgMain flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-125 h-125 bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-125 h-125 bg-brand/5 blur-[120px] rounded-full pointer-events-none" />

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
            Sign In
          </h1>
          <p className="text-textDim text-sm">
            We'll send a 6-digit code to your email.
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
                  <p className="text-sm text-danger">{error}</p>
                  {error.includes("No account found") && (
                    <Link
                      to="/signup"
                      className="text-xs text-brand-light hover:underline mt-1 block"
                    >
                      Create an account →
                    </Link>
                  )}
                  {error.includes("not yet verified") && (
                    <Link
                      to="/signup"
                      className="text-xs text-brand-light hover:underline mt-1 block"
                    >
                      Complete sign up →
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendOtp} className="space-y-5">
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
                onChange={(e) => {
                  setError("");
                  setEmail(e.target.value);
                }}
                style={{ fontSize: "16px" }}
                className="w-full pl-12 pr-4 py-3.5 bg-bgSurface border border-borderMuted rounded-brand-lg text-textMain focus:ring-2 focus:ring-brand/40 focus:border-transparent outline-none transition-all placeholder:text-textDim/50"
                placeholder="Enter your email"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!email || loading || cooldown > 0}
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
            New to JAMBIFY?{" "}
            <Link
              to="/signup"
              className="text-brand-light hover:underline font-semibold"
            >
              Create Account
            </Link>
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-textMuted uppercase tracking-widest pt-4 border-t border-borderMuted/50">
            <ShieldCheck size={14} className="text-green-500" />
            Secure · No password · 6-digit code
          </div>
        </div>
      </motion.div>

      {/* Professional Guest CTA - Outside the main card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="lg:relative lg:bottom-auto lg:left-auto lg:translate-x-0 lg:mt-8 lg:z-10 fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-20"
      >
        <button
          onClick={() => navigate("/guest")}
          className="w-full bg-bgCard/40 backdrop-blur-xl border border-brand/20 hover:border-brand/50 rounded-4xl p-4 lg:p-5 flex items-center justify-between group transition-all shadow-2xl shadow-brand/5 hover:shadow-brand/10 active:scale-[0.98]"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
              🎯
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-brand leading-none mb-1">
                Just Exploring?
              </p>
              <p className="text-sm font-bold text-textMain">
                Take a free practice test
              </p>
            </div>
          </div>
          <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-brand group-hover:translate-x-1 transition-all">
            <ArrowRight size={18} />
          </div>
        </button>
      </motion.div>
    </div>
  );
};

export default SignIn;
