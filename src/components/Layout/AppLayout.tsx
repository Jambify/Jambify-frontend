import React, { type ReactNode, useState, useRef } from "react";
import { Link } from "react-router";
import { useUserStore } from "../../Store/useUserStore";
import { useExamCountdown } from "../../hooks/useExamCountdown";
import { useProStatus } from "../../hooks/useProStatus";
import Sidebar from "./Sidebar";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import schooldraLogo from "../../assets/schooldraLogo.webp";
import AnnouncementBanner from "../ui/AnnouncementBanner";
import {
  LayoutGrid,
  FileText,
  BookOpen,
  Activity,
  Clock,
  Users,
  Menu,
  type LucideIcon,
  Settings,
  WifiOff,
  Wifi,
  Trophy,
  Sparkles,
  Crown,
  Mail,
  Flame,
  Hourglass,
  Loader2,
  RefreshCw,
  X,
  ArrowRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils/utils";
import ThemeToggle from "../ui/ThemeToggle";

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
  hideSidebar?: boolean;
  className?: string;
  onRefresh?: () => Promise<void> | void;
}

const IconMap: Record<string, LucideIcon> = {
  grid: LayoutGrid,
  file: FileText,
  book: BookOpen,
  activity: Activity,
  clock: Clock,
  users: Users,
  settings: Settings,
};

const getInitials = (name: string) => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatPageTitle = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const NavItem = ({ label, active, badge, icon, path }: any) => {
  const IconComponent = IconMap[icon] || LayoutGrid;
  return (
    <Link
      to={path}
      className={`rounded-brand group mb-0.5 flex cursor-pointer items-center gap-3 p-2.5 text-[13.5px] transition-all ${
        active
          ? "bg-brand/15 text-brand-light font-semibold shadow-[0_8px_24px_rgba(0,102,255,0.12)]"
          : "text-textMuted hover:bg-bgCard hover:text-textMain"
      }`}
    >
      <IconComponent
        size={18}
        className={`opacity-70 group-hover:opacity-100 ${active ? "opacity-100" : ""}`}
      />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="bg-brand min-w-4.5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold text-white shadow-[0_8px_24px_rgba(0,102,255,0.15)]">
          {badge}
        </span>
      )}
    </Link>
  );
};

const PULL_THRESHOLD = 80;

/**
 * Walk up from `el` looking for the nearest scrollable ancestor (an element
 * with overflow-y: auto/scroll whose content is taller than its box).
 * Returns null if the only scrollable container is `<body>` / window.
 *
 * We need this because the naive `window.scrollY === 0` check is wrong
 * whenever the *actual* scrollable container under the touch point is an
 * inner element, e.g. the question/chat area in ReviewExam, the
 * subject-list sidebar in MockExam, the 5×5 question palette sidebar,
 * etc. In those cases window.scrollY stays 0 forever but the user is
 * mid-scroll inside that inner container — a downward swipe should be
 * "scroll up the inner content," not pull-to-refresh.
 */
const findScrollableParent = (el: HTMLElement | null): HTMLElement | null => {
  if (!el || el === document.body || el === document.documentElement)
    return null;
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  if (
    (overflowY === "auto" || overflowY === "scroll") &&
    el.scrollHeight > el.clientHeight + 1
  ) {
    return el;
  }
  return findScrollableParent(el.parentElement);
};

const innerScrollAtTop = (touchTarget: EventTarget | null): boolean => {
  const el = (touchTarget ?? null) as HTMLElement | null;
  const scrollable = findScrollableParent(el);
  return !scrollable || scrollable.scrollTop <= 0;
};

/**
 * Banner driven by `useProStatus` output. It replaces the old one-size-fits-all
 * "Pro Access Revoked" modal with context-aware copy + a CTA that matches the
 * actual status (renew vs. contact support vs. retry payment).
 */
interface ProStatusBannerProps {
  status: ReturnType<typeof useProStatus>;
  dismissed: boolean;
  onDismiss: () => void;
}
const ProStatusBanner: React.FC<ProStatusBannerProps> = ({
  status,
  dismissed,
  onDismiss,
}) => {
  if (!status.showAlert || dismissed) return null;

  const toneClasses = (() => {
    switch (status.status) {
      case "expiring_soon":
        return {
          wrap: "border-warn/30 bg-warn/10",
          iconBg: "bg-warn/15 text-warn border-warn/30",
        };
      case "revoked_early":
      case "inactive":
      case "payment_failed":
        return {
          wrap: "border-danger/30 bg-danger/10",
          iconBg: "bg-danger/15 text-danger border-danger/30",
        };
      case "expired_natural":
      case "expired_admin_grant":
      default:
        return {
          wrap: "border-brand/25 bg-brand/10",
          iconBg: "bg-brand/15 text-brand border-brand/30",
        };
    }
  })();

  const cta = status.primaryAction;
  const ctaHref =
    cta === "renew" || cta === "try_again"
      ? "/pro"
      : cta === "contact_support"
        ? "mailto:support@schooldra.com?subject=Pro%20Status%20Help"
        : null;

  return (
    <div
      className={cn(
        "relative mb-3 flex items-start gap-3 overflow-hidden rounded-2xl border px-4 py-3 shadow-sm sm:px-5",
        toneClasses.wrap,
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
          toneClasses.iconBg,
        )}
      >
        {status.status === "revoked_early" || status.status === "inactive" ? (
          <AlertTriangle className="h-4.5 w-4.5" />
        ) : status.status === "payment_failed" ? (
          <X className="h-4.5 w-4.5" />
        ) : (
          <Crown className="h-4.5 w-4.5" />
        )}
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-textMain text-sm leading-snug font-semibold">
          {status.shortMessage || "Pro Status"}
        </p>
        <p className="text-textMuted mt-0.5 text-xs leading-relaxed">
          {status.message}
        </p>
        {ctaHref && (
          <div className="mt-3">
            {ctaHref.startsWith("mailto:") ? (
              <a
                href={ctaHref}
                className="text-textMain inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold underline decoration-2 underline-offset-4 hover:opacity-80"
              >
                <Mail className="h-3.5 w-3.5" /> Contact support
              </a>
            ) : (
              <Link
                to={ctaHref}
                className="bg-brand hover:bg-brand-light inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-[0_10px_24px_rgba(124,60,255,0.22)] transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {cta === "try_again" ? "Try Pro again" : "Renew Pro"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss Pro status alert"
        className="text-textDim hover:text-textMain mt-0.5 -mr-1 shrink-0 rounded-lg p-1.5 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Lucide icon aliased for ProStatusBanner since AlertTriangle is imported via
// destructuring alongside the other icons below.
const AlertTriangle = ({ className }: { className?: string }) => {
  const Icon = React.useMemo(
    () =>
      (
        p: React.SVGProps<SVGSVGElement> & {
          size?: number | string;
        },
      ) => (
        <svg
          width={p.size ?? 16}
          height={p.size ?? 16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...p}
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    [],
  );
  return <Icon className={className} />;
};

const DISMISS_KEY_PREFIX = "schooldra_pro_alert_dismissed_";

const AppLayout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  isSidebarOpen = false,
  setIsSidebarOpen = () => {},
  hideSidebar = false,
  className,
  onRefresh,
}) => {
  const userId = useUserStore((state) => state.id);
  const name = useUserStore((state) => state.name);
  const targetScore = useUserStore((state) => state.targetScore);
  const streak = useUserStore((state) => state.streak);
  const isPro = useUserStore((state) => state.isPro);
  const { daysLeft } = useExamCountdown();
  const { isOnline, wasOffline } = useNetworkStatus();
  const proStatus = useProStatus();

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute dismiss state synchronously so the banner never flashes visible
  // before the effect can read localStorage and hide it.
  const [proBannerDismissed, setProBannerDismissed] = useState<boolean>(() => {
    if (!userId || !proStatus.proRowId) return false;
    const key = `${DISMISS_KEY_PREFIX}${userId}_${proStatus.proRowId}`;
    try { return localStorage.getItem(key) === "true"; } catch { return false; }
  });
  const touchStartRef = useRef(0);
  const touchStartXRef = useRef(0);
  const isDrawerOpenRef = useRef(false);

  const displayName = name || "Guest User";
  const initials = getInitials(displayName);
  const pageTitle = formatPageTitle(currentPage);

  const dismissKey =
    userId && proStatus.proRowId
      ? `${DISMISS_KEY_PREFIX}${userId}_${proStatus.proRowId}`
      : null;

  // Re-check localStorage only when the specific pro_users row changes
  // (proRowId changing = a new pro event, so we re-arm the banner).
  // Changing status alone (active→expiring) on the SAME row must NOT
  // flip proBannerDismissed back to false — the user already dismissed it.
  React.useEffect(() => {
    if (!proStatus.showAlert || !dismissKey) return;
    try {
      setProBannerDismissed(localStorage.getItem(dismissKey) === "true");
    } catch {
      setProBannerDismissed(false);
    }
  }, [proStatus.proRowId, dismissKey]); // ← proRowId only, not status

  const handleProBannerDismiss = () => {
    if (dismissKey) {
      localStorage.setItem(dismissKey, "true");
    }
    setProBannerDismissed(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDrawerOpenRef.current) {
      touchStartRef.current = 0;
      return;
    }
    const target = e.target;
    const windowAtTop = window.scrollY <= 0;
    // BOTH must be true: outer page is at top AND every inner scrollable
    // ancestor under the starting touch point is ALSO at its top.
    if (windowAtTop && innerScrollAtTop(target) && !isRefreshing) {
      touchStartRef.current = e.touches[0].clientY;
      touchStartXRef.current = e.touches[0].clientX;
    } else {
      touchStartRef.current = 0;
      touchStartXRef.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const distanceY = currentY - touchStartRef.current;
    const distanceX = Math.abs(currentX - touchStartXRef.current);

    // Recheck on every move: user might have started touch at top of an
    // inner container but since scrolled it via momentum/inertia, or they
    // were at the top and the page was still rubber-banding. If the
    // scrollable parent is no longer at the top, bail immediately.
    const stillAtTheTop = window.scrollY <= 0 && innerScrollAtTop(e.target);

    if (distanceY > 0 && distanceY > distanceX && stillAtTheTop) {
      const pull = Math.min(distanceY * 0.4, PULL_THRESHOLD + 20);
      setPullDistance(pull);
    } else {
      if (distanceX > distanceY) {
        setPullDistance(0);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!touchStartRef.current || isRefreshing) return;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);

      if (onRefresh) {
        await onRefresh();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        window.location.reload();
      }

      setIsRefreshing(false);
    }

    setPullDistance(0);
    touchStartRef.current = 0;
    touchStartXRef.current = 0;
  };

  const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  // Listen for drawer open/close (check if modal exists in DOM)
  React.useEffect(() => {
    const checkDrawerOpen = () => {
      // Check if there's a drawer/modal overlay with high z-index
      const drawer = document.querySelector('[style*="z-50"]');
      isDrawerOpenRef.current = !!drawer && drawer.className.includes("fixed");
    };

    const interval = setInterval(checkDrawerOpen, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="bg-bgMain text-textMain selection:bg-brand/30 min-h-screen font-sans"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* PULL TO REFRESH SPINNER
           Only visible once pull > 25px (raised from 10) to prevent
           accidental micro-gesture flashes on normal scroll-to-top. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-16 z-90 flex justify-center"
        animate={{
          y: isRefreshing ? 12 : pullDistance > 0 ? pullDistance : -50,
          opacity: pullDistance > 25 || isRefreshing ? 1 : 0,
        }}
        transition={
          isRefreshing
            ? { type: "spring", stiffness: 300, damping: 20 }
            : { duration: 0.15 }   // slightly longer fade so brief micro-pulls don't flash
        }
      >
        <div className="bg-bgSurface border-borderMuted/80 text-brand flex h-10 w-10 items-center justify-center rounded-full border shadow-xl">
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw
              className="h-5 w-5 transition-transform"
              style={{
                transform: `rotate(${pullProgress * 180}deg)`,
                opacity: Math.max(0.3, pullProgress),
              }}
            />
          )}
        </div>
      </motion.div>

      <div className="lg:pt-5 lg:pl-64">
        <AnnouncementBanner />
        <ProStatusBanner
          status={proStatus}
          dismissed={proBannerDismissed}
          onDismiss={handleProBannerDismiss}
        />
      </div>

      {/* Network Status Toast */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="pointer-events-none fixed inset-x-0 top-0 z-999 flex justify-center p-4"
          >
            <div className="network-banner-offline flex items-center gap-3 rounded-full border border-white/20 px-6 py-2.5 shadow-2xl">
              <WifiOff size={18} className="animate-pulse text-white" />
              <span className="text-sm font-bold tracking-tight text-white">
                You are offline. Some features may be limited.
              </span>
            </div>
          </motion.div>
        )}
        {wasOffline && isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="pointer-events-none fixed inset-x-0 top-0 z-999 flex justify-center p-4"
          >
            <div className="network-banner-online flex items-center gap-3 rounded-full border border-white/20 px-6 py-2.5 shadow-2xl">
              <Wifi size={18} className="text-white" />
              <span className="text-sm font-bold tracking-tight text-white">
                Back online! Syncing your progress...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE SIDEBAR (Drawer) */}
      {!hideSidebar && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* DESKTOP SIDEBAR */}
      {!hideSidebar && (
        <aside
          className="bg-bgSurface border-borderMuted fixed top-0 bottom-0 left-0 z-100 hidden w-60 flex-col border-r lg:flex"
          aria-label="Main navigation sidebar"
        >
          <div className="border-borderMuted flex items-center justify-between border-b p-6 pb-4">
            <a href="/dashboard" aria-label="Schooldra Home">
              <div className="flex cursor-pointer items-center gap-1">
                <img
                  src={schooldraLogo}
                  alt="Schooldra Logo"
                  className="h-8 w-8"
                  width={32}
                  height={32}
                  loading="eager"
                />
                <span className="text-brand-light text-lg font-black tracking-wider">
                  Schooldra
                </span>
              </div>
            </a>
            {isPro && (
              <div className="bg-brand/12 text-brand border-brand/20 rounded-full border px-2 py-0.5 text-[9px] font-black tracking-widest uppercase">
                Pro
              </div>
            )}
          </div>

          <nav
            className="flex-1 space-y-6 overflow-y-auto p-3"
            aria-label="Main navigation"
          >
            <section aria-labelledby="desktop-main-nav">
              <h2
                id="desktop-main-nav"
                className="text-textDim mb-2 px-2 text-[10px] font-medium tracking-widest uppercase"
              >
                Main
              </h2>
              <NavItem
                label="Dashboard"
                active={currentPage === "dashboard"}
                icon="grid"
                path="/dashboard"
              />
              <NavItem
                label="Practice Quiz"
                badge={3}
                icon="file"
                path="/quiz"
              />
              <NavItem label="Subjects" icon="book" path="/subjects" />
              <NavItem
                label="Performance"
                icon="activity"
                path="/performance"
              />
              <NavItem label="Settings" icon="settings" path="/settings" />
            </section>

            <section aria-labelledby="desktop-study-nav">
              <h2
                id="desktop-study-nav"
                className="text-textDim mb-2 px-2 text-[10px] font-medium tracking-widest uppercase"
              >
                Study
              </h2>
              <NavItem label="Mock Exams" icon="clock" path="/mock-exams" />
              <NavItem label="Study Groups" icon="users" path="/study-groups" />
              <NavItem
                label="Past Questions"
                icon="settings"
                path="/past-questions"
              />
            </section>

            {/* Pro Upgrade / Status Card */}
            <section className="px-2 pt-2">
              {!isPro ? (
                <Link
                  to="/pro"
                  className="from-brand/10 to-brand/5 border-brand/20 text-brand-light hover:border-brand/40 group flex flex-col gap-2 rounded-2xl border bg-linear-to-br p-3.5 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-brand h-4 w-4 transition-transform group-hover:rotate-12" />
                    <span className="text-[12px] font-black tracking-wider uppercase">
                      Schooldra Pro
                    </span>
                  </div>
                  <p className="text-textDim text-[10px] leading-tight">
                    Unlock AI Tutor, offline mode, and professional mock review.
                  </p>
                </Link>
              ) : (
                <div className="bg-success/5 border-success/10 text-success flex items-center gap-3 rounded-2xl border p-3.5">
                  <div className="bg-success/10 flex h-8 w-8 items-center justify-center rounded-xl">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-black tracking-wider uppercase">
                      Pro Member
                    </span>
                    <span className="text-success/70 text-[9px] font-medium italic">
                      Premium access active
                    </span>
                  </div>
                </div>
              )}
            </section>
          </nav>

          <div className="border-borderMuted border-t p-4">
            <Link
              to="/settings"
              className="hover:bg-bgCard rounded-brand flex cursor-pointer items-center gap-3 p-2 transition-colors"
            >
              <div className="bg-brand font-display relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm">
                {initials}
                {isPro && (
                  <div className="bg-brand border-bgSurface absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2">
                    <div className="h-1 w-1 rounded-full bg-white" />
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <div className="truncate text-sm font-medium">
                  {displayName}
                </div>
                <div className="text-textDim text-[11px]">
                  {isPro
                    ? "Pro Active"
                    : targetScore
                      ? `Target: ${targetScore}`
                      : `${streak} day streak`}
                </div>
              </div>
            </Link>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={cn("flex-1 pb-28 lg:pb-0", !hideSidebar && "lg:ml-60")}>
        {!hideSidebar && (
          <header
            role="banner"
            className="bg-bgMain/85 border-borderMuted safe-area-top fixed-ios sticky top-0 z-50 flex h-14 items-center justify-between gap-2 border-b px-3 backdrop-blur-md sm:px-4 lg:px-7"
          >
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hover:bg-bgCard touch-target no-double-tap shrink-0 rounded-md p-2 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>

              <h1 className="font-display truncate text-[15px] font-semibold sm:text-base">
                {pageTitle}
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3">
              <span className="text-textDim hidden text-xs md:inline">
                Hi, {displayName.split(" ")[0]}!
              </span>

              {/* Streak */}
              <div className="flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-[10px] font-medium text-orange-400 sm:gap-1.5 sm:px-3 sm:text-xs">
                <Flame size={13} className="shrink-0" />
                <span>{streak}</span>
                <span className="hidden sm:inline">
                  day{streak !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Countdown */}
              <div className="bg-brand-dim text-brand-light border-brand/20 flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium sm:gap-1.5 sm:px-3 sm:text-xs">
                <Hourglass size={13} className="shrink-0" />
                <span>{daysLeft}</span>
                <span className="hidden sm:inline">
                  day{daysLeft !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
            </div>
          </header>
        )}

        <div
          className={cn(
            "animate-in fade-in slide-in-from-bottom-2 duration-300",
            !hideSidebar ? "p-4 lg:p-7" : "p-0",
            className,
          )}
        >
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      {!hideSidebar && (
        <div className="bg-bgSurface/98 border-borderMuted/30 safe-area-bottom shadow-nav fixed right-0 bottom-0 left-0 z-100 border-t lg:hidden">
          <nav
            className="relative flex h-18 items-center justify-around px-1"
            aria-label="Mobile bottom navigation"
          >
            <Link
              to="/dashboard"
              className="touch-target no-double-tap flex h-full flex-1 flex-col items-center justify-center gap-1 transition-all active:scale-90"
              aria-label="Dashboard"
            >
              <div
                className={cn(
                  "rounded-xl p-2 transition-colors",
                  currentPage === "dashboard" ? "bg-brand/10" : "",
                )}
              >
                <LayoutGrid
                  size={24}
                  strokeWidth={currentPage === "dashboard" ? 2.5 : 2}
                  className={
                    currentPage === "dashboard"
                      ? "text-brand-light"
                      : "text-textDim"
                  }
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold tracking-tight transition-colors",
                  currentPage === "dashboard"
                    ? "text-brand-light"
                    : "text-textDim/70",
                )}
              >
                Home
              </span>
            </Link>

            <Link
              to="/subjects"
              className="touch-target no-double-tap flex h-full flex-1 flex-col items-center justify-center gap-1 transition-all active:scale-90"
              aria-label="Subjects"
            >
              <div
                className={cn(
                  "rounded-xl p-2 transition-colors",
                  currentPage === "subjects" ? "bg-brand/10" : "",
                )}
              >
                <BookOpen
                  size={24}
                  strokeWidth={currentPage === "subjects" ? 2.5 : 2}
                  className={
                    currentPage === "subjects"
                      ? "text-brand-light"
                      : "text-textDim"
                  }
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold tracking-tight transition-colors",
                  currentPage === "subjects"
                    ? "text-brand-light"
                    : "text-textDim/70",
                )}
              >
                Subjects
              </span>
            </Link>

            {/* Prominent Center Action */}
            <div className="relative flex h-full flex-1 justify-center">
              <Link
                to="/quiz"
                className="group absolute -top-6 flex flex-col items-center gap-1"
                aria-label="Quiz"
              >
                <div className="bg-brand border-bgCard dark:border-bgMain flex h-15 w-15 rotate-45 items-center justify-center rounded-2xl border-2 shadow-[0_12px_30px_rgba(0,102,255,0.4)] transition-all group-hover:scale-105 group-active:scale-95">
                  <FileText size={26} className="-rotate-45 text-white" />
                </div>
                <span className="text-brand-light text-[10px] font-black tracking-tighter uppercase">
                  Practice
                </span>
              </Link>
            </div>

            <Link
              to="/performance"
              className="touch-target no-double-tap flex h-full flex-1 flex-col items-center justify-center gap-1 transition-all active:scale-90"
              aria-label="Performance"
            >
              <div
                className={cn(
                  "rounded-xl p-2 transition-colors",
                  currentPage === "performance" ? "bg-brand/10" : "",
                )}
              >
                <Activity
                  size={24}
                  strokeWidth={currentPage === "performance" ? 2.5 : 2}
                  className={
                    currentPage === "performance"
                      ? "text-brand-light"
                      : "text-textDim"
                  }
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold tracking-tight transition-colors",
                  currentPage === "performance"
                    ? "text-brand-light"
                    : "text-textDim/70",
                )}
              >
                Stats
              </span>
            </Link>

            <Link
              to="/settings"
              className="touch-target no-double-tap flex h-full flex-1 flex-col items-center justify-center gap-1 transition-all active:scale-90"
              aria-label="Profile"
            >
              <div
                className={cn(
                  "rounded-xl p-2 transition-colors",
                  currentPage === "settings" ? "bg-brand/10" : "",
                )}
              >
                <Settings
                  size={24}
                  strokeWidth={currentPage === "settings" ? 2.5 : 2}
                  className={
                    currentPage === "settings"
                      ? "text-brand-light"
                      : "text-textDim"
                  }
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold tracking-tight transition-colors",
                  currentPage === "settings"
                    ? "text-brand-light"
                    : "text-textDim/70",
                )}
              >
                Profile
              </span>
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
