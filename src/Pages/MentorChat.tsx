/**
 * src/Pages/MentorChat.tsx
 * ────────────────────────
 * Full AI mentor chat page.
 *
 * Layout (desktop): left context panel | center chat | right suggestions
 * Layout (mobile):  stacked — context strip → chat → input
 */

import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { useUserStore } from '../Store/useUserStore';
import { useSubjectStore } from '../Store/useSubjectStore';
import { useAIChat, type ChatMessage } from '../hooks/useAIChat';
import { cn } from '../lib/utils/utils';
import {
  Send, Sparkles, Trash2, ChevronDown,
  BookOpen, Target, Zap, Brain,
  AlertTriangle, Calendar, Trophy,
} from 'lucide-react';

// ── Mentor system prompt ──────────────────────────────────────────────────────
const MENTOR_SYSTEM = `You are JAMBIFY AI, a friendly and expert JAMB exam preparation mentor for Nigerian students.
You know the student's profile and weak subjects (provided in context).
Be encouraging, specific, and always relate advice back to JAMB preparation.
Keep responses concise (under 250 words) unless a detailed explanation is needed.
Use bullet points and numbered steps for clarity. Reference Nigerian context where helpful.`;

// ── Starter prompts (shown when chat is empty) ────────────────────────────────
const BASE_STARTERS = [
  { icon: '📅', label: 'Make me a study plan',       prompt: 'Create a personalized 2-week study plan for me based on my weak subjects and exam date.' },
  { icon: '⏱️', label: 'Time management tips',       prompt: 'Give me practical time management tips for the JAMB exam. How should I allocate time per question?' },
  { icon: '🎯', label: 'How to hit my target score', prompt: 'What specific steps do I need to take to reach my target score? Be very specific.' },
  { icon: '📝', label: 'Common JAMB mistakes',       prompt: 'What are the most common mistakes students make in JAMB and how do I avoid them?' },
];

// ── Typing indicator ──────────────────────────────────────────────────────────
const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 rounded-full bg-brand/60"
        style={{
          animation:      'bounce 1.2s infinite',
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
    <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40%            { transform: translateY(-6px); opacity: 1; }
      }
    `}</style>
  </div>
);

// ── Single message bubble ─────────────────────────────────────────────────────
const MessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isUser = msg.role === 'user';

  return (
    <div className={cn('flex gap-2.5 max-w-[88%]', isUser ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-light" />
        </div>
      )}

      <div
        className={cn(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-brand text-white rounded-tr-sm'
            : 'bg-bgSurface border border-borderMuted text-textMain rounded-tl-sm',
          msg.isStreaming && 'after:content-["▋"] after:animate-pulse after:text-brand after:ml-0.5',
        )}
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {msg.content || (msg.isStreaming ? '' : '…')}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const MentorChat: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showContext, setShowContext] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    name,
    targetScore,
    examDate,
    examYear,
    questionsCompleted,
  } = useUserStore();
  const { subjects, loadSubjects, isInitialized } = useSubjectStore();

  useEffect(() => {
    if (!isInitialized) loadSubjects();
  }, [isInitialized, loadSubjects]);

  const weakSubjects = subjects
    .filter((s) => s.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  // Build personalized system prompt with user context
  const systemPrompt = `${MENTOR_SYSTEM}

Student profile:
- Name: ${name || "Student"}
- Target score: ${targetScore || "Not set"}
- Exam: JAMB ${examYear} (${examDate})
- Questions completed: ${questionsCompleted}
- Weak subjects: ${
    weakSubjects.length > 0
      ? weakSubjects
          .map((s) => `${s.name} (${s.accuracy}% accuracy)`)
          .join(", ")
      : "None identified yet"
  }`;

  const {
    messages,
    isLoading,
    sendMessage,
    clearHistory,
    isNearLimit,
    isAtLimit,
    messagesRemaining,
  } = useAIChat({
    systemPrompt,
    storageKey: `jambify-mentor-${name || "guest"}`,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Build personalized starters based on weak subjects
  const starters = [
    ...BASE_STARTERS,
    ...weakSubjects.slice(0, 2).map((s) => ({
      icon: s.icon,
      label: `Help with ${s.name}`,
      prompt: `I'm struggling with ${s.name} — my accuracy is only ${s.accuracy}%. What are the most important topics to focus on and how should I study them for JAMB?`,
    })),
  ];

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <AppLayout
      currentPage="mentor"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      {/*
        Escape the AppLayout's p-4 lg:p-7 padding so we can fill the
        full available height. We use -mx and -mt to pull back to the
        padding edge, then add px/pt back on the inner container.
        Height = viewport - topbar(56px) - bottom padding(28px) = calc(100vh - 84px)
      */}
      <div
        className="flex gap-3 -mx-4 lg:-mx-7 -mt-4 lg:-mt-7 px-4 lg:px-7 pt-4 lg:pt-7 overflow-hidden"
        style={{ height: 'calc(100vh - 56px - 1.75rem)' }}
      >

        {/* ── Left: Context panel (desktop only) ─────────────────── */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 gap-3 h-full overflow-y-auto no-scrollbar">

          {/* AI badge */}
          <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-brand/15 border border-brand/25 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-light" />
              </div>
              <div>
                <p className="text-sm font-semibold text-textMain">JAMBIFY AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] text-success font-medium">Online</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-textDim leading-relaxed">
              Your personal JAMB tutor. Ask anything about your subjects, exam strategy, or study plans.
            </p>
          </div>

          {/* Profile snapshot */}
          <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-4 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-textDim mb-3">Your Profile</p>
            <div className="flex items-center gap-2 text-xs text-textMuted">
              <Calendar className="w-3.5 h-3.5 text-brand shrink-0" />
              <span>JAMB {examYear} · {examDate}</span>
            </div>
            {targetScore && (
              <div className="flex items-center gap-2 text-xs text-textMuted">
                <Trophy className="w-3.5 h-3.5 text-warn shrink-0" />
                <span>Target: {targetScore}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-textMuted">
              <BookOpen className="w-3.5 h-3.5 text-success shrink-0" />
              <span>{questionsCompleted} questions done</span>
            </div>
          </div>

          {/* Weak subjects */}
          {weakSubjects.length > 0 && (
            <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-textDim mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-warn" /> Needs Work
              </p>
              <div className="space-y-2">
                {weakSubjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      const p = `I need help with ${s.name}. My accuracy is ${s.accuracy}%. Can you explain the key concepts I should focus on?`;
                      sendMessage(p);
                    }}
                    className="w-full flex items-center gap-2 text-left hover:bg-bgSurface rounded-brand px-2 py-1.5 transition-colors group"
                  >
                    <span className="text-sm">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-textMain truncate">{s.name}</p>
                      <p className="text-[10px] text-danger">{s.accuracy}% accuracy</p>
                    </div>
                    <Zap className="w-3 h-3 text-brand opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear history */}
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-3 py-2 text-xs text-textDim hover:text-danger border border-borderMuted hover:border-danger/30 rounded-brand transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear conversation
            </button>
          )}
        </aside>

        {/* ── Center: Chat window ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-bgCard border border-borderMuted rounded-brand-lg overflow-hidden min-w-0 h-full">

          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-borderMuted shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand/15 border border-brand/25 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-light" />
              </div>
              <div>
                <p className="text-sm font-semibold text-textMain">JAMBIFY AI Mentor</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] text-success">Always available</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile: context toggle */}
              <button
                onClick={() => setShowContext(!showContext)}
                className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 bg-bgSurface border border-borderMuted rounded-brand text-xs text-textDim hover:text-textMain transition-colors"
              >
                <Brain className="w-3.5 h-3.5" />
                Context
                <ChevronDown className={cn('w-3 h-3 transition-transform', showContext && 'rotate-180')} />
              </button>

              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="p-1.5 text-textDim hover:text-danger rounded-brand hover:bg-danger/10 transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile context strip */}
          {showContext && (
            <div className="lg:hidden px-4 py-3 bg-bgSurface border-b border-borderMuted flex flex-wrap gap-3 text-xs text-textMuted">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> JAMB {examYear}</span>
              {targetScore && <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> Target: {targetScore}</span>}
              {weakSubjects.length > 0 && (
                <span className="flex items-center gap-1 text-warn">
                  <AlertTriangle className="w-3 h-3" />
                  Weak: {weakSubjects.map((s) => s.name).join(', ')}
                </span>
              )}
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">

            {/* Empty state — greeting + starters */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-8">
                <div className="w-16 h-16 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-brand-light" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-textMain mb-1">
                    Hi {name || 'there'} 👋
                  </h2>
                  <p className="text-sm text-textDim max-w-xs leading-relaxed">
                    {weakSubjects.length > 0
                      ? `I've reviewed your progress. You need work on ${weakSubjects[0].name}. What would you like to focus on?`
                      : "I'm your personal JAMB tutor. Ask me anything about your subjects or exam strategy."}
                  </p>
                </div>

                {/* Starter prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  {starters.slice(0, 4).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s.prompt)}
                      className="flex items-center gap-2.5 px-3 py-2.5 bg-bgSurface border border-borderMuted rounded-brand hover:border-brand/40 hover:bg-brand/5 transition-all text-left group"
                    >
                      <span className="text-base shrink-0">{s.icon}</span>
                      <span className="text-xs font-medium text-textMuted group-hover:text-textMain transition-colors">
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {/* Typing indicator */}
            {isLoading && messages[messages.length - 1]?.role !== 'ai' && (
              <div className="flex gap-2.5 mr-auto">
                <div className="w-7 h-7 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-brand-light" />
                </div>
                <div className="bg-bgSurface border border-borderMuted rounded-2xl rounded-tl-sm">
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </div>

          {/* Suggested follow-ups (shown after AI responds) */}
          {!isEmpty && !isLoading && !isAtLimit && messages[messages.length - 1]?.role === 'ai' && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
              {['Give me an example', 'Simplify that', 'Quiz me on this', 'What else should I know?'].map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="shrink-0 px-3 py-1.5 bg-bgSurface border border-borderMuted rounded-full text-xs text-textDim hover:text-textMain hover:border-brand/40 transition-all whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Near-limit warning */}
          {isNearLimit && !isAtLimit && (
            <div className="mx-4 mb-2 px-3 py-2 bg-warn/10 border border-warn/20 rounded-brand flex items-center justify-between gap-2 shrink-0">
              <p className="text-[11px] text-warn">
                {messagesRemaining} message{messagesRemaining !== 1 ? 's' : ''} left in this session
              </p>
              <button onClick={clearHistory} className="text-[11px] text-warn font-semibold hover:underline shrink-0">
                Start new
              </button>
            </div>
          )}

          {/* At-limit banner */}
          {isAtLimit && (
            <div className="mx-4 mb-2 px-3 py-3 bg-danger/10 border border-danger/20 rounded-brand flex items-center justify-between gap-2 shrink-0">
              <p className="text-[11px] text-danger leading-snug">
                Session limit reached. Start a new conversation to continue.
              </p>
              <button
                onClick={clearHistory}
                className="shrink-0 px-3 py-1.5 bg-danger text-white text-[11px] font-semibold rounded-brand hover:bg-danger/90 transition-colors"
              >
                New chat
              </button>
            </div>
          )}

          {/* Input bar */}
          <div className="px-4 pb-4 pt-2 shrink-0 border-t border-borderMuted">
            <div className={cn(
              "flex items-end gap-2 bg-bgSurface border rounded-brand-lg p-2 transition-colors",
              isAtLimit ? "border-danger/30 opacity-60" : "border-borderMuted focus-within:border-brand"
            )}>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-grow
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder={isAtLimit ? "Session limit reached — start a new chat" : "Ask anything about JAMB…"}
                disabled={isLoading || isAtLimit}
                className="flex-1 bg-transparent border-none text-sm px-2 py-1.5 focus:ring-0 resize-none no-scrollbar placeholder:text-textDim text-textMain min-h-9 max-h-30 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isAtLimit}
                className={cn(
                  'p-2 rounded-brand transition-all shrink-0',
                  input.trim() && !isLoading && !isAtLimit
                    ? 'bg-brand text-white hover:bg-brand-light shadow-md shadow-brand/20 active:scale-95'
                    : 'bg-borderMuted text-textDim cursor-not-allowed',
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-center text-textDim">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>

        {/* ── Right: Quick actions (desktop only) ────────────────── */}
        <aside className="hidden xl:flex flex-col w-48 shrink-0 gap-3 h-full overflow-y-auto no-scrollbar">
          <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-textDim mb-3">Quick Ask</p>
            <div className="space-y-1.5">
              {starters.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.prompt)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-brand hover:bg-bgSurface text-left transition-colors group"
                >
                  <span className="text-sm shrink-0">{s.icon}</span>
                  <span className="text-xs text-textDim group-hover:text-textMain transition-colors leading-snug">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-textDim mb-2 flex items-center gap-1.5">
              <Target className="w-3 h-3 text-brand" /> Pro Tip
            </p>
            <p className="text-[11px] text-textDim leading-relaxed">
              Be specific in your questions. Instead of "help me with Chemistry", try "explain the difference between alkanes and alkenes for JAMB".
            </p>
          </div>
        </aside>

      </div>
    </AppLayout>
  );
};

export default MentorChat;
