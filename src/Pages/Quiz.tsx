import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import { useQuizStore } from '../Store/useQuizStore';
import { SAMPLE_QUESTIONS } from '../Data/Question';
import QuestionCard from '../components/Quiz/QuestionCard';
import TimerBar from '../components/Quiz/TimeBar';
import ResultsScreen from '../components/Quiz/ResultScreen';
import Button from '../components/ui/Button';

/** Subject filter options shown on the quiz start screen */
const SUBJECTS = ['All', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const {
    questions, currentIndex, isFinished, isStarted,
    selectedSubject, setSelectedSubject,
    loadQuestions, reset,
  } = useQuizStore();

  /** Clean up when leaving the page */
  useEffect(() => () => { reset(); }, []);

  const handleStart = () => {
    const filtered = selectedSubject === 'All'
      ? SAMPLE_QUESTIONS
      : SAMPLE_QUESTIONS.filter(q => q.subject === selectedSubject);
    loadQuestions(filtered.slice(0, 10));
  };

  /* ── Results ───────────────────────────────────────── */
  if (isFinished) {
    return (
      <AppLayout currentPage="quiz">
        <ResultsScreen onRetry={handleStart} onHome={() => navigate('/')} />
      </AppLayout>
    );
  }

  /* ── Active quiz ───────────────────────────────────── */
  if (isStarted && questions.length > 0) {
    return (
      <AppLayout currentPage="quiz">
        {/* <Progress header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-textMuted hover:text-textMain transition-colors flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span className="hidden sm:inline">Exit</span>
          </button>

          {/* <Dot progress — mobile friendly */}
          <div className="flex items-center gap-1 flex-1 justify-center">
            {questions.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width:  i === currentIndex ? '20px' : '6px',
                  height: '6px',
                  background: i < currentIndex
                    ? 'var(--color-success, #00C896)'
                    : i === currentIndex
                      ? '#7B5FFF'
                      : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>

          <span className="text-xs font-mono text-textDim flex-shrink-0">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <TimerBar />
        <QuestionCard />
      </AppLayout>
    );
  }

  /* ── Start screen ──────────────────────────────────── */
  return (
    <AppLayout currentPage="quiz">
      <div className="max-w-2xl mx-auto">

        {/* <Hero */}
        <div className="text-center mb-10 pt-4">
          <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            📝
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Practice Quiz
          </h2>
          <p className="text-sm text-textMuted max-w-sm mx-auto">
            10 adaptive questions · 90 seconds each · Instant explanations
          </p>
        </div>

       {/*  <{/* Subject filter */} 
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-widest text-textDim font-medium mb-3">
            Choose subject
          </p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  selectedSubject === s
                    ? 'bg-brand border-brand text-indigo shadow-lg shadow-brand/30'
                    : 'bg-bgSurface border-borderMuted text-textMuted hover:border-white/20 hover:text-textMain'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* <Mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            { icon: '⚡', label: 'Quick Fire',  desc: '10 Qs · 60s each',  active: true  },
            { icon: '🎯', label: 'Standard',    desc: '20 Qs · 90s each',  active: false },
            { icon: '🏆', label: 'Mock Exam',   desc: '180 Qs · 2 hours', active: false },
          ].map((mode) => (
            <div
              key={mode.label}
              className={`p-4 rounded-brand-lg border cursor-pointer transition-all ${
                mode.active
                  ? 'bg-brand/10 border-brand/40 ring-1 ring-brand/20'
                  : 'bg-bgSurface border-borderMuted hover:border-white/15 opacity-60'
              }`}
            >
              <div className="text-2xl mb-2">{mode.icon}</div>
              <p className="font-display font-semibold text-sm tracking-tight">{mode.label}</p>
              <p className="text-[11px] text-textDim mt-0.5">{mode.desc}</p>
              {!mode.active && <p className="text-[10px] text-brand-light mt-1.5">Coming soon</p>}
            </div>
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleStart}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          }
        >
          Start Quiz
        </Button>
      </div>
    </AppLayout>
  );
};

export default Quiz;