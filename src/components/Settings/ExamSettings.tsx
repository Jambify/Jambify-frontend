import React, { useState } from 'react';
import { useUserStore } from '../../Store/UseUserStore';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';
import { Section, Field, inputCls } from './Shared';

const TARGET_SCORES = [
  { range: '320+',    label: 'Elite',     color: '#7B5FFF' },
  { range: '280–319', label: 'Excellent', color: '#00C896' },
  { range: '250–279', label: 'Strong',    color: '#FFB020' },
  { range: '200–249', label: 'Target',    color: '#FF4D6D' },
];

const ExamSettings: React.FC = () => {
  const { targetScore, examYear, examDate, daysToExam, updateExamSettings } = useUserStore();
  const [form, setForm] = useState({ targetScore, examYear, examDate });
  const [saved, setSaved] = useState(false);

  const isDirty =
    form.targetScore !== targetScore ||
    form.examYear    !== examYear    ||
    form.examDate    !== examDate;

  const handleSave = () => {
    updateExamSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-5">

      {/* <Exam countdown banner */}
      <div className="bg-brand/10 border border-brand/20 rounded-brand-lg px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-brand-light">JAMB {examYear}</p>
          <p className="text-[11px] text-textDim mt-0.5">{examDate} · {daysToExam} days remaining</p>
        </div>
        <div className="font-display text-3xl font-black text-brand-light tracking-tighter">
          {daysToExam}
          <span className="text-sm font-normal text-textDim ml-1">days</span>
        </div>
      </div>

      <Section title="JAMB year">
        <div className="flex gap-2">
          {['2025', '2026'].map((yr) => (
            <button
              key={yr}
              onClick={() => setForm((p) => ({ ...p, examYear: yr }))}
              className={cn(
                'flex-1 py-2.5 rounded-brand border text-sm font-medium transition-all',
                form.examYear === yr
                  ? 'bg-brand border-brand text-white'
                  : 'bg-bgSurface border-borderMuted text-textMuted hover:border-white/15 hover:text-textMain',
              )}
            >
              JAMB {yr}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Exam date">
        <Field>
          <input
            type="text"
            value={form.examDate}
            onChange={(e) => setForm((p) => ({ ...p, examDate: e.target.value }))}
            placeholder="e.g. Jun 14"
            className={inputCls(false)}
          />
          <p className="text-[11px] text-textDim mt-1.5">
            Used to calculate your countdown. Format: Mon DD (e.g. Jun 14)
          </p>
        </Field>
      </Section>

      <Section title="Target score">
        <div className="flex flex-col gap-2">
          {TARGET_SCORES.map((t) => {
            const isSelected = form.targetScore === t.range;
            return (
              <button
                key={t.range}
                onClick={() => setForm((p) => ({ ...p, targetScore: t.range }))}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-brand border transition-all flex items-center justify-between',
                  isSelected
                    ? 'bg-brand/10 border-brand'
                    : 'bg-bgSurface border-borderMuted hover:border-white/15',
                )}
              >
                <span
                  className="font-display font-bold text-base"
                  style={{ color: t.color }}
                >
                  {t.range}
                </span>
                <span className="text-sm text-textMuted">{t.label}</span>
                {isSelected && (
                  <span className="text-brand-light text-sm ml-auto">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <Button
          variant={saved ? 'success' : 'primary'}
          size="md"
          disabled={!isDirty && !saved}
          onClick={handleSave}
        >
          {saved ? '✓ Saved!' : 'Save changes'}
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