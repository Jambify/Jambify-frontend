import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../Store/UseUserStore";
import StepIndicator from "../components/OnBoarding/StepIndicator";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import { cn } from "../lib/utils/utils";
import LoadingScreen from "../components/ui/LoadingScreen";

/* ── Updated Data with Professional Combos ── */
const SUBJECT_COMBOS = [
  {
    id: "medicine",
    label: "Medicine & Pharmacy",
    subjects: ["English", "Biology", "Chemistry", "Physics"],
    icon: "🩺",
  },
  {
    id: "engineering",
    label: "Engineering & Tech",
    subjects: ["English", "Mathematics", "Physics", "Chemistry"],
    icon: "⚙️",
  },
  {
    id: "social-sci",
    label: "Social Sciences",
    subjects: ["English", "Mathematics", "Economics", "Government"],
    icon: "📈",
  },
  {
    id: "law",
    label: "Law & Arts",
    subjects: ["English", "Literature", "Government", "CRS/IRS"],
    icon: "⚖️",
  },
];

const TARGET_SCORES = [
  { range: "320+", label: "Elite", sub: "Top 1% nationwide", color: "#A855F7" },
  {
    range: "280–319",
    label: "Excellent",
    sub: "Competitive for all Unis",
    color: "#22C55E",
  },
  {
    range: "250–279",
    label: "Strong",
    sub: "Target for State/Federal",
    color: "#EAB308",
  },
  {
    range: "200–249",
    label: "Target",
    sub: "Standard Entry Level",
    color: "#EF4444",
  },
];

// FALLBACK UNIVERSITY LIST (Nigerian Universities)
const FALLBACK_UNIVERSITIES = [
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "Ahmadu Bello University (ABU)",
  "University of Nigeria, Nsukka (UNN)",
  "Covenant University",
  "University of Benin (UNIBEN)",
  "Federal University of Technology, Minna",
  "University of Ilorin (UNILORIN)",
  "Lagos State University (LASU)",
  "Nnamdi Azikiwe University (UNIZIK)",
  "University of Port Harcourt (UNIPORT)",
  "Bayero University Kano (BUK)",
  "University of Abuja",
  "Federal University of Technology, Akure",
  "Babcock University",
  "Pan-Atlantic University",
  "Rivers State University",
  "Kwara State University",
  "University of Calabar (UNICAL)",
];

interface FormData {
  university: string;
  subjectCombo: string;
  targetScore: string;
  examYear: string;
  examDate: string;
}

const TOTAL_STEPS = 3;

const Onboarding: React.FC = () => {
  console.log("🔵 Onboarding component mounted");
  const navigate = useNavigate();
  const {
    completeOnboarding,
    isLoading,
    isAuthenticated,
    onboardingComplete,
    syncProfile,
    signOut,
    name: userName,
  } = useUserStore();

  const [step, setStep] = useState(1);
  const [uniSearch, setUniSearch] = useState("");
  const [uniResults, setUniResults] = useState<string[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [uniError, setUniError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false); // ← Add this

  const [form, setForm] = useState<FormData>({
    university: "",
    subjectCombo: "",
    targetScore: "",
    examYear: "2027",
    examDate: "Apr 27",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Debug logging
  useEffect(() => {
    console.log("🔵 Onboarding state:", {
      isAuthenticated,
      onboardingComplete,
      isLoading,
      userName,
      id: useUserStore.getState().id,
      email: useUserStore.getState().email,
    });
    setIsCheckingAuth(false);
  }, [isAuthenticated, onboardingComplete, isLoading, userName]);

  // Redirect if already onboarded
  useEffect(() => {
    if (!isCheckingAuth && onboardingComplete) {
      console.log("🔵 Already onboarded, redirecting to /");
      navigate("/", { replace: true });
    }
  }, [onboardingComplete, navigate, isCheckingAuth]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated && !isLoading) {
      console.log("🔵 Not authenticated, redirecting to /signin");
      navigate("/signin", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, isCheckingAuth]);

  // Sync profile on mount to ensure we have latest data
  useEffect(() => {
    const loadProfile = async () => {
      await syncProfile();
    };
    loadProfile();
  }, [syncProfile]);

  // Handle cancel with modal
  const handleCancel = async () => {
    setShowCancelModal(false);
    await signOut();
    navigate("/signup", { replace: true });
  };

  // Filter fallback universities based on search
  const getFilteredFallbackUniversities = (search: string) => {
    if (!search || search.length < 2) return [];
    const searchLower = search.toLowerCase();
    return FALLBACK_UNIVERSITIES.filter((uni) =>
      uni.toLowerCase().includes(searchLower),
    );
  };

  /* ── University API Search Logic with Fallback ── */
  useEffect(() => {
    if (uniSearch.length < 2) {
      setUniResults([]);
      setUniError(null);
      return;
    }

    if (useFallback) {
      const filtered = getFilteredFallbackUniversities(uniSearch);
      setUniResults(filtered);
      return;
    }

    const fetchUnis = async () => {
      setLoadingUnis(true);
      setUniError(null);

      try {
        let data = [];
        let success = false;

        try {
          const res = await fetch(
            `https://universities.hipolabs.com/search?name=${encodeURIComponent(uniSearch)}&country=Nigeria`,
            { mode: "cors" },
          );
          if (res.ok) {
            data = await res.json();
            if (data.length > 0) success = true;
          }
        } catch (err) {
          console.log("Primary API failed, trying backup...");
        }

        if (!success) {
          try {
            const backupRes = await fetch(
              `https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json`,
            );
            if (backupRes.ok) {
              const allUnis = await backupRes.json();
              const nigeriaUnis = allUnis.filter(
                (u: any) =>
                  u.country === "Nigeria" &&
                  u.name.toLowerCase().includes(uniSearch.toLowerCase()),
              );
              data = nigeriaUnis.slice(0, 20);
              if (data.length > 0) success = true;
            }
          } catch (err) {
            console.log("Backup API also failed");
          }
        }

        if (success && data.length > 0) {
          setUniResults(data.map((u: any) => u.name));
          setUseFallback(false);
        } else {
          const fallbackResults = getFilteredFallbackUniversities(uniSearch);
          if (fallbackResults.length > 0) {
            setUniResults(fallbackResults);
            setUseFallback(true);
            setUniError(
              "Using offline university list. Showing available matches.",
            );
          } else {
            setUniResults([]);
            setUniError("No universities found. Try a different search term.");
          }
        }
      } catch (err) {
        console.error("Failed to fetch universities:", err);
        const fallbackResults = getFilteredFallbackUniversities(uniSearch);
        if (fallbackResults.length > 0) {
          setUniResults(fallbackResults);
          setUseFallback(true);
          setUniError("Connected to offline university database.");
        } else {
          setUniResults([]);
          setUniError(
            "Unable to search. Please type the full university name.",
          );
        }
      } finally {
        setLoadingUnis(false);
      }
    };

    const timeoutId = setTimeout(fetchUnis, 500);
    return () => clearTimeout(timeoutId);
  }, [uniSearch, useFallback]);

  const set = (key: keyof FormData, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (step === 1 && !form.university)
      e.university = "Please select a university";
    if (step === 2 && !form.subjectCombo)
      e.subjectCombo = "Please choose a combination";
    if (step === 3 && !form.targetScore)
      e.targetScore = "Please choose a target";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    setIsCompleting(true);
    console.log("🔵 Completing onboarding...");

    try {
      const { error } = await completeOnboarding({
        name: userName,
        university: form.university,
        subjectCombo: form.subjectCombo,
        targetScore: form.targetScore,
        examYear: form.examYear,
        examDate: form.examDate,
      });

      if (!error) {
        setTimeout(() => {
          navigate("/welcome", { replace: true });
        }, 100);
      } else {
        console.error("Onboarding error:", error);
        setIsCompleting(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setIsCompleting(false);
    }
  };

  // Show loading state
  if (isLoading || isCheckingAuth || isCompleting) {
    return (
      <LoadingScreen
        message={
          isCompleting ? "Completing your setup" : "Loading your profile"
        }
        submessage={
          isCompleting ? "This will just take a moment" : "Please wait"
        }
        estimatedTime={isCompleting ? 3 : 2}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-white flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center font-display font-black text-white text-xl shadow-[0_0_20px_rgba(var(--brand-rgb),0.5)]">
          J
        </div>
        <span className="font-display font-bold text-2xl tracking-tight text-white">
          JAMB<span className="text-brand">IFY</span>
        </span>
      </div>

      {/* Welcome message with user's name */}
      <div className="text-center mb-6">
        <p className="text-textDim">Welcome,</p>
        <h2 className="text-2xl font-bold text-white">
          {userName || "JAMB Champion"}!
        </h2>
        <p className="text-textDim text-sm mt-1">Let's set up your profile</p>
      </div>

      <div className="w-full max-w-md">
        <StepIndicator current={step} total={TOTAL_STEPS} />

        <div className="bg-[#1A1D23] border border-white/5 rounded-4xl p-8 shadow-2xl backdrop-blur-md animate-fadeIn">
          {/* STEP 1: University */}
          {step === 1 && (
            <div className="space-y-6">
              <header>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Dream University
                </h2>
                <p className="text-white/60">
                  Search for any Federal, State, or Private school.
                </p>
              </header>
              <Field label="Search University" error={errors.university}>
                <input
                  type="text"
                  value={uniSearch}
                  onChange={(e) => setUniSearch(e.target.value)}
                  placeholder="Start typing (e.g. Unilag, OAU, UNN...)"
                  className={inputCls(!!errors.university)}
                  autoFocus
                />

                {uniError && (
                  <p className="text-xs text-yellow-500 mt-2">{uniError}</p>
                )}

                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {loadingUnis && (
                    <p className="text-xs text-brand animate-pulse">
                      Searching universities...
                    </p>
                  )}

                  {!loadingUnis &&
                    uniResults.length === 0 &&
                    uniSearch.length >= 2 && (
                      <p className="text-xs text-textDim text-center py-4">
                        No universities found. Try a different search or type
                        the full name.
                      </p>
                    )}

                  {uniResults.map((uni) => (
                    <button
                      key={uni}
                      onClick={() => {
                        set("university", uni);
                        setUniSearch(uni);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                        form.university === uni
                          ? "bg-brand/20 border-brand text-white"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10",
                      )}
                    >
                      {uni}
                    </button>
                  ))}
                </div>
              </Field>

              {uniSearch.length >= 2 &&
                uniResults.length === 0 &&
                !loadingUnis && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-textDim mb-2">
                      Can't find your university?
                    </p>
                    <button
                      onClick={() => {
                        set("university", uniSearch);
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl border border-dashed border-brand/50 text-sm text-brand-light hover:bg-brand/10 transition-all"
                    >
                      Use "{uniSearch}" as your university
                    </button>
                  </div>
                )}

              <Field label="Exam Year">
                <div className="grid grid-cols-2 gap-3">
                  {["2027"].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => set("examYear", yr)}
                      className={cn(
                        "py-3 rounded-xl border text-sm font-bold transition-all",
                        form.examYear === yr
                          ? "bg-brand border-brand text-white shadow-lg shadow-brand/20"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10",
                      )}
                    >
                      JAMB {yr}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* STEP 2: Subject Combo */}
          {step === 2 && (
            <div className="space-y-6">
              <header>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Your Path
                </h2>
                <p className="text-white/60">Choose your area of study.</p>
              </header>
              <div className="space-y-3">
                {SUBJECT_COMBOS.map((combo) => (
                  <button
                    key={combo.id}
                    onClick={() => set("subjectCombo", combo.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                      form.subjectCombo === combo.id
                        ? "bg-brand/20 border-brand shadow-[0_0_15px_rgba(var(--brand-rgb),0.1)]"
                        : "bg-white/5 border-white/10 opacity-70 hover:opacity-100",
                    )}
                  >
                    <span className="text-2xl">{combo.icon}</span>
                    <div>
                      <p className="font-bold text-white">{combo.label}</p>
                      <p className="text-xs text-white/40">
                        {combo.subjects.join(" + ")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Target Score */}
          {step === 3 && (
            <div className="space-y-6">
              <header>
                <h2 className="text-3xl font-bold text-white mb-2">Aim High</h2>
                <p className="text-white/60">
                  Set a target to keep you motivated.
                </p>
              </header>
              <div className="space-y-3">
                {TARGET_SCORES.map((t) => (
                  <button
                    key={t.range}
                    onClick={() => set("targetScore", t.range)}
                    className={cn(
                      "w-full flex justify-between items-center p-5 rounded-2xl border transition-all",
                      form.targetScore === t.range
                        ? "bg-white/10 border-white/20"
                        : "bg-white/5 border-white/5",
                    )}
                  >
                    <div>
                      <p
                        className="text-xl font-black"
                        style={{ color: t.color }}
                      >
                        {t.range}
                      </p>
                      <p className="text-xs font-bold text-white/80">
                        {t.label}
                      </p>
                    </div>
                    <p className="text-[10px] text-white/40 text-right max-w-25">
                      {t.sub}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 mt-10">
            <div className="flex gap-4">
              {step > 1 && (
                <Button
                  variant="secondary"
                  onClick={() => setStep((s) => s - 1)}
                  className="bg-white/5 border-white/10"
                >
                  Back
                </Button>
              )}
              <Button variant="primary" fullWidth onClick={handleNext}>
                {step === TOTAL_STEPS ? "Ready to Win" : "Next Step"}
              </Button>
            </div>

            <button
              onClick={() => setShowCancelModal(true)}
              className="text-xs text-textDim hover:text-danger transition-colors py-2"
            >
              Cancel & Back to Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Cancel Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Cancel Onboarding"
        message="Are you sure you want to cancel? You will be signed out and your progress will not be saved."
        confirmText="Yes, Cancel"
        cancelText="Go Back"
        type="danger"
      />
    </div>
  );
};

const Field: React.FC<{
  label?: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
  <div className="space-y-2">
    {label && (
      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
        {label}
      </label>
    )}
    {children}
    {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
  </div>
);

const inputCls = (hasError: boolean) =>
  cn(
    "w-full px-5 py-4 bg-white/5 rounded-2xl border text-white font-medium transition-all",
    "placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand/20",
    hasError ? "border-red-500" : "border-white/10 focus:border-brand/50",
  );

export default Onboarding;