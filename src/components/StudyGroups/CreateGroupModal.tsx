import React, { useState } from "react";
import { useGroupStore } from "../../Store/useGroupStore";
import Button from "../ui/Button";
import { cn } from "../../lib/utils";

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
const ICONS = ["📚", "⚡", "🧬", "⚗️", "🔢", "📖", "🏆", "🎯"];

const CreateGroupModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { createGroup } = useGroupStore();
  const [form, setForm] = useState({
    name: "",
    description: "",
    subject: "Mixed",
    icon: "📚",
  });
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!form.name.trim()) {
      setError("Group name is required");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required");
      return;
    }
    createGroup(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-6 w-full max-w-md animate-fadeIn shadow-card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-bold tracking-tight">
            Create a group
          </h3>
          <button
            onClick={onClose}
            className="text-textDim hover:text-textMain text-lg"
          >
            ✕
          </button>
        </div>

        {/* <Icon picker */}
        <div className="mb-4">
          <label className="block text-[11px] text-textDim uppercase tracking-widest font-medium mb-2">
            Icon
          </label>
          <div className="flex gap-2 flex-wrap">
            {ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setForm((f) => ({ ...f, icon }))}
                className={cn(
                  "w-9 h-9 rounded-brand text-lg transition-all border",
                  form.icon === icon
                    ? "bg-brand/10 border-brand scale-110"
                    : "bg-bgSurface border-borderMuted hover:border-white/15",
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* <Name */}
        <div className="mb-4">
          <label className="block text-[11px] text-textDim uppercase tracking-widest font-medium mb-2">
            Group name
          </label>
          <input
            autoFocus
            type="text"
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }));
              setError("");
            }}
            placeholder="e.g. UNILAG Chemistry Squad"
            className="w-full px-4 py-2.5 bg-bgSurface border border-borderMuted rounded-brand text-sm text-textMain placeholder:text-textDim focus:outline-none focus:border-brand/40 transition-colors"
          />
        </div>

        {/* <Subject */}
        <div className="mb-4">
          <label className="block text-[11px] text-textDim uppercase tracking-widest font-medium mb-2">
            Subject focus
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setForm((f) => ({ ...f, subject: s }))}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  form.subject === s
                    ? "bg-brand border-brand text-white"
                    : "bg-bgSurface border-borderMuted text-textMuted hover:border-white/15 hover:text-textMain",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="block text-[11px] text-textDim uppercase tracking-widest font-medium mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => {
              setForm((f) => ({ ...f, description: e.target.value }));
              setError("");
            }}
            placeholder="What's this group about?"
            rows={3}
            className="w-full px-4 py-2.5 bg-bgSurface border border-borderMuted rounded-brand text-sm text-textMain placeholder:text-textDim focus:outline-none focus:border-brand/40 transition-colors resize-none"
          />
        </div>

        {error && <p className="text-xs text-danger mb-3">{error}</p>}

        <div className="flex gap-2">
          <Button variant="secondary" size="md" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" fullWidth onClick={handleCreate}>
            Create group
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
