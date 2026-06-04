import React, { useState, useMemo } from "react";
import AppLayout from "../components/Layout/AppLayout";
import { useUserStore } from "../Store/useUserStore";
import { useOfflineStore } from "../Store/useOfflineStore";
import { SAMPLE_QUESTIONS } from "../Data/Question";
import FilterBar from "../components/PastQuestions/FilterBar";
import QuestionRow from "../components/PastQuestions/QuestionRow";
import ProGate from "../components/PastQuestions/ProGate";
import OfflinePackCard from "../components/PastQuestions/OfflinePackCard";
import Button from "../components/ui/Button";
import { WifiOff } from "lucide-react";
import type { Question } from "../Types";

export interface Filters {
  subject: string;
  year: string;
  topic: string;
  difficulty: string;
  search: string;
}

const OFFLINE_PACKS = [
  {
    id: "eng-all",
    subject: "English",
    years: "2010–2024",
    count: 240,
    size: "1.2 MB",
  },
  {
    id: "math-all",
    subject: "Mathematics",
    years: "2010–2024",
    count: 220,
    size: "1.0 MB",
  },
  {
    id: "phy-all",
    subject: "Physics",
    years: "2010–2024",
    count: 200,
    size: "0.9 MB",
  },
  {
    id: "chem-all",
    subject: "Chemistry",
    years: "2010–2024",
    count: 210,
    size: "0.9 MB",
  },
  {
    id: "bio-all",
    subject: "Biology",
    years: "2010–2024",
    count: 190,
    size: "0.8 MB",
  },
];

const PAGE_SIZE = 20;

const PastQuestions: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isPro } = useUserStore();
  const [filters, setFilters] = useState<Filters>({
    subject: "All",
    year: "All",
    topic: "All",
    difficulty: "All",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"browse" | "offline">("browse");
  const { downloadedPacks, getOfflineQuestions } = useOfflineStore();
  const [offlineQuestions, setOfflineQuestions] = useState<Question[]>([]);

  /* ── Load offline questions if needed ─────────── */
  React.useEffect(() => {
    if (downloadedPacks.length > 0) {
      Promise.all(downloadedPacks.map((id) => getOfflineQuestions(id))).then(
        (results) => {
          setOfflineQuestions(results.flat());
        },
      );
    } else {
      setOfflineQuestions([]);
    }
  }, [downloadedPacks, getOfflineQuestions]);

  /* ── Filter questions ──────────────────────────── */
  const filtered = useMemo(() => {
    const source = activeTab === "browse" ? SAMPLE_QUESTIONS : offlineQuestions;
    return (source as Question[]).filter((q) => {
      if (filters.subject !== "All" && q.subject !== filters.subject)
        return false;
      if (filters.year !== "All" && String(q.year) !== filters.year)
        return false;
      if (filters.topic !== "All" && q.topic !== filters.topic) return false;
      if (filters.difficulty !== "All" && q.difficulty !== filters.difficulty)
        return false;
      if (filters.search) {
        const q_ = filters.search.toLowerCase();
        if (
          !q.text.toLowerCase().includes(q_) &&
          !q.topic.toLowerCase().includes(q_)
        )
          return false;
      }
      return true;
    });
  }, [filters, activeTab, offlineQuestions]);

  /* ── Pagination ────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (next: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...next }));
    setPage(1); // reset to page 1 on any filter change
    setExpandedId(null);
  };

  /* ── Derive filter options from data ─────────── */
  const years = [
    "All",
    ...new Set(SAMPLE_QUESTIONS.map((q) => String(q.year))).values(),
  ].sort((a, b) => (b > a ? 1 : -1));
  const topics = [
    "All",
    ...new Set(SAMPLE_QUESTIONS.map((q) => q.topic)).values(),
  ].sort();
  const subjects = [
    "All",
    ...new Set(SAMPLE_QUESTIONS.map((q) => q.subject)).values(),
  ].sort();

  return (
    <AppLayout
      currentPage="past-questions"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      {/* <── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Past Questions
            </h2>
            {isPro && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warn/15 text-warn border border-warn/25">
                PRO
              </span>
            )}
          </div>
          <p className="text-sm text-textMuted">
            {filtered.length} question{filtered.length !== 1 ? "s" : ""} found
            {filters.subject !== "All" ? ` in ${filters.subject}` : ""}
            {filters.year !== "All" ? ` · ${filters.year}` : ""}
          </p>
        </div>

        {/* <Tab switcher */}
        <div className="flex gap-1 bg-bgSurface border border-borderMuted rounded-brand p-1">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-4 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === "browse"
                ? "bg-bgCard text-textMain border border-borderMuted"
                : "text-textMuted hover:text-textMain"
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setActiveTab("offline")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === "offline"
                ? "bg-bgCard text-textMain border border-borderMuted"
                : "text-textMuted hover:text-textMain"
            }`}
          >
            Offline packs
            {!isPro && (
              <span className="text-[9px] px-1.5 py-0.5 bg-warn/15 text-warn rounded-full">
                PRO
              </span>
            )}
          </button>
        </div>
      </div>

      {/* <── BROWSE TAB ── */}
      {activeTab === "browse" && (
        <div className="animate-fadeIn">
          <FilterBar
            filters={filters}
            subjects={subjects}
            years={years}
            topics={topics}
            onChange={handleFilterChange}
          />

          {paginated.length === 0 ? (
            <div className="text-center py-16 text-textDim">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm">No questions match your filters.</p>
              <button
                className="mt-3 text-xs text-brand-light hover:underline"
                onClick={() =>
                  handleFilterChange({
                    subject: "All",
                    year: "All",
                    topic: "All",
                    difficulty: "All",
                    search: "",
                  })
                }
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {paginated.map((q) => (
                  <QuestionRow
                    key={q.id}
                    question={q}
                    isExpanded={expandedId === q.id}
                    onToggle={() =>
                      setExpandedId((prev) => (prev === q.id ? null : q.id))
                    }
                  />
                ))}
              </div>

              {/* <── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Previous
                  </Button>
                  <span className="text-xs text-textDim">
                    Page {page} of {totalPages} · {filtered.length} total
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* <── OFFLINE TAB ── */}
      {activeTab === "offline" && (
        <div className="animate-fadeIn">
          {!isPro ? (
            <ProGate />
          ) : (
            <>
              <div className="bg-success/10 border border-success/20 rounded-brand-lg px-4 py-3 flex items-center gap-2 mb-5 text-sm text-success">
                ✓{" "}
                <span>
                  Pro plan active — download any subject pack for offline
                  access.
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-textDim flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                    Available Packs
                  </h3>
                  <div className="flex flex-col gap-3">
                    {OFFLINE_PACKS.map((pack) => (
                      <OfflinePackCard key={pack.id} pack={pack} />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-textDim flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    Offline Browser
                  </h3>
                  <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-4 min-h-75">
                    {offlineQuestions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                        <div className="w-12 h-12 bg-bgSurface rounded-full flex items-center justify-center mb-3">
                          <WifiOff size={20} className="text-textDim" />
                        </div>
                        <p className="text-sm font-bold text-textMain">
                          No questions downloaded yet
                        </p>
                        <p className="text-xs text-textDim mt-1">
                          Download a pack to view questions offline
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FilterBar
                          filters={filters}
                          subjects={[
                            "All",
                            ...new Set(offlineQuestions.map((q) => q.subject)),
                          ]}
                          years={[
                            "All",
                            ...new Set(
                              offlineQuestions.map((q) => String(q.year)),
                            ),
                          ]}
                          topics={[
                            "All",
                            ...new Set(offlineQuestions.map((q) => q.topic)),
                          ]}
                          onChange={handleFilterChange}
                        />
                        <div className="flex flex-col gap-2 max-h-125 overflow-y-auto pr-1 custom-scrollbar">
                          {paginated.map((q) => (
                            <QuestionRow
                              key={q.id}
                              question={q}
                              isExpanded={expandedId === q.id}
                              onToggle={() =>
                                setExpandedId((prev) =>
                                  prev === q.id ? null : q.id,
                                )
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default PastQuestions;
