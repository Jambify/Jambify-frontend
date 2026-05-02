// src/Pages/MockExam/MockExam.tsx (FIXED - removed unused SUBJECT_CONFIG)

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/Layout/AppLayout";
import { useMockStore } from "../../Store/useMockStore";
import { usePerformanceStore } from "../../Store/usePerformanceStore";
import { SAMPLE_QUESTIONS } from "../../Data/Question";
import OptionButton from "../../components/Quiz/OptionButton";
import MockResultsScreen from "../../components/MockExam/MockResultScreen";
import Button from "../../components/ui/Button";
import { cn } from "../../lib/utils";

const MOCK_DURATION = 7200; // 2 hours in seconds

const AVAILABLE_SUBJECTS = [
  { id: "English", name: "English" },
  { id: "Mathematics", name: "Mathematics" },
  { id: "Physics", name: "Physics" },
  { id: "Chemistry", name: "Chemistry" },
  { id: "Biology", name: "Biology" },
  { id: "Economics", name: "Economics" },
  { id: "Government", name: "Government" },
  { id: "Literature", name: "Literature" },
  { id: "History", name: "History" },
  { id: "Geography", name: "Geography" },
  { id: "CRS", name: "CRS" },
];

const AVAILABLE_YEARS = Array.from({ length: 11 }, (_, i) => (2016 + i).toString());

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://your-api.com";

// Function to fetch questions from API
const fetchQuestionsFromAPI = async (subject: string, year: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions?subject=${subject}&year=${year}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.questions || [];
  } catch (error) {
    console.error(`Failed to fetch ${subject} questions:`, error);
    return [];
  }
};

// Function to fetch all selected subjects' questions
const fetchAllQuestions = async (
  subjects: string[], 
  year: string
): Promise<Record<string, any[]>> => {
  const results: Record<string, any[]> = {};
  
  await Promise.all(
    subjects.map(async (subject) => {
      const questions = await fetchQuestionsFromAPI(subject, year);
      results[subject] = questions;
    })
  );
  
  return results;
};

// Calculate JAMB score (out of 400)
const calculateJambScore = (correctBySubject: Record<string, number>, totalQuestionsBySubject: Record<string, number>): number => {
  let totalCorrect = 0;
  let totalQuestions = 0;
  
  Object.keys(correctBySubject).forEach((subject) => {
    totalCorrect += correctBySubject[subject];
    totalQuestions += totalQuestionsBySubject[subject];
  });
  
  return Math.round((totalCorrect / totalQuestions) * 400);
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const MockExam: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { addQuizResult } = usePerformanceStore();
  const {
    isStarted,
    isFinished,
    questions,
    currentIndex,
    answers,
    timeLeft,
    startExam,
    submitAnswer,
    nextQuestion,
    prevQuestion,
    finishExam,
    resetExam,
    tickTimer,
  } = useMockStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [jumpTo, setJumpTo] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCombination, setSelectedCombination] = useState<string[]>([
    "English",
    "",
    "",
    "",
  ]);
  const [useApi, setUseApi] = useState(false);
  const [activeSubject, setActiveSubject] = useState("English");

  useEffect(() => {
    if (!isStarted || isFinished) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => tickTimer(), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStarted, isFinished, tickTimer]);

  useEffect(() => {
    if (isStarted && !isFinished && timeLeft === 0) {
      handleFinishExam();
    }
  }, [timeLeft, isStarted, isFinished]);

  useEffect(() => {
    if (isStarted && questions[currentIndex]) {
      setActiveSubject(questions[currentIndex].subject);
    }
  }, [currentIndex, isStarted, questions]);

  const handleFinishExam = async () => {
    setIsSubmitting(true);
    
    try {
      const timeTakenSeconds = MOCK_DURATION - timeLeft;
      
      const correctBySubject: Record<string, number> = {};
      const totalBySubject: Record<string, number> = {};
      
      questions.forEach((q, idx) => {
        if (!totalBySubject[q.subject]) {
          totalBySubject[q.subject] = 0;
          correctBySubject[q.subject] = 0;
        }
        totalBySubject[q.subject]++;
        if (answers[idx] === q.answer) {
          correctBySubject[q.subject]++;
        }
      });
      
      const jambScore = calculateJambScore(correctBySubject, totalBySubject);
      
      const subjectResults = new Map<string, { 
        questionIds: string[]; 
        answers: Record<number, number>;
        startIndex: number;
      }>();
      
      questions.forEach((q, idx) => {
        if (!subjectResults.has(q.subject)) {
          subjectResults.set(q.subject, {
            questionIds: [],
            answers: {},
            startIndex: idx,
          });
        }
        const subjectData = subjectResults.get(q.subject)!;
        subjectData.questionIds.push(q.id);
        if (answers[idx] !== undefined) {
          const answerIndex = idx - subjectData.startIndex;
          subjectData.answers[answerIndex] = answers[idx];
        }
      });
      
      console.log("🔵 JAMB Score Calculation:", { correctBySubject, totalBySubject, jambScore });
      
      for (const [subject, data] of subjectResults) {
        if (Object.keys(data.answers).length > 0) {
          try {
            await addQuizResult('mock', subject, data.questionIds, data.answers, timeTakenSeconds);
          } catch (err) {
            console.error(`❌ Failed to submit ${subject}:`, err);
          }
        }
      }
      
    } catch (error) {
      console.error('Failed to submit mock exam results:', error);
    } finally {
      setIsSubmitting(false);
      finishExam();
    }
  };

  const handleStart = async () => {
    setErrorMessage(null);
    setIsLoadingQuestions(true);
    
    try {
      let allQuestions: any[] = [];
      
      if (useApi) {
        const questionsBySubject = await fetchAllQuestions(selectedCombination, selectedYear);
        
        for (const subject of selectedCombination) {
          const subjectQuestions = questionsBySubject[subject] || [];
          if (subjectQuestions.length === 0) {
            setErrorMessage(`No questions found for ${subject} in ${selectedYear}. Using sample data.`);
            const sampleFiltered = SAMPLE_QUESTIONS.filter((q) => q.subject === subject);
            allQuestions.push(...sampleFiltered);
          } else {
            allQuestions.push(...subjectQuestions);
          }
        }
      } else {
        const filtered = SAMPLE_QUESTIONS.filter((q) =>
          selectedCombination.includes(q.subject) && String(q.year) === selectedYear
        );
        
        if (filtered.length === 0) {
          setErrorMessage(`Questions for the year ${selectedYear} are currently being uploaded.`);
          setIsLoadingQuestions(false);
          return;
        }
        allQuestions = filtered;
      }
      
      const finalOrderedQuestions = selectedCombination.flatMap((sub) => {
        const subjectQuestions = allQuestions.filter((q) => q.subject === sub);
        return shuffleArray(subjectQuestions).map((q) => {
          const correctOptionText = q.options[q.answer];
          const shuffledOptions = shuffleArray(q.options);
          const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);
          return { ...q, options: shuffledOptions, answer: newCorrectIndex };
        });
      });
      
      startExam(finalOrderedQuestions, MOCK_DURATION);
      setActiveSubject(selectedCombination[0]);
      
    } catch (error) {
      console.error('Error starting exam:', error);
      setErrorMessage('Failed to load questions. Please try again.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const updateSubject = (index: number, value: string) => {
    setErrorMessage(null);
    const newComb = [...selectedCombination];
    newComb[index] = value;
    setSelectedCombination(newComb);
  };

  if (isFinished) {
    return (
      <AppLayout
        currentPage="mock"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <MockResultsScreen
          onRetry={handleStart}
          onHome={() => {
            resetExam();
            navigate("/");
          }}
        />
      </AppLayout>
    );
  }

  if (isStarted && questions[currentIndex]) {
    const q = questions[currentIndex];
    const chosen = answers[currentIndex] ?? -1;
    const answeredCount = Object.keys(answers).length;

    const examSubjects = Array.from(
      new Set(questions.map((quest) => quest.subject)),
    );
    const subjectQuestions = questions.filter(
      (quest) => quest.subject === activeSubject,
    );

    return (
      <AppLayout
        currentPage="mock"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "font-mono text-lg font-bold tabular-nums px-3 py-1.5 rounded-brand border",
                timeLeft <= 120
                  ? "text-danger border-danger/30 bg-danger/10"
                  : "text-textMain border-borderMuted bg-bgSurface",
              )}
            >
              ⏱ {formatTime(timeLeft)}
            </div>
            <span className="text-xs text-textDim">
              {answeredCount} / {questions.length} total
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={jumpTo}
              onChange={(e) => setJumpTo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const n = parseInt(jumpTo) - 1;
                  if (n >= 0 && n < questions.length) nextQuestion(n);
                  setJumpTo("");
                }
              }}
              placeholder="Jump to..."
              className="w-24 px-2.5 py-1.5 bg-bgSurface border border-borderMuted rounded-brand text-xs focus:outline-none"
            />
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowConfirmExit(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Finish"}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide momentum-scroll">
          {examSubjects.map((sub) => (
            <button
              key={sub}
              onClick={() => {
                setActiveSubject(sub);
                const firstIdx = questions.findIndex(
                  (quest) => quest.subject === sub,
                );
                if (firstIdx !== -1) nextQuestion(firstIdx);
              }}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border touch-target no-double-tap",
                activeSubject === sub
                  ? "bg-brand text-white border-brand"
                  : "bg-bgSurface text-textDim border-borderMuted hover:border-brand/50",
              )}
              aria-label={`Select ${sub} subject`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-1.5 pb-2 min-w-max">
            {subjectQuestions.map((quest, i) => {
              const globalIdx = questions.findIndex((g) => g.id === quest.id);
              return (
                <button
                  key={quest.id}
                  onClick={() => nextQuestion(globalIdx)}
                  className={cn(
                    "w-8 h-8 rounded-md text-xs font-mono transition-all shrink-0 border touch-target no-double-tap",
                    globalIdx === currentIndex
                      ? "bg-brand text-white border-brand shadow-lg scale-110 z-10"
                      : answers[globalIdx] !== undefined &&
                        answers[globalIdx] !== -1
                        ? "bg-success/10 text-success border-success/30"
                        : "bg-bgSurface text-textDim border-borderMuted",
                  )}
                  aria-label={`Go to question ${i + 1}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded bg-brand/10 text-brand">
              {q.subject} ({q.year})
            </span>
            <span className="text-[10px] font-mono text-textDim">
              Question {subjectQuestions.findIndex((sq) => sq.id === q.id) + 1}{" "}
              of {subjectQuestions.length}
            </span>
          </div>

          <p className="text-base sm:text-lg text-textMain mb-6 sm:mb-8 leading-relaxed wrap-break-word select-text">
            {q.text}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, i) => (
              <OptionButton
                key={`${currentIndex}-${i}`}
                index={i}
                text={opt}
                chosen={chosen}
                correct={-1}
                answered={false}
                onSelect={() => submitAnswer(currentIndex, i)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            size="md"
            disabled={currentIndex === 0}
            onClick={() => prevQuestion()}
            className="touch-target no-double-tap"
            aria-label="Previous question"
          >
            Previous
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              if (currentIndex === questions.length - 1) {
                setShowConfirmExit(true);
              } else {
                nextQuestion(currentIndex + 1);
              }
            }}
            className="touch-target no-double-tap"
            aria-label={currentIndex === questions.length - 1 ? "Finish exam" : "Next question"}
          >
            {currentIndex === questions.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>

        {showConfirmExit && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-2">Submit Exam?</h3>
              <p className="text-sm text-textMuted mb-6">
                You've answered {answeredCount} out of {questions.length}{" "}
                questions. You cannot change your answers after submitting.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setShowConfirmExit(false)}
                >
                  Review
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleFinishExam}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Yes, Submit"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout
      currentPage="mock"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold mb-2">CBT Mock Exam</h2>
          <p className="text-textDim text-sm mb-8">
            Select your year and 4 subjects to begin.
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <label className="flex items-center gap-2 text-xs text-textDim">
              <input
                type="checkbox"
                checked={useApi}
                onChange={(e) => setUseApi(e.target.checked)}
                className="w-4 h-4 rounded border-borderMuted bg-bgSurface text-brand focus:ring-brand"
              />
              Use API for questions
            </label>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3 bg-danger/10 border border-danger/20 text-danger text-xs rounded-brand animate-in fade-in slide-in-from-top-1">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="flex flex-col text-left mb-6">
            <label className="text-[10px] font-bold uppercase text-brand mb-1">
              Examination Year
            </label>
            <select
              className="bg-bgSurface border border-borderMuted p-3 rounded-brand text-sm text-textMain focus:border-brand outline-none"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setErrorMessage(null);
              }}
            >
              {AVAILABLE_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-brand mb-1">
                Subject 1
              </label>
              <div className="bg-bgSurface border border-borderMuted p-3 rounded-brand text-sm text-textMain">
                English
              </div>
            </div>
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex flex-col">
                <label className="text-[10px] font-bold uppercase text-textDim mb-1">
                  Subject {idx + 1}
                </label>
                <select
                  className="bg-bgSurface border border-borderMuted p-3 rounded-brand text-sm text-textMain focus:border-brand outline-none"
                  value={selectedCombination[idx]}
                  onChange={(e) => updateSubject(idx, e.target.value)}
                >
                  <option value="">Select</option>
                  {AVAILABLE_SUBJECTS.map((sub) => (
                    <option
                      key={sub.id}
                      value={sub.id}
                      disabled={selectedCombination.includes(sub.id) || sub.id === "English"}
                    >
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={selectedCombination.some((s) => s === "") || isLoadingQuestions}
            onClick={handleStart}
          >
            {isLoadingQuestions ? "Loading Questions..." : "Start Mock Exam"}
          </Button>
        </div>

        <div className="space-y-8 py-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand mb-4">
              Exam Guidelines
            </h3>
            <ul className="space-y-3 text-sm text-textMain">
              <li className="flex gap-3">
                <span>•</span> English: <strong>60 questions</strong>
              </li>
              <li className="flex gap-3">
                <span>•</span> Each other subject: <strong>40 questions</strong>
              </li>
              <li className="flex gap-3">
                <span>•</span> Total: <strong>220 questions</strong>
              </li>
              <li className="flex gap-3">
                <span>•</span> Time: <strong>2 hours (120 minutes)</strong>
              </li>
              <li className="flex gap-3">
                <span>•</span> Score calculation: <strong>(Correct/Total) × 400</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MockExam;