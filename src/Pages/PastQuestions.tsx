import React, { useState, useMemo, useEffect } from "react";
import AppLayout from "../components/Layout/AppLayout";
import { useUserStore } from "../Store/useUserStore";
import { useOfflineStore } from "../Store/useOfflineStore";
import { SUBJECT_COMBO_MAP } from "../Store/useSubjectStore";
import FilterBar from "../components/PastQuestions/FilterBar";
import QuestionRow from "../components/PastQuestions/QuestionRow";
import ProGate from "../components/PastQuestions/ProGate";
import OfflinePackCard from "../components/PastQuestions/OfflinePackCard";
import Button from "../components/ui/Button";
import { WifiOff, Loader2 } from "lucide-react";
import type { Question } from "../Types";
import {
  fetchAllQuestionsForBrowse,
  fetchTopicsBySubject,
} from "../Services/questionService";

export interface Filters {
  subject: string;
  year: string;
  topic: string;
  difficulty: string;
  search: string;
}

// Pre-defined years: 2016-2025
const VALID_YEARS = ["All", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016"];

const OFFLINE_PACKS = [
  {
    id: "eng-all",
    subject: "English",
    years: "2016–2025",
    count: 240,
    size: "1.2 MB",
  },
  {
    id: "math-all",
    subject: "Mathematics",
    years: "2016–2025",
    count: 220,
    size: "1.0 MB",
  },
  {
    id: "phy-all",
    subject: "Physics",
    years: "2016–2025",
    count: 200,
    size: "0.9 MB",
  },
  {
    id: "chem-all",
    subject: "Chemistry",
    years: "2016–2025",
    count: 210,
    size: "0.9 MB",
  },
  {
    id: "bio-all",
    subject: "Biology",
    years: "2016–2025",
    count: 190,
    size: "0.8 MB",
  },
];

const PAGE_SIZE = 20;

const PastQuestions: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isPro, subjectCombo: userSubjectComboId } = useUserStore();
  const userSubjects = userSubjectComboId
    ? SUBJECT_COMBO_MAP[userSubjectComboId] ?? []
    : [];

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
  const [browseQuestions, setBrowseQuestions] = useState<Question[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all browse questions on mount and when filters change
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const qs = await fetchAllQuestionsForBrowse(
          filters.subject,
          filters.year,
          filters.topic,
          filters.difficulty,
        );
        if (isMounted) setBrowseQuestions(qs);
      } catch (err) {
        console.error("[PastQuestions] Error loading browse questions:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [filters.subject, filters.year, filters.topic, filters.difficulty]);

  // Load available topics when selected subject changes
  useEffect(() => {
    let isMounted = true;
    async function loadTopics() {
      if (filters.subject && filters.subject !== "All") {
        const topics = await fetchTopicsBySubject(filters.subject);
        if (isMounted) setAvailableTopics(topics);
      } else {
        setAvailableTopics([]);
      }
    }
    loadTopics();
    return () => {
      isMounted = false;
    };
  }, [filters.subject]);

  /* ── Load offline questions if needed ─────────── */
  useEffect(() => {
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
    const source = activeTab === "browse" ? browseQuestions : offlineQuestions;
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
  }, [filters, activeTab, offlineQuestions, browseQuestions]);

  /* ── Pagination ────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (next: Partial<Filters>) => {
    // If we change subject, reset topic to "All"
    if (next.subject && next.subject !== filters.subject) {
      setFilters((f) => ({ ...f, ...next, topic: "All" }));
    } else {
      setFilters((f) => ({ ...f, ...next }));
    }
    setPage(1);
    setExpandedId(null);
  };

  /* ── Derive filter options ─────────── */
  // Subjects: user's subjects first, then others
  const allPossibleSubjects = [
    "English",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Government",
    "Literature in English",
    "History",
    "Geography",
    "CRS",
    "IRS",
    "Commerce",
  ];
  const subjects = useMemo(() => {
    const others = allPossibleSubjects.filter((s) => !userSubjects.includes(s));
    return ["All", ...userSubjects, ...others];
  }, [userSubjects]);

  const topics = useMemo(() => {
    return ["All", ...availableTopics];
  }, [availableTopics]);

  return (
    <AppLayout
      currentPage="past-questions"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      {/* <── Page header ── */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Past Questions
            </h2>
            {isPro && (
              <span className="bg-warn/15 text-warn border-warn/25 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                PRO
              </span>
            )}
          </div>
          <p className="text-textMuted text-sm">
            {filtered.length} question{filtered.length !== 1 ? "s" : ""} found
            {filters.subject !== "All" ? ` in ${filters.subject}` : ""}
            {filters.year !== "All" ? ` · ${filters.year}` : ""}
          </p>
        </div>

        {/* <Tab switcher */}
        <div className="bg-bgSurface border-borderMuted rounded-brand flex gap-1 border p-1">
          <button
            onClick={() => setActiveTab("browse")}
            className={`rounded px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === "browse"
                ? "bg-bgCard text-textMain border-borderMuted border"
                : "text-textMuted hover:text-textMain"
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setActiveTab("offline")}
            className={`flex items-center gap-1.5 rounded px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === "offline"
                ? "bg-bgCard text-textMain border-borderMuted border"
                : "text-textMuted hover:text-textMain"
            }`}
          >
            Offline packs
            {!isPro && (
              <span className="bg-warn/15 text-warn rounded-full px-1.5 py-0.5 text-[9px]">
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
            years={VALID_YEARS}
            topics={topics}
            onChange={handleFilterChange}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="text-brand h-10 w-10 animate-spin" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-textDim py-16 text-center">
              <div className="mb-3 text-4xl">🔍</div>
              <p className="text-sm">No questions match your filters.</p>
              <button
                className="text-brand-light mt-3 text-xs hover:underline"
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
                <div className="mt-6 flex items-center justify-between">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Previous
                  </Button>
                  <span className="text-textDim text-xs">
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
              <div className="bg-success/10 border-success/20 rounded-brand-lg text-success mb-5 flex items-center gap-2 border px-4 py-3 text-sm">
                ✓{" "}
                <span>
                  Pro plan active — download any subject pack for offline
                  access.
                </span>
              </div>

              <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-textDim flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                    <div className="bg-brand h-1.5 w-1.5 rounded-full" />
                    Available Packs
                  </h3>
                  <div className="flex flex-col gap-3">
                    {OFFLINE_PACKS.map((pack) => (
                      <OfflinePackCard key={pack.id} pack={pack} />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-textDim flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                    <div className="bg-success h-1.5 w-1.5 rounded-full" />
                    Offline Browser
                  </h3>
                  <div className="bg-bgCard border-borderMuted rounded-brand-xl min-h-75 border p-4">
                    {offlineQuestions.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                        <div className="bg-bgSurface mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                          <WifiOff size={20} className="text-textDim" />
                        </div>
                        <p className="text-textMain text-sm font-bold">
                          No questions downloaded yet
                        </p>
                        <p className="text-textDim mt-1 text-xs">
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
                          years={VALID_YEARS}
                          topics={[
                            "All",
                            ...new Set(offlineQuestions.map((q) => q.topic)),
                          ]}
                          onChange={handleFilterChange}
                        />
                        <div className="custom-scrollbar flex max-h-125 flex-col gap-2 overflow-y-auto pr-1">
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
