import { useQuizStore }        from '../Store/useQuizStore';
import { useUserStore }        from '../Store/UseUserStore';
import { useSubjectStore }     from '../Store/useSubjectStore';
import { usePerformanceStore } from '../Store/usePerformanceStore';
import type { Question }         from '../Types';

/**
 * useQuizSession
 * ─────────────
 * Call commitSession() once when the quiz finishes.
 * It reads the completed quiz state and fans out updates
 * to every relevant store in one atomic sequence.
 *
 * Called from: ResultsScreen (practice quiz)
 * NOT called from: MockResultsScreen — mock has its own commit
 */
export function useQuizSession() {
  const { questions, answers, timeLeft, quizDuration, selectedSubject } = useQuizStore();
  const { isAuthenticated } = useUserStore();
  const { incrementScore,
          incrementQuestions,
          updateAccuracy }              = useUserStore();
  const { updateAccuracy: updateSubj,
          incrementCompleted }          = useSubjectStore();
  const { addActivity, updateTopic, addQuizResult } = usePerformanceStore();

  const commitSession = async () => {
    if (questions.length === 0) return;

    /* ── 1. Score totals ─────────────────────────────── */
    const correct = questions.filter((q, i) => answers[i] === q.answer).length;
    const total   = questions.length;
    const newAcc  = Math.round((correct / total) * 100);
    const timeTaken = quizDuration - timeLeft;

    /* ── 2. Save to Database if Authenticated ────────── */
    if (isAuthenticated) {
      try {
        await addQuizResult(
          "practice",
          selectedSubject,
          questions.map((q) => q.id),
          answers,
          timeTaken,
          correct,
          total
        );
      } catch (err) {
        console.error("Failed to save quiz results to DB:", err);
      }
    }

    /* ── 3. Per-subject breakdown ────────────────────── */
    type SubMap = Record<string, { correct: number; total: number; id: string }>;
    const subjMap: SubMap = {};

    questions.forEach((q: Question, i) => {
      if (!subjMap[q.subject]) subjMap[q.subject] = { correct: 0, total: 0, id: q.subject.toLowerCase().slice(0, 4) };
      subjMap[q.subject].total++;
      if (answers[i] === q.answer) subjMap[q.subject].correct++;
    });

    /* ── 3. Update useSubjectStore ───────────────────── */
    Object.entries(subjMap).forEach(([, data]) => {
      const acc = Math.round((data.correct / data.total) * 100);
      updateSubj(data.id, acc);
      incrementCompleted(data.id, data.total);
    });

    /* ── 4. Update useUserStore ──────────────────────── */
    incrementScore(correct);
    incrementQuestions(total);
    updateAccuracy(newAcc);

    /* ── 5. Update usePerformanceStore ───────────────── */
    const today = new Date()
      .toLocaleDateString('en-GB', { weekday: 'short' })
      .slice(0, 3); // "Mon" | "Tue" etc.
    addActivity(today, total);

    /* ── 6. Update weak topics per question ──────────── */
    const topicAccMap: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q: Question, i) => {
      const key = `${q.subject}::${q.topic}`;
      if (!topicAccMap[key]) topicAccMap[key] = { correct: 0, total: 0 };
      topicAccMap[key].total++;
      if (answers[i] === q.answer) topicAccMap[key].correct++;
    });

    Object.entries(topicAccMap).forEach(([key, data]) => {
      const [, topic] = key.split('::');
      const acc = Math.round((data.correct / data.total) * 100);
      // Find the topic by name and update it
      const store = usePerformanceStore.getState();
      const match = store.topicStats.find(t => t.name === topic);
      if (match) updateTopic(match.id, acc);
    });
  };

  return { commitSession };
}