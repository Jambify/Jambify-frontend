/**
 * src/Pages/MentorChat.tsx
 * ────────────────────────
 * Full AI mentor chat page.
 *
 * Layout (desktop): left context panel | center chat | right suggestions
 * Layout (mobile):  stacked — context strip → chat → input
 *
 * Role-aware: admins/moderators get a staff-mode system prompt (direct,
 * technical, can discuss the question bank itself) instead of the
 * student-facing encouraging-tutor prompt.
 */

import React, { useEffect, useRef, useState } from "react";
import PageHelmet from "../components/SEO/PageHelmet";
import AppLayout from "../components/Layout/AppLayout";
import { useUserStore } from "../Store/useUserStore";
import { useSubjectStore } from "../Store/useSubjectStore";
import { useAIChat, type ChatMessage } from "../hooks/useAIChat";
import { cn } from "../lib/utils/utils";
import {
  Send,
  Sparkles,
  Trash2,
  ChevronDown,
  BookOpen,
  Target,
  Zap,
  Brain,
  AlertTriangle,
  Calendar,
  Trophy,
  ShieldCheck, // NEW — staff badge icon
} from "lucide-react";

// ── Mentor system prompt (students) ───────────────────────────────────────────
const MENTOR_SYSTEM = `You are Schooldra AI, a friendly and expert JAMB exam preparation mentor for Nigerian students.
You know the student's profile and weak subjects (provided in context).
Be encouraging, specific, and always relate advice back to JAMB preparation.
Keep responses concise (under 250 words) unless a detailed explanation is needed.
Use bullet points and numbered steps for clarity. Reference Nigerian context where helpful.`;

// NEW — system prompt for admins/moderators. Same subject-matter expertise,
// but treats the person as staff rather than a student.
const STAFF_MENTOR_SYSTEM = `You are Schooldra AI, operating in staff mode for a Schooldra team member (admin or moderator), not a student.
Speak to them as a colleague — skip encouragement/motivational framing, be direct and technical.
You may discuss the JAMB question bank itself: flag potentially incorrect answers, ambiguous wording,
outdated syllabus references, or duplicate/near-duplicate questions if asked.
You may also answer meta-questions about how a topic is typically tested, common student misconceptions,
or how to explain a concept to students, since this may inform their moderation work.
No strict length cap — give as much detail as the question warrants.
Use bullet points and numbered steps for clarity where useful.`;

// ── Starter prompts (students) ─────────────────────────────────────────────────
const BASE_STARTERS = [
  {
    icon: "📅",
    label: "Make me a study plan",
    prompt:
      "Create a personalized 2-week study plan for me based on my weak subjects and exam date.",
  },
  {
    icon: "⏱️",
    label: "Time management tips",
    prompt:
      "Give me practical time management tips for the JAMB exam. How should I allocate time per question?",
  },
  {
    icon: "🎯",
    label: "How to hit my target score",
    prompt:
      "What specific steps do I need to take to reach my target score? Be very specific.",
  },
  {
    icon: "📝",
    label: "Common JAMB mistakes",
    prompt:
      "What are the most common mistakes students make in JAMB and how do I avoid them?",
  },
];

// NEW — starter prompts shown to staff instead of students
const STAFF_STARTERS = [
  {
    icon: "🔎",
    label: "Check a question",
    prompt:
      "I want to review a question from our bank for accuracy. I'll paste the question, options, and marked answer — please verify it's correct and flag anything ambiguous.",
  },
  {
    icon: "📊",
    label: "Common misconceptions",
    prompt:
      "What are the most common student misconceptions in a JAMB subject I'm moderating? Pick a subject and break it down.",
  },
  {
    icon: "🧩",
    label: "Explain a tricky topic",
    prompt:
      "Explain a commonly-confused JAMB topic the way I'd need to explain it to a struggling student, so I can improve our content around it.",
  },
  {
    icon: "🗂️",
    label: "Syllabus check",
    prompt:
      "Is there anything in the current JAMB syllabus that's commonly outdated in older question banks? What should I watch for when reviewing questions?",
  },
];

// ── Typing indicator ──────────────────────────────────────────────────────────
const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="bg-brand/60 h-2 w-2 rounded-full"
        style={{
          animation: "bounce 1.2s infinite",
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
  const isUser = msg.role === "user";

  return (
    <div
      className={cn(
        "flex max-w-[88%] gap-2.5",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto",
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="bg-brand/20 border-brand/30 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border">
          <Sparkles className="text-brand-light h-3.5 w-3.5" />
        </div>
      )}

      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-brand rounded-tr-sm text-white"
            : "bg-bgSurface border-borderMuted text-textMain rounded-tl-sm border",
          msg.isStreaming &&
            'after:text-brand after:ml-0.5 after:animate-pulse after:content-["▋"]',
        )}
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {msg.content || (msg.isStreaming ? "" : "…")}
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
    isAdmin,      // NEW
    isModerator,  // NEW
  } = useUserStore();
  const { subjects, loadSubjects, isInitialized } = useSubjectStore();

  const isStaff = isAdmin || isModerator; // NEW

  useEffect(() => {
    if (!isInitialized) loadSubjects();
  }, [isInitialized, loadSubjects]);

  const weakSubjects = subjects
    .filter((s) => s.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  // Build personalized system prompt with user context.
  // Staff get a different base prompt and a lighter context block
  // (no "weak subjects" framing, which doesn't apply to them).
  const systemPrompt = isStaff
    ? `${STAFF_MENTOR_SYSTEM}

Staff member:
- Name: ${name || "Team member"}
- Role: ${isAdmin ? "Admin" : "Moderator"}`
    : `${MENTOR_SYSTEM}

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
    storageKey: `schooldra-mentor-${name || "guest"}`,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Build starters based on role first, then weak subjects for students
  const starters = isStaff
    ? STAFF_STARTERS
    : [
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
      <PageHelmet
        title="Mentor Chat | SCHOOLDRA"
        description="Chat with Schooldra's AI Mentor for personalized study advice, topic explanations, and exam strategies for JAMB UTME."
        canonical="https://www.schooldra.com/mentor"
      />
      <div
        className="-mx-4 -mt-4 flex gap-3 overflow-hidden px-4 pt-4 lg:-mx-7 lg:-mt-7 lg:px-7 lg:pt-7"
        style={{ height: "calc(100vh - 56px - 1.75rem)" }}
      >
        {/* ── Left: Context panel (desktop only) ─────────────────── */}
        <aside className="no-scrollbar hidden h-full w-56 shrink-0 flex-col gap-3 overflow-y-auto lg:flex">
          {/* AI badge */}
          <div className="bg-bgCard border-borderMuted rounded-brand-lg border p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-brand/15 border-brand/25 flex h-10 w-10 items-center justify-center rounded-full border">
                <Sparkles className="text-brand-light h-5 w-5" />
              </div>
              <div>
                <p className="text-textMain text-sm font-semibold">
                  Schooldra AI
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="bg-success h-1.5 w-1.5 animate-pulse rounded-full" />
                  <span className="text-success text-[10px] font-medium">
                    Online
                  </span>
                </div>
              </div>
            </div>
            <p className="text-textDim text-[11px] leading-relaxed">
              {isStaff
                ? "Staff mode — direct answers, question-bank review, and moderation support."
                : "Your personal JAMB tutor. Ask anything about your subjects, exam strategy, or study plans."}
            </p>
            {/* NEW — staff badge */}
            {isStaff && (
              <div className="bg-brand/10 border-brand/20 text-brand-light mt-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                <ShieldCheck className="h-3 w-3" />
                {isAdmin ? "Admin mode" : "Moderator mode"}
              </div>
            )}
          </div>

          {/* Profile snapshot — students only, not relevant to staff */}
          {!isStaff && (
            <div className="bg-bgCard border-borderMuted rounded-brand-lg space-y-2.5 border p-4">
              <p className="text-textDim mb-3 text-[10px] font-bold tracking-widest uppercase">
                Your Profile
              </p>
              <div className="text-textMuted flex items-center gap-2 text-xs">
                <Calendar className="text-brand h-3.5 w-3.5 shrink-0" />
                <span>
                  JAMB {examYear} · {examDate}
                </span>
              </div>
              {targetScore && (
                <div className="text-textMuted flex items-center gap-2 text-xs">
                  <Trophy className="text-warn h-3.5 w-3.5 shrink-0" />
                  <span>Target: {targetScore}</span>
                </div>
              )}
              <div className="text-textMuted flex items-center gap-2 text-xs">
                <BookOpen className="text-success h-3.5 w-3.5 shrink-0" />
                <span>{questionsCompleted} questions done</span>
              </div>
            </div>
          )}

          {/* Weak subjects — students only */}
          {!isStaff && weakSubjects.length > 0 && (
            <div className="bg-bgCard border-borderMuted rounded-brand-lg border p-4">
              <p className="text-textDim mb-3 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                <AlertTriangle className="text-warn h-3 w-3" /> Needs Work
              </p>
              <div className="space-y-2">
                {weakSubjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      const p = `I need help with ${s.name}. My accuracy is ${s.accuracy}%. Can you explain the key concepts I should focus on?`;
                      sendMessage(p);
                    }}
                    className="hover:bg-bgSurface rounded-brand group flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors"
                  >
                    <span className="text-sm">{s.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-textMain truncate text-xs font-medium">
                        {s.name}
                      </p>
                      <p className="text-danger text-[10px]">
                        {s.accuracy}% accuracy
                      </p>
                    </div>
                    <Zap className="text-brand h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear history */}
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-textDim hover:text-danger border-borderMuted hover:border-danger/30 rounded-brand flex items-center gap-2 border px-3 py-2 text-xs transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear conversation
            </button>
          )}
        </aside>

        {/* ── Center: Chat window ─────────────────────────────────── */}
        <div className="bg-bgCard border-borderMuted rounded-brand-lg flex h-full min-w-0 flex-1 flex-col overflow-hidden border">
          {/* Chat header */}
          <div className="border-borderMuted flex shrink-0 items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-brand/15 border-brand/25 flex h-8 w-8 items-center justify-center rounded-full border">
                <Sparkles className="text-brand-light h-4 w-4" />
              </div>
              <div>
                <p className="text-textMain text-sm font-semibold">
                  Schooldra AI Mentor
                  {isStaff && (
                    <span className="text-brand-light ml-1.5 text-[10px] font-bold uppercase tracking-wide">
                      · Staff
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="bg-success h-1.5 w-1.5 animate-pulse rounded-full" />
                  <span className="text-success text-[10px]">
                    Always available
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile: context toggle */}
              <button
                onClick={() => setShowContext(!showContext)}
                className="bg-bgSurface border-borderMuted rounded-brand text-textDim hover:text-textMain flex items-center gap-1 border px-2.5 py-1.5 text-xs transition-colors lg:hidden"
              >
                <Brain className="h-3.5 w-3.5" />
                Context
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    showContext && "rotate-180",
                  )}
                />
              </button>

              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-textDim hover:text-danger rounded-brand hover:bg-danger/10 p-1.5 transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile context strip */}
          {showContext && (
            <div className="bg-bgSurface border-borderMuted text-textMuted flex flex-wrap gap-3 border-b px-4 py-3 text-xs lg:hidden">
              {isStaff ? (
                <span className="text-brand-light flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  {isAdmin ? "Admin mode" : "Moderator mode"}
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> JAMB {examYear}
                  </span>
                  {targetScore && (
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" /> Target: {targetScore}
                    </span>
                  )}
                  {weakSubjects.length > 0 && (
                    <span className="text-warn flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Weak: {weakSubjects.map((s) => s.name).join(", ")}
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 space-y-4 overflow-y-auto scroll-smooth px-4 py-4">
            {/* Empty state — greeting + starters */}
            {isEmpty && (
              <div className="flex h-full flex-col items-center justify-center gap-6 py-8 text-center">
                <div className="bg-brand/10 border-brand/20 flex h-16 w-16 items-center justify-center rounded-full border">
                  <Sparkles className="text-brand-light h-7 w-7" />
                </div>
                <div>
                  <h2 className="font-display text-textMain mb-1 text-xl font-bold">
                    {isStaff ? `Hey ${name || "there"}` : `Hi ${name || "there"} 👋`}
                  </h2>
                  <p className="text-textDim max-w-xs text-sm leading-relaxed">
                    {isStaff
                      ? "Staff mode is on — ask about the question bank, common misconceptions, or anything that helps your moderation work."
                      : weakSubjects.length > 0
                        ? `I've reviewed your progress. You need work on ${weakSubjects[0].name}. What would you like to focus on?`
                        : "I'm your personal JAMB tutor. Ask me anything about your subjects or exam strategy."}
                  </p>
                </div>

                {/* Starter prompts */}
                <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
                  {starters.slice(0, 4).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s.prompt)}
                      className="bg-bgSurface border-borderMuted rounded-brand hover:border-brand/40 hover:bg-brand/5 group flex items-center gap-2.5 border px-3 py-2.5 text-left transition-all"
                    >
                      <span className="shrink-0 text-base">{s.icon}</span>
                      <span className="text-textMuted group-hover:text-textMain text-xs font-medium transition-colors">
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
            {isLoading && messages[messages.length - 1]?.role !== "ai" && (
              <div className="mr-auto flex gap-2.5">
                <div className="bg-brand/20 border-brand/30 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border">
                  <Sparkles className="text-brand-light h-3.5 w-3.5" />
                </div>
                <div className="bg-bgSurface border-borderMuted rounded-2xl rounded-tl-sm border">
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </div>

          {/* Suggested follow-ups (shown after AI responds) */}
          {!isEmpty &&
            !isLoading &&
            !isAtLimit &&
            messages[messages.length - 1]?.role === "ai" && (
              <div className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-4 pb-2">
                {(isStaff
                  ? ["Give me an example", "Go deeper", "Any related edge cases?", "What else should I check?"]
                  : ["Give me an example", "Simplify that", "Quiz me on this", "What else should I know?"]
                ).map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="bg-bgSurface border-borderMuted text-textDim hover:text-textMain hover:border-brand/40 shrink-0 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

          {/* Near-limit warning */}
          {isNearLimit && !isAtLimit && (
            <div className="bg-warn/10 border-warn/20 rounded-brand mx-4 mb-2 flex shrink-0 items-center justify-between gap-2 border px-3 py-2">
              <p className="text-warn text-[11px]">
                {messagesRemaining} message{messagesRemaining !== 1 ? "s" : ""}{" "}
                left in this session
              </p>
              <button
                onClick={clearHistory}
                className="text-warn shrink-0 text-[11px] font-semibold hover:underline"
              >
                Start new
              </button>
            </div>
          )}

          {/* At-limit banner */}
          {isAtLimit && (
            <div className="bg-danger/10 border-danger/20 rounded-brand mx-4 mb-2 flex shrink-0 items-center justify-between gap-2 border px-3 py-3">
              <p className="text-danger text-[11px] leading-snug">
                Session limit reached. Start a new conversation to continue.
              </p>
              <button
                onClick={clearHistory}
                className="bg-danger rounded-brand hover:bg-danger/90 shrink-0 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors"
              >
                New chat
              </button>
            </div>
          )}

          {/* Input bar */}
          <div className="border-borderMuted shrink-0 border-t px-4 pt-2 pb-4">
            <div
              className={cn(
                "bg-bgSurface rounded-brand-lg flex items-end gap-2 border p-2 transition-colors",
                isAtLimit
                  ? "border-danger/30 opacity-60"
                  : "border-borderMuted focus-within:border-brand",
              )}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-grow
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  isAtLimit
                    ? "Session limit reached — start a new chat"
                    : isStaff
                      ? "Ask about the question bank, topics, or moderation…"
                      : "Ask anything about JAMB…"
                }
                disabled={isLoading || isAtLimit}
                className="no-scrollbar placeholder:text-textDim text-textMain max-h-30 min-h-9 flex-1 resize-none border-none bg-transparent px-2 py-1.5 text-sm focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isAtLimit}
                className={cn(
                  "rounded-brand shrink-0 p-2 transition-all",
                  input.trim() && !isLoading && !isAtLimit
                    ? "bg-brand hover:bg-brand-light shadow-brand/20 text-white shadow-md active:scale-95"
                    : "bg-borderMuted text-textDim cursor-not-allowed",
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-textDim mt-1.5 text-center text-[10px]">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>

        {/* ── Right: Quick actions (desktop only) ────────────────── */}
        <aside className="no-scrollbar hidden h-full w-48 shrink-0 flex-col gap-3 overflow-y-auto xl:flex">
          <div className="bg-bgCard border-borderMuted rounded-brand-lg border p-4">
            <p className="text-textDim mb-3 text-[10px] font-bold tracking-widest uppercase">
              {isStaff ? "Staff Quick Ask" : "Quick Ask"}
            </p>
            <div className="space-y-1.5">
              {starters.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.prompt)}
                  className="rounded-brand hover:bg-bgSurface group flex w-full items-center gap-2 px-2.5 py-2 text-left transition-colors"
                >
                  <span className="shrink-0 text-sm">{s.icon}</span>
                  <span className="text-textDim group-hover:text-textMain text-xs leading-snug transition-colors">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-bgCard border-borderMuted rounded-brand-lg border p-4">
            <p className="text-textDim mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
              <Target className="text-brand h-3 w-3" /> {isStaff ? "Note" : "Pro Tip"}
            </p>
            <p className="text-textDim text-[11px] leading-relaxed">
              {isStaff
                ? "You can paste a full question, its options, and marked answer directly into chat for a quick accuracy check."
                : 'Be specific in your questions. Instead of "help me with Chemistry", try "explain the difference between alkanes and alkenes for JAMB".'}
            </p>
          </div>
        </aside>
      </div>
    </AppLayout>
  );
};

export default MentorChat;