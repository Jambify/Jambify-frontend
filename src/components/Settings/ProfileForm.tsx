import React, { useState, useEffect, useMemo } from 'react';
import { useUserStore } from '../../Store/UseUserStore';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';
import { Section, Field, inputCls } from './Shared';
import { Search } from 'lucide-react';

// Updated to match your onboarding data structure
const SUBJECT_COMBOS = [
  {
    id: "medicine",
    label: "Medicine & Pharmacy",
    subjects: ["English", "Biology", "Chemistry", "Physics"],
    icon: "🩺",
  },
  {
    id: "engineering",
    label: "Engineering & Tech",
    subjects: ["English", "Mathematics", "Physics", "Chemistry"],
    icon: "⚙️",
  },
  {
    id: "social-sci",
    label: "Social Sciences",
    subjects: ["English", "Mathematics", "Economics", "Government"],
    icon: "📈",
  },
  {
    id: "law",
    label: "Law & Arts",
    subjects: ["English", "Literature", "Government", "CRS/IRS"],
    icon: "⚖️",
  },
];

const ProfileForm: React.FC = () => {
  const { name, university, subjectCombo, targetScore, examYear, completeOnboarding } = useUserStore();
  
  const [form, setForm] = useState({ name, university, subjectCombo, targetScore, examYear });
  const [universities, setUniversities] = useState<string[]>([]);
  const [isLoadingUnis, setIsLoadingUnis] = useState(false);
  const [searchTerm, setSearchTerm] = useState(university || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    const fetchUniversities = async () => {
      setIsLoadingUnis(true);
      try {
        const response = await fetch('http://universities.hipolabs.com/search?country=Nigeria');
        const data = await response.json();
        const uniNames = data.map((uni: any) => uni.name).sort();
        setUniversities(uniNames);
      } catch (error) {
        console.error("Failed to fetch universities", error);
      } finally {
        setIsLoadingUnis(false);
      }
    };
    fetchUniversities();
  }, []);

  const filteredUnis = useMemo(() => {
    if (!searchTerm) return [];
    return universities.filter(uni => 
      uni.toLowerCase().includes(searchTerm.toLowerCase()) && uni !== searchTerm
    ).slice(0, 8);
  }, [searchTerm, universities]);

  const handleSave = () => {
    if (!form.name.trim()) {
      setErrors({ name: 'Name cannot be empty' });
      return;
    }
    completeOnboarding(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isDirty =
    form.name !== name ||
    form.university !== university ||
    form.subjectCombo !== subjectCombo ||
    form.targetScore !== targetScore ||
    form.examYear !== examYear;

  return (
    <div className="flex flex-col gap-6">
      {/* Personal Info */}
      <Section title="Personal info">
        <Field label="Full name" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              setForm((p) => ({ ...p, name: e.target.value }));
              setErrors({});
            }}
            className={inputCls(!!errors.name)}
            placeholder="Your full name"
          />
        </Field>
      </Section>

      {/* University Search */}
      <Section title="Target university">
        <div className="relative">
          <Field label="Institution of choice">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setForm(p => ({ ...p, university: e.target.value }));
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className={cn(inputCls(false), "pl-10")}
                placeholder="Search Nigerian universities..."
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textDim" size={16} />
            </div>
          </Field>

          {showDropdown && searchTerm && filteredUnis.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-bgSurface border border-borderMuted rounded-brand shadow-2xl overflow-hidden">
              {filteredUnis.map((uni) => (
                <button
                  key={uni}
                  type="button"
                  onClick={() => {
                    setSearchTerm(uni);
                    setForm(p => ({ ...p, university: uni }));
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-brand/10 hover:text-brand-light transition-colors border-b border-borderMuted/30 last:border-none"
                >
                  {uni}
                </button>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Exam Config */}
      <Section title="Exam settings">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Target Score">
            <input
              type="number"
              value={form.targetScore}
              onChange={(e) => setForm((p) => ({ ...p, targetScore: e.target.value }))}
              className={inputCls(false)}
              placeholder="e.g. 300"
            />
          </Field>
          <Field label="Exam Year">
            <select
              value={form.examYear}
              onChange={(e) => setForm((p) => ({ ...p, examYear: e.target.value }))}
              className={inputCls(false)}
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Updated Subject Combinations */}
      <Section title="Subject combination">
        <div className="grid grid-cols-1 gap-2">
          {SUBJECT_COMBOS.map((combo) => {
            const isSelected = form.subjectCombo === combo.id;
            return (
              <button
                key={combo.id}
                type="button"
                onClick={() => setForm((p) => ({ ...p, subjectCombo: combo.id }))}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-brand border flex items-center gap-3 transition-all duration-200',
                  isSelected
                    ? 'bg-brand/10 border-brand ring-1 ring-brand/50'
                    : 'bg-bgSurface border-borderMuted hover:border-white/20',
                )}
              >
                <span className="text-xl grayscale-0">{combo.icon}</span>
                <div className="flex-1">
                  <p className={cn('text-sm font-semibold', isSelected ? 'text-brand-light' : 'text-textMain')}>
                    {combo.label}
                  </p>
                  <p className="text-[11px] text-textDim leading-tight mt-0.5">
                    {combo.subjects.join(' · ')}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-brand shadow-sm shadow-brand" />
                )}
              </button>
            );
          })}
        </div>
      </Section>

      <div className="pt-2">
        <Button
          variant={saved ? 'success' : 'primary'}
          className="w-full sm:w-auto"
          disabled={!isDirty && !saved}
          onClick={handleSave}
        >
          {saved ? '✓ Changes Saved' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm;