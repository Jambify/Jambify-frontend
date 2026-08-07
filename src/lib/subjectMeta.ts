// src/lib/subjectMeta.ts
/**
 * Single source of truth for how a subject is represented visually —
 * icon + color — across every guest page (Quiz, Mock Exam, Past Questions).
 * Previously GuestQuiz/GuestMockExam used raw emoji + hardcoded Tailwind
 * gradients, while GuestPastQuestions used Lucide icons + CSS-variable
 * color tokens. This file makes the second approach the only approach,
 * so a future palette change (like the one earlier in this project)
 * updates every subject badge everywhere at once.
 */
import {
  BookOpen,
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  TrendingUp,
  Landmark,
  BookMarked,
  ScrollText,
  Globe,
  Church,
  BookOpenCheck,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

export const SUBJECT_ICONS: Record<string, LucideIcon> = {
  English: BookOpen,
  Mathematics: Calculator,
  Physics: Zap,
  Chemistry: FlaskConical,
  Biology: Dna,
  Economics: TrendingUp,
  Government: Landmark,
  Literature: BookMarked,
  History: ScrollText,
  Geography: Globe,
  CRS: Church,
  IRS: BookOpenCheck,
  Commerce: ShoppingBag,
};

export const SUBJECT_COLORS: Record<string, string> = {
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

export const DEFAULT_SUBJECT_ICON = BookOpen;
export const DEFAULT_SUBJECT_COLOR = "var(--color-brand)";

export const getSubjectIcon = (subject: string): LucideIcon =>
  SUBJECT_ICONS[subject] ?? DEFAULT_SUBJECT_ICON;

export const getSubjectColor = (subject: string): string =>
  SUBJECT_COLORS[subject] ?? DEFAULT_SUBJECT_COLOR;