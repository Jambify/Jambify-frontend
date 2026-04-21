import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../../Store/UseUserStore";
import { Mail, ArrowRight, UserCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setEmailStore = useUserStore((s) => s.setEmail);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // Simulate checking if user exists and fetching profile
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      if (email) {
        setEmailStore(email);
        // Navigate to dashboard
        navigate("/");
      } else {
        setError("Please enter your email address");
      }
    } catch (err) {
      setError("Unable to sync your account. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bgMain flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute w-125 h-125 bg-brand/10 blur-[120px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          <div className="w-20 h-20 bg-brand/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand/30">
             <UserCheck className="w-10 h-10 text-brand-light" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Welcome Back!</h2>
          <p className="text-textDim mb-8">Fetching your study progress and scores...</p>
          
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

  return (
    <div className="min-h-screen bg-bgMain flex items-center justify-center p-4 relative overflow-hidden text-textMain pb-[env(safe-area-inset-bottom)]">
      {/* Background Decor */}
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
          <p className="text-textDim text-sm">Pick up right where you left off.</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-brand-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-textMuted mb-2 px-1">
              Registered Email
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
            Sign In
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