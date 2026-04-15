import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import { useMockStore } from '../Store/useMockStore';
import { SAMPLE_QUESTIONS } from '../Data/Question';
import OptionButton from '../components/Quiz/OptionButton';
import MockResultsScreen from '../components/MockExam/MockResultScreen';
// Removed MockAttemptCard import as it was flagged as unused
import Button from '../components/ui/Button';
import { cn } from '../lib/utils';

const MOCK_DURATION = 7200;

const AVAILABLE_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Literature in English",
  "History",
  "Geography",
  "Government",
  "Economics",
  "Christian Religious Studies (CRS)"
];

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
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const MockExam: React.FC = () => {
  const navigate = useNavigate();
  const {
    isStarted, isFinished, questions, currentIndex,
    answers, timeLeft, // Removed 'attempts' from destructuring
    startExam, submitAnswer, nextQuestion,
    prevQuestion, finishExam, resetExam, tickTimer,
  } = useMockStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [jumpTo, setJumpTo] = useState('');
  const [selectedCombination, setSelectedCombination] = useState<string[]>(['English', '', '', '']);

  useEffect(() => {
    if (!isStarted || isFinished) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => tickTimer(), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isStarted, isFinished, tickTimer]);

  useEffect(() => {
    if (isStarted && !isFinished && timeLeft === 0) finishExam();
  }, [timeLeft, isStarted, isFinished, finishExam]);

  const handleStart = () => {
    const filtered = SAMPLE_QUESTIONS.filter(q => 
      selectedCombination.includes(q.subject)
    );

    if (filtered.length === 0) {
      alert("No questions found for this combination.");
      return;
    }

    const shuffledData = shuffleArray(filtered).map(q => {
      const correctOptionText = q.options[q.answer];
      const shuffledOptions = shuffleArray(q.options);
      const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);

      return {
        ...q,
        options: shuffledOptions,
        answer: newCorrectIndex 
      };
    });

    startExam(shuffledData, MOCK_DURATION);
  };

  const updateSubject = (index: number, value: string) => {
    const newComb = [...selectedCombination];
    newComb[index] = value;
    setSelectedCombination(newComb);
  };

  const q = questions[currentIndex];
  const chosen = answers[currentIndex] ?? -1;
  const answered = Object.keys(answers).length;
  const isWarnTime = timeLeft <= 600;
  const isDangTime = timeLeft <= 120;

  if (isFinished) {
    return (
      <AppLayout currentPage="mock">
        <MockResultsScreen
          onRetry={handleStart}
          onHome={() => { resetExam(); navigate('/'); }}
        />
      </AppLayout>
    );
  }

  if (isStarted && q) {
    return (
      <AppLayout currentPage="mock">
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={cn(
              'font-mono text-lg font-bold tabular-nums px-3 py-1.5 rounded-brand border transition-colors',
              isDangTime ? 'text-danger border-danger/30 bg-danger/10'
                : isWarnTime ? 'text-warn border-warn/30 bg-warn/10'
                : 'text-textMain border-borderMuted bg-bgSurface',
            )}>
              ⏱ {formatTime(timeLeft)}
            </div>
            <span className="text-xs text-textDim">{answered} / {questions.length} answered</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={jumpTo}
              onChange={(e) => setJumpTo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const n = parseInt(jumpTo) - 1;
                  if (n >= 0 && n < questions.length) nextQuestion(n);
                  setJumpTo('');
                }
              }}
              placeholder="Go to #"
              className="w-20 px-2.5 py-1.5 bg-bgSurface border border-borderMuted rounded-brand text-xs focus:outline-none"
            />
            <Button variant="danger" size="sm" onClick={() => setShowConfirmExit(true)}>Submit</Button>
          </div>
        </div>

        <div className="mb-4 overflow-x-auto">
          <div className="flex gap-1 pb-1 min-w-max">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => nextQuestion(i)}
                className={cn(
                  'w-7 h-7 rounded text-[10px] font-mono transition-all shrink-0',
                  i === currentIndex ? 'bg-brand text-white'
                  : (answers[i] !== undefined && answers[i] !== -1) ? 'bg-success/20 text-success border border-success/30'
                  : 'bg-bgSurface text-textDim border border-borderMuted',
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-6 mb-4 animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-brand/10 text-brand-light">{q.subject}</span>
            <span className="text-[11px] font-mono text-textDim">JAMB {q.year}</span>
          </div>
          <p className="text-base sm:text-lg text-textMain mb-6">{q.text}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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

        <div className="flex items-center justify-between gap-3">
          <Button variant="secondary" size="md" disabled={currentIndex === 0} onClick={() => prevQuestion()}>Previous</Button>
          <Button variant="primary" size="md" onClick={() => currentIndex === questions.length - 1 ? setShowConfirmExit(true) : nextQuestion(currentIndex + 1)}>
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>

        {showConfirmExit && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-6 max-w-sm w-full animate-fadeIn">
              <h3 className="font-display text-lg font-bold mb-2">Submit exam?</h3>
              <p className="text-sm text-textMuted mb-4">You have answered {answered} of {questions.length} questions.</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="md" fullWidth onClick={() => setShowConfirmExit(false)}>Cancel</Button>
                <Button variant="primary" size="md" fullWidth onClick={() => { finishExam(); setShowConfirmExit(false); }}>Submit</Button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPage="mock">
      <div className="max-w-2xl mx-auto">
        <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-7 mb-6 text-center">
          <h2 className="font-display text-2xl font-bold mb-6">Setup Mock Exam</h2>
          <div className="grid grid-cols-2 gap-3 mb-8 max-w-md mx-auto">
            <div className="flex flex-col text-left">
              <label className="text-[10px] uppercase text-textDim mb-1 font-bold">Subject 1</label>
              <div className="bg-bgSurface border border-borderMuted p-2.5 rounded-brand text-sm text-textMain opacity-70">English</div>
            </div>
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex flex-col text-left">
                <label className="text-[10px] uppercase text-textDim mb-1 font-bold">Subject {idx + 1}</label>
                <select 
                  className="bg-bgSurface border border-borderMuted p-2.5 rounded-brand text-sm text-textMain"
                  value={selectedCombination[idx]}
                  onChange={(e) => updateSubject(idx, e.target.value)}
                >
                  <option value="">Select</option>
                  {AVAILABLE_SUBJECTS.map(sub => (
                    <option key={sub} value={sub} disabled={selectedCombination.includes(sub)}>{sub}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <Button variant="primary" size="lg" fullWidth disabled={selectedCombination.some(s => s === '')} onClick={handleStart}>
            Start Exam
          </Button>
        </div>
        {/* Past attempts section removed because it relied on unused 'attempts' and 'MockAttemptCard' */}
      </div>
    </AppLayout>
  );
};

export default MockExam;