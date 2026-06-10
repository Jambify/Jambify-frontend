
import  { useState, useMemo, useEffect } from "react";
import AppLayout from "../components/Layout/AppLayout";
import { useUserStore } from "../Store/useUserStore";
import { SUBJECT_COMBO_MAP } from "../Store/useSubjectStore";
import Button from "../components/ui/Button";
import {
  Loader2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import type { Question } from "../Types";
import {
  fetchAllQuestionsForBrowse,
  fetchTopicsBySubject,
} from "../Services/questionService";
import ProGate from "../components/PastQuestions/ProGate";

export interface Filters {
  subject: string;
  year: string;
  topic: string;
  difficulty: string;
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
] as const;

const ALL_SUBJECTS = [
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

const SUBJECT_COLORS: Record<string, string> = {
  English: "#7B5FFF",
  Mathematics: "#00C896",
  Physics: "#FFB020",
  Chemistry: "#FF4D6D",
  Biology: "#00C896",
  Economics: "#7B5FFF",
  Government: "#FFB020",
  "Literature in English": "#7B5FFF",
  History: "#FF4D6D",
  Geography: "#00C896",
  CRS: "#7B5FFF",
  IRS: "#00C896",
  Commerce: "#FFB020",
};

const PAGE_SIZE = 20;

const PastQuestions = () => {
  const { subjectCombo, isPro } = useUserStore();
  const userSubjects = subjectCombo ? SUBJECT_COMBO_MAP[subjectCombo] ?? [] : [];
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    subject: userSubjects[0] || "All",
    year: "All",
    topic: "All",
    difficulty: "All",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const qs = await fetchAllQuestionsForBrowse(
          filters.subject,
          filters.year,
          filters.topic,
          filters.difficulty,
        );
        if (isMounted) setQuestions(qs);
      } catch (e) {
        console.error("Error loading questions:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [filters.subject, filters.year, filters.topic, filters.difficulty]);

  useEffect(() => {
    let isMounted = true;
    const loadTopics = async () => {
      if (filters.subject && filters.subject !== "All") {
        const topics = await fetchTopicsBySubject(filters.subject);
        if (isMounted) setAvailableTopics(topics);
      } else {
        setAvailableTopics([]);
      }
    };
    loadTopics();
    return () => { isMounted = false; };
  }, [filters.subject]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (!filters.search) return true;
      const search = filters.search.toLowerCase();
      return q.text.toLowerCase().includes(search) || 
             q.topic.toLowerCase().includes(search);
    });
  }, [questions, filters.search]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredQuestions.slice(start, start + PAGE_SIZE);
  }, [filteredQuestions, page]);

  const handleFilterChange = (next: Partial<Filters>) => {
    setFilters(prev => ({
      ...prev,
      ...next,
      ...(next.subject && next.subject !== prev.subject ? { topic: "All" } : {}),
    }));
    setPage(1);
    setExpandedId(null);
  };

  if (!isPro) {
    return (
      <AppLayout
        currentPage="past-questions"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <ProGate />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      currentPage="past-questions"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-3xl font-bold text-textMain">
              Past Questions
            </h1>
            <span className="bg-yellow-500/10 border-yellow-500/25 text-yellow-400 rounded-full border px-2.5 py-1 text-[10px] font-bold">
              PRO
            </span>
          </div>
          <p className="text-textDim">
            Practice real JAMB past questions from 2016 to 2025
          </p>
        </div>

        {/* Filters */}
        <div className="bg-bgCard rounded-2xl border border-borderMuted p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-textDim text-xs font-semibold uppercase tracking-wider">
                Subject
              </label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange({ subject: e.target.value })}
                className="w-full bg-bgSurface border border-borderMuted text-textMain px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50"
              >
                <option value="All">All Subjects</option>
                {userSubjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
                {ALL_SUBJECTS.filter(s => !userSubjects.includes(s)).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-textDim text-xs font-semibold uppercase tracking-wider">
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange({ year: e.target.value })}
                className="w-full bg-bgSurface border border-borderMuted text-textMain px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50"
              >
                {VALID_YEARS.map(y => (
                  <option key={y} value={y}>{y === "All" ? "All Years" : y}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-textDim text-xs font-semibold uppercase tracking-wider">
                Topic
              </label>
              <select
                value={filters.topic}
                onChange={(e) => handleFilterChange({ topic: e.target.value })}
                disabled={filters.subject === "All"}
                className="w-full bg-bgSurface border border-borderMuted text-textMain px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50 disabled:opacity-50"
              >
                <option value="All">All Topics</option>
                {availableTopics.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-textDim text-xs font-semibold uppercase tracking-wider">
                Search
              </label>
              <div className="relative">
                <Search size={18} className="text-textDim absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  placeholder="Search..."
                  className="w-full bg-bgSurface border border-borderMuted text-textMain pl-12 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
                {filters.search && (
                  <button
                    onClick={() => handleFilterChange({ search: "" })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textDim hover:text-textMain"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="text-brand h-10 w-10 animate-spin mb-3" />
            <p className="text-textDim text-lg">Loading questions...</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && paginated.length === 0 && (
          <div className="bg-bgCard border border-borderMuted rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-textMain font-bold text-xl mb-2">
              No questions found
            </h3>
            <p className="text-textDim mb-6">
              Try adjusting your filters to find questions
            </p>
            <Button
              variant="secondary"
              onClick={() => handleFilterChange({
                subject: userSubjects[0] || "All",
                year: "All",
                topic: "All",
                difficulty: "All",
                search: "",
              })}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Questions List */}
        {!isLoading && paginated.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-textDim text-sm">
                Showing <span className="text-textMain font-semibold">{paginated.length}</span> of{" "}
                <span className="text-textMain font-semibold">{filteredQuestions.length}</span> questions
              </p>
            </div>

            <div className="space-y-4">
              {paginated.map((q, idx) => {
                const color = SUBJECT_COLORS[q.subject] || "#7B5FFF";
                const isExpanded = expandedId === q.id;
                const questionNum = (page - 1) * PAGE_SIZE + idx + 1;

                return (
                  <div
                    key={q.id}
                    className="bg-bgCard border border-borderMuted rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="w-full text-left p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {questionNum}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: `${color}20`, color }}
                            >
                              {q.subject}
                            </span>
                            <span className="text-textDim text-xs flex items-center gap-1">
                              <Calendar size={14} /> {q.year}
                            </span>
                            <span className="text-textDim text-xs flex items-center gap-1">
                              <Lightbulb size={14} /> {q.difficulty}
                            </span>
                          </div>
                          <p className="text-textMain font-medium leading-relaxed">
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
                      <div className="border-t border-borderMuted px-5 pb-5 pt-1">
                        {q.instruction && (
                          <div className="mb-4 p-4 bg-bgSurface rounded-xl">
                            <p className="text-textDim text-sm">
                              <span className="font-semibold text-textMain">Instruction: </span>
                              {q.instruction}
                            </p>
                          </div>
                        )}

                        <div className="space-y-2.5 mb-4">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-4 rounded-xl border flex items-center gap-3 ${
                                optIdx === q.answer
                                  ? "border-success/30 bg-success/5"
                                  : "border-borderMuted bg-bgSurface"
                              }`}
                            >
                              <span
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  optIdx === q.answer
                                    ? "bg-success text-white"
                                    : "bg-bgCard border border-borderMuted text-textDim"
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span
                                className={optIdx === q.answer ? "text-textMain font-semibold" : "text-textDim"}
                              >
                                {opt}
                              </span>
                              {optIdx === q.answer && (
                                <CheckCircle2 size={18} className="text-success ml-auto" />
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="bg-brand/5 border border-brand/10 p-4 rounded-xl">
                          <h5 className="font-semibold text-brand-light text-sm mb-1">
                            Explanation
                          </h5>
                          <p className="text-textMain text-sm">{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft size={16} /> Previous
                </Button>
                <p className="text-textDim text-sm">
                  Page <span className="text-textMain font-semibold">{page}</span> of{" "}
                  <span className="text-textMain font-semibold">{totalPages}</span>
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="flex items-center gap-2"
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default PastQuestions;
