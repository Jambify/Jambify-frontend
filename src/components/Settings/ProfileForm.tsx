import React, { useState, useEffect, useMemo } from "react";
import { useUserStore } from "../../Store/useUserStore";
import Button from "../ui/Button";
import { cn, toTitleCase } from "../../lib/utils/utils";
import { Section, Field, inputCls } from "./Shared";
import { Search, Loader2 } from "lucide-react"; // Added Loader2

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
  const {
    name,
    email,
    university,
    subjectCombo,
    targetScore,
    examYear,
    examDate,
    completeOnboarding,
  } = useUserStore();

  const [form, setForm] = useState({
    name,
    email,
    university,
    subjectCombo,
    targetScore,
    examYear,
    examDate,
  });
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
        const response = await fetch(
          "http://universities.hipolabs.com/search?country=Nigeria",
        );
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
    return universities
      .filter(
        (uni) =>
          uni.toLowerCase().includes(searchTerm.toLowerCase()) &&
          uni !== searchTerm,
      )
      .slice(0, 8);
  }, [searchTerm, universities]);

  const handleSave = () => {
    if (!form.name.trim()) {
      setErrors({ name: "Name cannot be empty" });
      return;
    }
    const formattedForm = { ...form, name: toTitleCase(form.name.trim()) };
    completeOnboarding(formattedForm);
    setForm(formattedForm);
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
        <Field label="Email address">
          <input
            type="email"
            value={email}
            readOnly
            className={cn(
              inputCls(false),
              "bg-bgDeep cursor-not-allowed opacity-75",
            )}
            placeholder="your.email@example.com"
          />
          <p className="text-textDim mt-1 text-xs">
            Email cannot be changed - it's your account identifier
          </p>
        </Field>
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
                  setForm((p) => ({ ...p, university: e.target.value }));
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className={cn(inputCls(false), "pr-10 pl-10")}
                placeholder="Search Nigerian universities..."
              />
              <Search
                className="text-textDim absolute top-1/2 left-3 -translate-y-1/2"
                size={16}
              />

              {/* Spinner logic */}
              {isLoadingUnis && (
                <Loader2
                  className="text-brand absolute top-1/2 right-3 -translate-y-1/2 animate-spin"
                  size={16}
                />
              )}
            </div>
          </Field>

          {showDropdown && searchTerm && (
            <div className="bg-bgSurface border-borderMuted rounded-brand absolute z-50 mt-1 w-full overflow-hidden border shadow-2xl">
              {isLoadingUnis ? (
                <div className="text-textDim px-4 py-3 text-center text-sm italic">
                  Loading list...
                </div>
              ) : filteredUnis.length > 0 ? (
                filteredUnis.map((uni) => (
                  <button
                    key={uni}
                    type="button"
                    onClick={() => {
                      setSearchTerm(uni);
                      setForm((p) => ({ ...p, university: uni }));
                      setShowDropdown(false);
                    }}
                    className="hover:bg-brand/10 hover:text-brand-light border-borderMuted/30 w-full border-b px-4 py-3 text-left text-sm transition-colors last:border-none"
                  >
                    {uni}
                  </button>
                ))
              ) : (
                <div className="text-textDim px-4 py-3 text-center text-sm">
                  No results found
                </div>
              )}
            </div>
          )}
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
                onClick={() =>
                  setForm((p) => ({ ...p, subjectCombo: combo.id }))
                }
                className={cn(
                  "rounded-brand flex w-full items-center gap-3 border px-4 py-3 text-left transition-all duration-200",
                  isSelected
                    ? "bg-brand/10 border-brand ring-brand/50 ring-1"
                    : "bg-bgSurface border-borderMuted hover:border-white/20",
                )}
              >
                <span className="text-xl grayscale-0">{combo.icon}</span>
                <div className="flex-1">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isSelected ? "text-brand-light" : "text-textMain",
                    )}
                  >
                    {combo.label}
                  </p>
                  <p className="text-textDim mt-0.5 text-[11px] leading-tight">
                    {combo.subjects.join(" · ")}
                  </p>
                </div>
                {isSelected && (
                  <div className="bg-brand shadow-brand h-2 w-2 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </Section>

      <div className="flex items-center gap-5">
        <Button
          variant={saved ? "success" : "primary"}
          className="md"
          disabled={!isDirty && !saved}
          onClick={handleSave}
        >
          {saved ? "✓ Changes Saved" : "Save Profile"}
        </Button>
        {isDirty && (
          <button
            className="text-textDim hover:text-textMain text-sm transition-colors"
            onClick={() =>
              setForm({
                name,
                email,
                university,
                subjectCombo,
                targetScore,
                examYear,
                examDate,
              })
            }
          >
            Discard
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;
