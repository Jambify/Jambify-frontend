import React, { useState } from "react";
import { useUserStore }     from "../../Store/useUserStore";
import { useExamCountdown } from "../../hooks/useExamCountdown";
import Button               from "../ui/Button";
import { cn }               from "../../lib/utils/utils";
import { Section, Field, inputCls } from "./Shared";
import { Calendar, Clock } from "lucide-react";

const TARGET_SCORES = [
  { range: "320+",    label: "Elite",     sub: "Top 1% nationwide",         color: "#7B5FFF" },
  { range: "280–319", label: "Excellent", sub: "Competitive for all Unis",   color: "#00C896" },
  { range: "250–279", label: "Strong",    sub: "Target for State/Federal",   color: "#FFB020" },
  { range: "200–249", label: "Target",    sub: "Standard Entry Level",       color: "#FF4D6D" },
];

// Years users can choose from — extend as needed
const EXAM_YEARS = ["2025", "2026", "2027", "2028"];

const ExamSettings: React.FC = () => {
  const { targetScore, examYear, examDate, updateExamSettings } = useUserStore();

  // daysLeft is COMPUTED — never read from store
  const { daysLeft, formattedDate, isUpdating } = useExamCountdown();

  const [form, setForm] = useState({ targetScore, examYear, examDate });
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);

  const isDirty =
    form.targetScore !== targetScore ||
    form.examYear    !== examYear    ||
    form.examDate    !== examDate;

  const handleSave = async () => {
    setSaving(true);
    await updateExamSettings(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Colour the countdown based on urgency
  const cdColor =
    daysLeft < 0   ? "#6B7280" :
    daysLeft === 0 ? "#F97316" :
    daysLeft <= 7  ? "#EF4444" :
    daysLeft <= 30 ? "#F59E0B" :
    "#7B5FFF";

  return (
    <div className="flex flex-col gap-5">

      {/* ── Live countdown banner ─────────────────────── */}
      <div className="bg-bgCard border border-borderMuted rounded-brand-lg overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${cdColor}18`, border: `1px solid ${cdColor}30` }}
            >
              <Clock className="w-5 h-5" style={{ color: cdColor }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-textMain">
                JAMB {form.examYear} Exam
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-textDim mt-0.5">
                <Calendar className="w-3 h-3 shrink-0" />
                {/* Shows live formattedDate from the hook — updates when form saves */}
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Big countdown number */}
          <div className="text-right shrink-0">
            {isUpdating ? (
              <p className="font-display text-2xl font-black text-textDim animate-pulse">…</p>
            ) : daysLeft < 0 ? (
              <p className="text-sm text-textDim">No date set</p>
            ) : daysLeft === 0 ? (
              <p className="font-display text-lg font-black" style={{ color: cdColor }}>
                Today!
              </p>
            ) : (
              <div>
                <p
                  className="font-display text-3xl font-black tracking-tighter leading-none"
                  style={{ color: cdColor }}
                >
                  {daysLeft}
                </p>
                <p className="text-[10px] text-textDim uppercase tracking-widest mt-0.5">
                  days left
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Urgency bar at bottom of banner */}
        {daysLeft > 0 && (
          <div className="h-1 w-full bg-bgSurface">
            <div
              className="h-full transition-all duration-700"
              style={{
                // Fill shrinks as days pass — assumes ~365 day prep window
                width: `${Math.min(100, Math.max(2, (daysLeft / 365) * 100))}%`,
                background: cdColor,
              }}
            />
          </div>
        )}
      </div>

      {/* ── JAMB year ─────────────────────────────────── */}
      <Section title="JAMB year">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EXAM_YEARS.map((yr) => (
            <button
              key={yr}
              onClick={() => setForm((p) => ({ ...p, examYear: yr }))}
              className={cn(
                "py-2.5 rounded-brand border text-sm font-medium transition-all",
                form.examYear === yr
                  ? "bg-brand border-brand text-white shadow-lg shadow-brand/20"
                  : "bg-bgSurface border-borderMuted text-textMuted hover:border-white/20 hover:text-textMain",
              )}
            >
              {yr}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Exam date ─────────────────────────────────── */}
      <Section title="Exam date">
        <Field>
          <input
            type="text"
            value={form.examDate}
            onChange={(e) => setForm((p) => ({ ...p, examDate: e.target.value }))}
            placeholder="e.g. Apr 27"
            className={inputCls(false)}
          />
          <p className="text-[11px] text-textDim mt-1.5 leading-relaxed">
            Format: <span className="text-textMain font-mono">Mon DD</span> — e.g.{" "}
            <span className="text-textMain font-mono">Apr 27</span>,{" "}
            <span className="text-textMain font-mono">Jun 14</span>. The countdown
            updates live when you save.
          </p>
        </Field>
      </Section>

      {/* ── Target score ──────────────────────────────── */}
      <Section title="Target score">
        <div className="flex flex-col gap-2">
          {TARGET_SCORES.map((t) => {
            const isSelected = form.targetScore === t.range;
            return (
              <button
                key={t.range}
                onClick={() => setForm((p) => ({ ...p, targetScore: t.range }))}
                className={cn(
                  "w-full text-left px-4 py-3.5 rounded-brand border transition-all",
                  isSelected
                    ? "bg-brand/10 border-brand"
                    : "bg-bgSurface border-borderMuted hover:border-white/20",
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className="font-display font-bold text-lg leading-none"
                      style={{ color: t.color }}
                    >
                      {t.range}
                    </span>
                    <span className="ml-2 text-xs font-semibold text-textDim uppercase tracking-wide">
                      {t.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-textDim hidden sm:block">{t.sub}</span>
                    {isSelected && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                        style={{ background: t.color }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Actions ───────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button
          variant={saved ? "success" : "primary"}
          size="md"
          disabled={(!isDirty && !saved) || saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : saved ? "✓ Saved!" : "Save changes"}
        </Button>
        {isDirty && (
          <button
            className="text-sm text-textDim hover:text-textMain transition-colors"
            onClick={() => setForm({ targetScore, examYear, examDate })}
          >
            Discard
          </button>
        )}
      </div>

    </div>
  );
};

export default ExamSettings;
