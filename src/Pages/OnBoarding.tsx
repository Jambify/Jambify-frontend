import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../Store/UseUserStore";
import StepIndicator from "../components/OnBoarding/StepIndicator";
import Button from "../components/ui/Button";
import { cn } from "../lib/utils";

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
  { range: "320+", label: "Elite", sub: "Top 1% nationwide", color: "#A855F7" }, // Brighter Purple
  {
    range: "280–319",
    label: "Excellent",
    sub: "Competitive for all Unis",
    color: "#22C55E",
  }, // Brighter Green
  {
    range: "250–279",
    label: "Strong",
    sub: "Target for State/Federal",
    color: "#EAB308",
  }, // Brighter Yellow
  {
    range: "200–249",
    label: "Target",
    sub: "Standard Entry Level",
    color: "#EF4444",
  }, // Brighter Red
];

interface FormData {
  name: string;
  university: string;
  subjectCombo: string;
  targetScore: string;
  examYear: string;
}

const TOTAL_STEPS = 4;

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(1);
  const [uniSearch, setUniSearch] = useState("");
  const [uniResults, setUniResults] = useState<string[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: "",
    university: "",
    subjectCombo: "",
    targetScore: "",
    examYear: " ",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  /* ── University API Search Logic ── */
  useEffect(() => {
    if (uniSearch.length < 2) {
      setUniResults([]);
      return;
    }

    const fetchUnis = async () => {
      setLoadingUnis(true);
      try {
        // Fetching specifically for Nigeria to keep results relevant
        const res = await fetch(
          `http://universities.hipolabs.com/search?name=${uniSearch}&country=Nigeria`,
        );
        const data = await res.json();
        setUniResults(data.map((u: any) => u.name));
      } catch (err) {
        console.error("Failed to fetch universities");
      } finally {
        setLoadingUnis(false);
      }
    };

    const timeoutId = setTimeout(fetchUnis, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [uniSearch]);

  const set = (key: keyof FormData, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (step === 1 && !form.name.trim()) e.name = "Please enter your name";
    if (step === 2 && !form.university)
      e.university = "Please select a university";
    if (step === 3 && !form.subjectCombo)
      e.subjectCombo = "Please choose a combination";
    if (step === 4 && !form.targetScore)
      e.targetScore = "Please choose a target";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    completeOnboarding(form);
    navigate("/welcome");
  };

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

      <div className="w-full max-w-md">
        <StepIndicator current={step} total={TOTAL_STEPS} />

        <div className="bg-[#1A1D23] border border-white/5 rounded-4xl p-8 shadow-2xl backdrop-blur-md animate-fadeIn">
          {/* STEP 1: Name */}
          {step === 1 && (
            <div className="space-y-6">
              <header>
                <h2 className="text-3xl font-bold text-white mb-2">
                  What's your name?
                </h2>
                <p className="text-white/60">
                  Let's personalize your prep experience.
                </p>
              </header>
              <Field label="Full Name" error={errors.name}>
                <input
                  autoFocus
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Chinedu Azikiwe"
                  className={inputCls(!!errors.name)}
                />
              </Field>
              <Field label="Exam Year">
                <div className="grid grid-cols-2 gap-3">
                  {["2025", "2026"].map((yr) => (
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

          {/* STEP 2: University (API Powered) */}
          {step === 2 && (
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
                  placeholder="Start typing (e.g. Unilag...)"
                  className={inputCls(false)}
                />
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {loadingUnis && (
                    <p className="text-xs text-brand animate-pulse">
                      Searching universities...
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
            </div>
          )}

          {/* STEP 3: Subject Combo */}
          {step === 3 && (
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

          {/* STEP 4: Target Score */}
          {step === 4 && (
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

          <div className="flex gap-4 mt-10">
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
        </div>
      </div>
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
