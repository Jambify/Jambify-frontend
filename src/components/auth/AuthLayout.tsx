import React, { type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Trophy,
  Zap,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { cn } from "../../lib/utils/utils";

type AuthVariant = "signin" | "signup" | "otp";

interface AuthLayoutProps {
  children: ReactNode;
  variant?: AuthVariant;
  footer?: ReactNode;
}

const PANEL_CONTENT: Record<
  AuthVariant,
  { headline: string; subheadline: string }
> = {
  signin: {
    headline: "Welcome back",
    subheadline:
      "Pick up where you left off. Your progress, streaks, and study plan are waiting.",
  },
  signup: {
    headline: "Ace your JAMB exam",
    subheadline:
      "Smart practice, full mock exams, and AI mentorship — built for Nigerian students aiming for their target score.",
  },
  otp: {
    headline: "Almost there",
    subheadline:
      "We've sent a 6-digit code to your email. Enter it to finish signing in.",
  },
};

const FEATURES = [
  {
    icon: Zap,
    label: "Quick quizzes",
    desc: "10-question bursts on any subject",
  },
  {
    icon: Trophy,
    label: "Full mock exams",
    desc: "180 questions · real JAMB scoring",
  },
  {
    icon: MessageCircle,
    label: "AI mentor",
    desc: "Get help when you're stuck",
  },
  {
    icon: Target,
    label: "Track progress",
    desc: "Daily goals and performance insights",
  },
];

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  variant = "signin",
  footer,
}) => {
  const { headline, subheadline } = PANEL_CONTENT[variant];

  return (
    <div
      className="bg-bgMain text-textMain relative flex min-h-screen overflow-hidden transition-colors duration-200 ease-in-out"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* ── Left brand panel (desktop only) — Unique Un-equal Split ── */}
      <div className="relative hidden overflow-hidden border-r border-borderMuted bg-bgSurface transition-all duration-200 ease-in-out lg:flex lg:w-[40%] xl:w-[35%]">
        
        {/* Subtle background context grids/glows changing cleanly per theme */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,var(--color-brand-dim),transparent_60%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.25] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-textMuted) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-12">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="bg-brand flex h-11 w-11 items-center justify-center rounded-xl font-black text-white shadow-lg shadow-brand/20">
              J
            </div>
            <span className="font-display text-textMain text-2xl font-bold tracking-tight">
              JAMB<span className="text-brand font-black">IFY</span>
            </span>
          </motion.div>

          {/* Core Typography Context */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="my-auto max-w-lg py-8"
          >
            <h2 className="font-display text-textMain mb-4 text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
              {headline}
            </h2>
            <p className="text-textMuted text-sm leading-relaxed xl:text-base">
              {subheadline}
            </p>
          </motion.div>

          {/* Features Stack */}
          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid gap-3"
          >
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <li
                key={label}
                className="border-borderMuted bg-bgCard/50 flex items-start gap-3 rounded-xl border p-3 backdrop-blur-sm shadow-sm"
              >
                <div className="bg-brand/10 text-brand flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-textMain text-xs font-semibold">{label}</p>
                  <p className="text-textDim text-[11px]">{desc}</p>
                </div>
              </li>
            ))}
          </motion.ul>

          {/* Bottom Security Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-textDim mt-8 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase"
          >
            <ShieldCheck size={14} className="text-success" />
            Secure · No password · OTP only
          </motion.div>
        </div>
      </div>

      {/* ── Right form panel (Flexible remainder space) ── */}
      <div className="auth-form-panel bg-bgMain border-borderMuted relative flex min-h-screen flex-1 flex-col transition-colors duration-200 ease-in-out">
        {/* Universal Ambient Glows that track theme tokens */}
        <div className="bg-brand/10 pointer-events-none absolute top-0 right-1/4 h-125 w-125 rounded-full blur-[120px] opacity-40 dark:opacity-60" />
        <div className="bg-brand/5 pointer-events-none absolute bottom-0 left-1/4 h-125 w-125 rounded-full blur-[120px] opacity-40 dark:opacity-60" />

        <div className="absolute top-4 right-4 z-20 lg:top-8 lg:right-8">
          <ThemeToggle />
        </div>

        <div
          className={cn(
            "relative z-10 flex flex-1 flex-col justify-center px-4 py-10 sm:px-6",
            "lg:px-16 lg:py-12 xl:px-24",
          )}
        >
          <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-[440px]">
            {children}
          </div>

          {footer && (
            <div className="mx-auto mt-6 w-full max-w-md lg:mx-0 lg:max-w-[440px]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;