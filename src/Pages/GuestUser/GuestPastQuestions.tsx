import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHelmet from "../../components/SEO/PageHelmet";
import ThemeToggle from "../../components/ui/ThemeToggle";
import schooldraLogo from "../../assets/schooldraLogo.png";
import {
  Loader2,
  Search,
  X,
  Calendar,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Lock,
  ArrowRight,
} from "lucide-react";
import type { Question } from "../../Types";
import { fetchAllQuestionsForBrowse } from "../../Services/questionService";

interface Filters {
  subject: string;
  year: string;
  search: string;
}

const VALID_YEARS = [
  "All",
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
  "2016",
  "2015",
] as const;

const ALL_SUBJECTS = [
  "English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Government",
  "Literature",
  "History",
  "Geography",
  "CRS",
  "IRS",
  "Commerce",
];

// Theme tokens, not hardcoded hex — so a future palette change (like the
// one earlier in this project) updates these automatically instead of
// needing another hunt-and-replace pass.
const SUBJECT_COLORS: Record<string, string> = {
  English: "var(--color-brand)",
  Mathematics: "var(--color-success)",
  Physics: "var(--color-warn)",
  Chemistry: "var(--color-danger)",
  Biology: "var(--color-teal)",
  Economics: "var(--color-brand)",
  Government: "var(--color-warn)",
  Literature: "var(--color-brand)",
  History: "var(--color-danger)",
  Geography: "var(--color-teal)",
  CRS: "var(--color-brand)",
  IRS: "var(--color-teal)",
  Commerce: "var(--color-warn)",
};

// Guests see up to this many questions per filter selection, then hit a
// sign-up CTA instead of endless pagination.
const FREE_PREVIEW_LIMIT = 12;

const GuestPastQuestions = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Filters>({
    subject: "All",
    year: "All",
    search: "",
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setLoadingError(null);
      try {
        const qs = await fetchAllQuestionsForBrowse(
          filters.subject,
          filters.year,
          "All",
          "All",
        );
        if (isMounted) setQuestions(qs as Question[]);
      } catch (e) {
        console.error("Error loading guest past questions:", e);
        if (isMounted)
          setLoadingError(
            (e as Error)?.message || "Failed to load questions. Please try again.",
          );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [filters.subject, filters.year]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (!filters.search) return true;
      const search = filters.search.toLowerCase();
      return (
        q.text.toLowerCase().includes(search) ||
        q.topic.toLowerCase().includes(search)
      );
    });
  }, [questions, filters.search]);

  const preview = filteredQuestions.slice(0, FREE_PREVIEW_LIMIT);
  const remainingCount = Math.max(
    0,
    filteredQuestions.length - FREE_PREVIEW_LIMIT,
  );

  const handleFilterChange = (next: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setExpandedId(null);
  };

  return (
    <div className="bg-bgMain text-textMain min-h-screen">
      <PageHelmet
        title="Free JAMB Past Questions | SCHOOLDRA"
        description="Browse real JAMB UTME past questions by subject and year, free — no account required. Sign up for full access to every year and subject."
        canonical="https://www.schooldra.com/guest/past-questions"
      />

      {/* Simple guest header — no sidebar, matches GuestLanding style */}
      <header className="border-borderMuted border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/guest" className="flex items-center gap-2.5">
            <img src={schooldraLogo} alt="Schooldra" className="h-8 w-8" />
            <span className="font-display text-lg font-bold tracking-tight">
              Schooldra
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/guest"
              className="text-textDim hover:text-textMain hidden items-center gap-1.5 text-sm font-medium transition-colors sm:flex"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Practice Menu
            </Link>
            <Link
              to="/signin"
              className="text-textDim hover:text-textMain hidden text-sm font-medium transition-colors sm:block"
            >
              Sign In
            </Link>
            <ThemeToggle />
          </div>
        </div>
        {/* Mobile-only back link, shown below the logo row on small screens */}
        <div className="border-borderMuted border-t px-4 py-2 sm:hidden">
          <Link
            to="/guest"
            className="text-textDim hover:text-textMain flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Practice Menu
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
        {/* Page header */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="font-display text-textMain text-2xl font-bold tracking-tight lg:text-3xl">
              Past Questions
            </h1>
            <span className="border-teal/25 bg-teal/10 text-teal rounded-full border px-2.5 py-1 text-[10px] font-bold">
              FREE PREVIEW
            </span>
          </div>
          <p className="text-textDim text-sm">
            Practice real JAMB past questions, free — no account needed.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-bgCard border-borderMuted space-y-4 rounded-2xl border p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-textDim text-xs font-semibold tracking-wider uppercase">
                Subject
              </label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange({ subject: e.target.value })}
                className="bg-bgSurface border-borderMuted text-textMain focus:ring-brand/50 w-full rounded-xl border px-4 py-2.5 focus:ring-2 focus:outline-none"
              >
                <option value="All">All Subjects</option>
                {ALL_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-textDim text-xs font-semibold tracking-wider uppercase">
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange({ year: e.target.value })}
                className="bg-bgSurface border-borderMuted text-textMain focus:ring-brand/50 w-full rounded-xl border px-4 py-2.5 focus:ring-2 focus:outline-none"
              >
                {VALID_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y === "All" ? "All Years" : y}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-textDim text-xs font-semibold tracking-wider uppercase">
                Search
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="text-textDim absolute top-1/2 left-4 -translate-y-1/2"
                />
                <input
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  placeholder="Search..."
                  className="bg-bgSurface border-borderMuted text-textMain focus:ring-brand/50 w-full rounded-xl border py-2.5 pr-4 pl-12 focus:ring-2 focus:outline-none"
                />
                {filters.search && (
                  <button
                    onClick={() => handleFilterChange({ search: "" })}
                    className="text-textDim hover:text-textMain absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="text-brand h-8 w-8 animate-spin" />
            <p className="text-textDim text-sm">Loading questions...</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && loadingError && (
          <div className="bg-danger/10 border-danger/30 flex flex-col items-center gap-3 rounded-xl border p-8 text-center">
            <AlertCircle className="text-danger h-8 w-8" />
            <p className="text-textMain font-semibold">
              We couldn't load questions right now
            </p>
            <p className="text-textDim text-sm">{loadingError}</p>
          </div>
        )}

        {/* No results */}
        {!isLoading && !loadingError && preview.length === 0 && (
          <div className="bg-bgCard border-borderMuted rounded-2xl border p-12 text-center">
            <h3 className="text-textMain mb-2 text-xl font-bold">
              No questions found
            </h3>
            <p className="text-textDim">Try a different subject or year.</p>
          </div>
        )}

        {/* Questions list */}
        {!isLoading && !loadingError && preview.length > 0 && (
          <>
            <p className="text-textDim text-sm">
              Showing{" "}
              <span className="text-textMain font-semibold">
                {preview.length}
              </span>{" "}
              free preview question{preview.length !== 1 ? "s" : ""}
              {remainingCount > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span className="text-textMain font-semibold">
                    {remainingCount}
                  </span>{" "}
                  more available with a free account
                </>
              )}
            </p>

            <div className="space-y-4">
              {preview.map((q, idx) => {
                const color = SUBJECT_COLORS[q.subject] || "var(--color-brand)";
                const isExpanded = expandedId === q.id;

                return (
                  <div
                    key={q.id}
                    className="bg-bgCard border-borderMuted overflow-hidden rounded-2xl border transition-all"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="w-full p-5 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                            color,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-3">
                            <span
                              className="rounded-full px-2.5 py-1 text-xs font-semibold"
                              style={{
                                backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                                color,
                              }}
                            >
                              {q.subject}
                            </span>
                            <span className="text-textDim flex items-center gap-1 text-xs">
                              <Calendar size={14} /> {q.year}
                            </span>
                            <span className="text-textDim flex items-center gap-1 text-xs">
                              <Lightbulb size={14} /> {q.difficulty}
                            </span>
                          </div>
                          <p className="text-textMain leading-relaxed font-medium">
                            {q.text}
                          </p>
                        </div>
                        <ChevronRight
                          size={20}
                          className={`text-textDim shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-borderMuted border-t px-5 pt-1 pb-5">
                        {q.instruction && (
                          <div className="bg-bgSurface mb-4 rounded-xl p-4">
                            <p className="text-textDim text-sm">
                              <span className="text-textMain font-semibold">
                                Instruction:{" "}
                              </span>
                              {q.instruction}
                            </p>
                          </div>
                        )}
                        <div className="space-y-2.5">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-3 rounded-xl border p-4 ${
                                optIdx === q.answer
                                  ? "border-success/30 bg-success/5"
                                  : "border-borderMuted bg-bgSurface"
                              }`}
                            >
                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                  optIdx === q.answer
                                    ? "bg-success text-white"
                                    : "bg-bgCard border-borderMuted text-textDim border"
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span
                                className={
                                  optIdx === q.answer
                                    ? "text-textMain font-semibold"
                                    : "text-textDim"
                                }
                              >
                                {opt}
                              </span>
                              {optIdx === q.answer && (
                                <CheckCircle2
                                  size={18}
                                  className="text-success ml-auto"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sign-up CTA instead of pagination, once the free cap is hit */}
            {remainingCount > 0 && (
              <div className="border-brand/20 bg-brand/5 flex flex-col items-center gap-3 rounded-2xl border p-8 text-center">
                <div className="bg-brand/10 flex h-12 w-12 items-center justify-center rounded-full">
                  <Lock className="text-brand h-5 w-5" />
                </div>
                <h3 className="font-display text-textMain text-lg font-bold">
                  {remainingCount} more question{remainingCount !== 1 ? "s" : ""}{" "}
                  waiting for you
                </h3>
                <p className="text-textDim max-w-sm text-sm">
                  Create a free account to unlock every past question from
                  2015 to 2025, across every subject.
                </p>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-brand hover:bg-brand-light mt-2 flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-all active:scale-95"
                >
                  Create Free Account <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GuestPastQuestions;