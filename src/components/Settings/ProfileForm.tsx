import React, { useState, useEffect } from "react";
import { useUserStore } from "../../Store/useUserStore";
import Button from "../ui/Button";
import ConfirmModal from "../ui/ConfirmModal";
import { cn, toTitleCase, sanitizeXss } from "../../lib/utils/utils";
import { Section, Field } from "./Shared";
import { inputCls } from "./SharedUtils";
import { Search, Loader2, Check } from "lucide-react";
import CustomSubjectSelector from "./CustomSubjectSelector";
import { SUBJECT_COMBOS } from "../../lib/subjectMeta";
import {
  truncateInput,
  validateName,
  MAX_NAME_LENGTH,
  MAX_UNI_LENGTH,
} from "../../lib/validation";
import ValidatedInput from "../ui/ValidatedInput";

interface UniversityResult {
  name: string;
  country: string;
  alpha_two_code?: string;
  domains?: string[];
  web_pages?: string[];
  "state-province"?: string | null;
}

// FALLBACK UNIVERSITY LIST (Nigerian Universities)
const FALLBACK_UNIVERSITIES = [
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "Ahmadu Bello University (ABU)",
  "University of Nigeria, Nsukka (UNN)",
  "Covenant University",
  "University of Benin (UNIBEN)",
  "Federal University of Technology, Minna",
  "University of Ilorin (UNILORIN)",
  "Lagos State University (LASU)",
  "Nnamdi Azikiwe University (UNIZIK)",
  "University of Port Harcourt (UNIPORT)",
  "Bayero University Kano (BUK)",
  "University of Abuja",
  "Federal University of Technology, Akure",
  "Babcock University",
  "Pan-Atlantic University",
  "Rivers State University",
  "Kwara State University",
  "University of Calabar (UNICAL)",
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
    updateProfile,
  } = useUserStore();

  const isCustomComboCustom = Array.isArray(subjectCombo);
  const [isCustomSubjectMode, setIsCustomSubjectMode] =
    useState(isCustomComboCustom);

  const [form, setForm] = useState({
    name,
    email,
    university,
    subjectCombo,
    targetScore,
    examYear,
    examDate,
  });

  const [uniResults, setUniResults] = useState<string[]>([]);
  const [isLoadingUnis, setIsLoadingUnis] = useState(false);
  const [uniError, setUniError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  const [searchTerm, setSearchTerm] = useState(university || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [showConfirmComboChange, setShowConfirmComboChange] = useState(false);
  const [pendingFormUpdate, setPendingFormUpdate] = useState<
    typeof form | null
  >(null);

  const getFilteredFallbackUniversities = (search: string) => {
    if (!search || search.length < 2) return [];
    const searchLower = search.toLowerCase();
    return FALLBACK_UNIVERSITIES.filter((uni) =>
      uni.toLowerCase().includes(searchLower),
    );
  };

  /* ── University API Search Logic with Fallback & Debounce ── */
  useEffect(() => {
    const fetchUnis = async () => {
      if (searchTerm.length < 2) {
        setUniResults([]);
        setUniError(null);
        return;
      }

      if (useFallback) {
        const filtered = getFilteredFallbackUniversities(searchTerm);
        setUniResults(filtered);
        return;
      }

      setIsLoadingUnis(true);
      setUniError(null);

      try {
        let data = [];
        let success = false;

        // 1. Primary API
        try {
          const res = await fetch(
            `https://universities.hipolabs.com/search?name=${encodeURIComponent(searchTerm)}&country=Nigeria`,
            { mode: "cors" },
          );
          if (res.ok) {
            data = await res.json();
            if (data.length > 0) success = true;
          }
        } catch {
          console.log("Primary API failed, trying backup...");
        }

        // 2. Backup GitHub JSON
        if (!success) {
          try {
            const backupRes = await fetch(
              `https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json`,
            );
            if (backupRes.ok) {
              const allUnis = (await backupRes.json()) as UniversityResult[];
              const nigeriaUnis = allUnis.filter(
                (u: UniversityResult) =>
                  u.country === "Nigeria" &&
                  u.name.toLowerCase().includes(searchTerm.toLowerCase()),
              );
              data = nigeriaUnis.slice(0, 20);
              if (data.length > 0) success = true;
            }
          } catch {
            console.log("Backup API also failed");
          }
        }

        // 3. Fallback evaluation
        if (success && data.length > 0) {
          setUniResults(data.map((u: UniversityResult) => u.name));
          setUseFallback(false);
        } else {
          const fallbackResults = getFilteredFallbackUniversities(searchTerm);
          if (fallbackResults.length > 0) {
            setUniResults(fallbackResults);
            setUseFallback(true);
            setUniError(
              "Using offline university list. Showing available matches.",
            );
          } else {
            setUniResults([]);
            setUniError("No universities found. Try a different search term.");
          }
        }
      } catch {
        const fallbackResults = getFilteredFallbackUniversities(searchTerm);
        if (fallbackResults.length > 0) {
          setUniResults(fallbackResults);
          setUseFallback(true);
          setUniError("Connected to offline university database.");
        } else {
          setUniResults([]);
          setUniError(
            "Unable to search. Please type the full university name.",
          );
        }
      } finally {
        setIsLoadingUnis(false);
      }
    };

    const timeoutId = setTimeout(fetchUnis, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, useFallback]);

  const handleSave = () => {
    if (!form.name.trim()) {
      setErrors({ name: "Name cannot be empty" });
      return;
    }

    const sanitizedForm = {
      ...form,
      name: sanitizeXss(form.name),
      university: sanitizeXss(form.university || ""),
    };

    const hasComboChanged =
      JSON.stringify(sanitizedForm.subjectCombo) !==
      JSON.stringify(subjectCombo);

    if (hasComboChanged) {
      setPendingFormUpdate(sanitizedForm);
      setShowConfirmComboChange(true);
      return;
    }

    const formattedForm = {
      ...sanitizedForm,
      name: toTitleCase(sanitizedForm.name.trim()),
    };
    updateProfile({
      name: formattedForm.name,
      university: formattedForm.university,
      subjectCombo: formattedForm.subjectCombo,
    });
    setForm(formattedForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const confirmComboChange = () => {
    if (pendingFormUpdate) {
      const sanitizedForm = {
        ...pendingFormUpdate,
        name: sanitizeXss(pendingFormUpdate.name),
        university: sanitizeXss(pendingFormUpdate.university || ""),
      };

      const formattedForm = {
        ...sanitizedForm,
        name: toTitleCase(sanitizedForm.name.trim()),
      };
      updateProfile({
        name: formattedForm.name,
        university: formattedForm.university,
        subjectCombo: formattedForm.subjectCombo,
      });
      setForm(formattedForm);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setShowConfirmComboChange(false);
    setPendingFormUpdate(null);
  };

  const isDirty =
    form.name !== name ||
    form.university !== university ||
    JSON.stringify(form.subjectCombo) !== JSON.stringify(subjectCombo) ||
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
          <ValidatedInput
            value={form.name}
            onChange={(v) => {
              const val = truncateInput(v, MAX_NAME_LENGTH);
              setForm((p) => ({ ...p, name: val }));
              if (!validateName(val)) {
                setErrors({ name: "Name contains invalid characters" });
              } else {
                setErrors({});
              }
            }}
            maxLength={MAX_NAME_LENGTH}
            validate={validateName}
            error={errors.name}
            placeholder="Your full name"
            className={inputCls(!!errors.name)}
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
                  const val = truncateInput(e.target.value, MAX_UNI_LENGTH);
                  setSearchTerm(val);
                  setForm((p) => ({ ...p, university: val }));
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

              {isLoadingUnis && (
                <Loader2
                  className="text-brand absolute top-1/2 right-3 -translate-y-1/2 animate-spin"
                  size={16}
                />
              )}
            </div>
          </Field>

          {showDropdown && searchTerm.length >= 2 && (
            <div className="bg-bgSurface border-borderMuted rounded-brand custom-scrollbar absolute z-50 mt-1 max-h-60 w-full overflow-y-auto border shadow-2xl">
              {uniError && (
                <div className="px-4 py-2 text-xs font-medium text-orange-400">
                  {uniError}
                </div>
              )}

              {uniResults.length > 0
                ? uniResults.map((uni) => (
                    <button
                      key={uni}
                      type="button"
                      onClick={() => {
                        setSearchTerm(uni);
                        setForm((p) => ({ ...p, university: uni }));
                        setShowDropdown(false);
                      }}
                      className="hover:bg-brand/10 hover:text-brand-light border-borderMuted/30 text-textMain w-full border-b px-4 py-3 text-left text-sm transition-colors last:border-none"
                    >
                      {uni}
                    </button>
                  ))
                : !isLoadingUnis && (
                    <div className="border-t border-white/10 p-4">
                      <p className="text-textDim mb-2 text-xs">
                        Can't find your university?
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const val = truncateInput(searchTerm, MAX_UNI_LENGTH);
                          setForm((p) => ({ ...p, university: val }));
                          setShowDropdown(false);
                        }}
                        className="border-brand/50 text-brand-light hover:bg-brand/10 w-full rounded-xl border border-dashed px-4 py-3 text-left text-sm transition-all"
                      >
                        Use "{searchTerm}" as your university
                      </button>
                    </div>
                  )}
            </div>
          )}
        </div>
      </Section>

      {/* Subject Combinations */}
      <Section title="Subject combination">
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsCustomSubjectMode(false)}
            className={cn(
              "rounded-xl border py-3 text-sm font-bold transition-all",
              !isCustomSubjectMode
                ? "bg-brand border-brand shadow-brand/20 text-white"
                : "bg-bgSurface border-borderMuted text-textMuted",
            )}
          >
            Predefined
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCustomSubjectMode(true);
              if (!Array.isArray(form.subjectCombo)) {
                setForm((prev) => ({
                  ...prev,
                  subjectCombo: [
                    "English",
                    "Mathematics",
                    "Physics",
                    "Chemistry",
                  ],
                }));
              }
            }}
            className={cn(
              "rounded-xl border py-3 text-sm font-bold transition-all",
              isCustomSubjectMode
                ? "bg-brand border-brand shadow-brand/20 text-white"
                : "bg-bgSurface border-borderMuted text-textMuted",
            )}
          >
            Custom Combo
          </button>
        </div>

        {!isCustomSubjectMode && (
          <div className="grid grid-cols-1 gap-2">
            {SUBJECT_COMBOS.map((combo) => {
              const isSelected = form.subjectCombo === combo.id;
              const Icon = combo.icon;
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
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isSelected ? "text-brand-light" : "text-textMuted",
                    )}
                  />
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
        )}

        {isCustomSubjectMode && (
          <CustomSubjectSelector
            selectedSubjects={
              Array.isArray(form.subjectCombo)
                ? form.subjectCombo
                : ["English", "Mathematics", "Physics", "Chemistry"]
            }
            onChange={(subjects) => {
              setForm((prev) => ({
                ...prev,
                subjectCombo: subjects,
              }));
            }}
          />
        )}
      </Section>

      <div className="flex items-center gap-5">
        <Button
          variant={saved ? "success" : "primary"}
          className="md"
          disabled={!isDirty && !saved}
          onClick={handleSave}
        >
          {saved ? (
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4" /> Changes Saved
            </span>
          ) : (
            "Save Profile"
          )}
        </Button>
        {isDirty && (
          <button
            type="button"
            className="text-textDim hover:text-textMain text-sm transition-colors"
            onClick={() => {
              setForm({
                name,
                email,
                university,
                subjectCombo,
                targetScore,
                examYear,
                examDate,
              });
              setSearchTerm(university || "");
              setIsCustomSubjectMode(Array.isArray(subjectCombo));
            }}
          >
            Discard
          </button>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmComboChange}
        onClose={() => {
          setShowConfirmComboChange(false);
          setPendingFormUpdate(null);
        }}
        onConfirm={confirmComboChange}
        title="Change Subject Combo?"
        message="Your progress on existing subjects will be preserved. If you switch back to this combo later, your previous progress will be restored."
        confirmText="Change Combo"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
};

export default ProfileForm;