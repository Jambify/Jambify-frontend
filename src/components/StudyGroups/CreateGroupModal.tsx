import React, { useState } from "react";
import { useGroupStore } from "../../Store/useGroupStore";
import Button from "../ui/Button";
import { cn } from "../../lib/utils/utils";
import { X, Users, Loader2 } from "lucide-react";

const SUBJECTS = [
  "Mixed",
  "English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Literature",
  "Economics",
  "Government",
  "CRS/IRS",
  "History",
];

const ICONS: Record<string, string> = {
  Mixed: "📑",
  English: "📖",
  Mathematics: "🔢",
  Physics: "⚡",
  Chemistry: "⚗️",
  Biology: "🧬",
  Literature: "📚",
  Economics: "📊",
  Government: "🏛️",
  "CRS/IRS": "✝️",
  History: "📜",
};

const CreateGroupModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { createGroup, loading } = useGroupStore();
  const [form, setForm] = useState({
    name: "",
    description: "",
    subject: "Mixed",
    icon: ICONS.Mixed,
  });
  const [error, setError] = useState("");

  const update = (k: string, v: string) =>
    setForm((f) => ({
      ...f,
      [k]: v,
      ...(k === "subject" ? { icon: ICONS[v] } : {}),
    }));

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setError("Group name is required");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required");
      return;
    }
    await createGroup(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-bgCard border-borderMuted rounded-brand-xl shadow-card w-full max-w-md border p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold tracking-tight">
            Create a group
          </h3>
          <button
            onClick={onClose}
            className="text-textDim hover:text-textMain transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* <Subject picker doubles as icon picker */}
        <div className="mb-4">
          <label className="text-textDim mb-2 block text-[11px] font-medium tracking-widest uppercase">
            Subject focus
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => update("subject", s)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  form.subject === s
                    ? "bg-brand border-brand text-white"
                    : "bg-bgSurface border-borderMuted text-textMuted hover:text-textMain",
                )}
              >
                {ICONS[s]} {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-textDim mb-2 block text-[11px] font-medium tracking-widest uppercase">
            Group name
          </label>
          <input
            autoFocus
            type="text"
            value={form.name}
            onChange={(e) => {
              update("name", e.target.value);
              setError("");
            }}
            placeholder="e.g. UNILAG Chemistry Squad"
            style={{ fontSize: "16px" }}
            className="bg-bgSurface border-borderMuted rounded-brand text-textMain placeholder:text-textDim focus:border-brand/40 w-full border px-4 py-2.5 text-sm transition-colors focus:outline-none"
          />
        </div>

        <div className="mb-5">
          <label className="text-textDim mb-2 block text-[11px] font-medium tracking-widest uppercase">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => {
              update("description", e.target.value);
              setError("");
            }}
            placeholder="What's this group about?"
            rows={3}
            style={{ fontSize: "16px" }}
            className="bg-bgSurface border-borderMuted rounded-brand text-textMain placeholder:text-textDim focus:border-brand/40 w-full resize-none border px-4 py-2.5 text-sm transition-colors focus:outline-none"
          />
        </div>

        {error && <p className="text-danger mb-3 text-xs">{error}</p>}

        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating…
              </>
            ) : (
              <>
                <Users className="h-4 w-4" /> Create group
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
