// src/admin/pages/AdminBroadcast.tsx
import React, { useEffect, useState } from "react";
import PageHelmet from "../../components/SEO/PageHelmet";
import { supabase } from "../../lib/supabase";
import { Megaphone, Loader2, Trash2, Send, Clock, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils/utils";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  is_active: boolean;
  target_audience: "all" | "pro" | "free";
  target_user_id: string | null;
  created_at: string;
  expires_at: string | null;
}

interface Toast {
  kind: "success" | "error";
  text: string;
}

const TYPES = [
  { value: "info", label: "Info", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "success", label: "Success", color: "text-success bg-success/10 border-success/20" },
  { value: "warning", label: "Warning", color: "text-warn bg-warn/10 border-warn/20" },
  { value: "urgent", label: "Urgent", color: "text-danger bg-danger/10 border-danger/20" },
];

const AUDIENCES: { value: Announcement["target_audience"]; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "pro", label: "Pro users" },
  { value: "free", label: "Free users" },
];

type DurationOption = "1d" | "3d" | "7d" | "30d" | "custom" | "none";

const DURATIONS: { value: DurationOption; label: string }[] = [
  { value: "1d", label: "1 day" },
  { value: "3d", label: "3 days" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "custom", label: "Pick date/time" },
  { value: "none", label: "No expiry" },
];

function durationToExpiresAt(duration: DurationOption, customValue: string): string | null {
  if (duration === "none") return null;
  if (duration === "custom") {
    if (!customValue) return null;
    // datetime-local has no timezone info — the browser parses it as the
    // admin's local time, which is what we want (e.g. "12AM tonight, Lagos time")
    return new Date(customValue).toISOString();
  }
  const days = { "1d": 1, "3d": 3, "7d": 7, "30d": 30 }[duration];
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// Default the custom picker to "tonight at 23:59" local time — the
// common case from your example ("upgrade done by 12AM today")
function defaultCustomValue(): string {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatExpiry(expires_at: string | null): string {
  if (!expires_at) return "No expiry";
  const d = new Date(expires_at);
  const isPast = d.getTime() <= Date.now();
  const label = d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return isPast ? `Expired ${label}` : `Expires ${label}`;
}

const PAGE_SIZE = 15;

const AdminBroadcast: React.FC = () => {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sending, setSending] = useState(false);
  const [runningReminders, setRunningReminders] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [audience, setAudience] = useState<Announcement["target_audience"]>("all");
  const [duration, setDuration] = useState<DurationOption>("7d");
  const [customValue, setCustomValue] = useState<string>(defaultCustomValue());
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("announcements")
      .select("id, title, message, type, is_active, target_audience, target_user_id, created_at, expires_at")
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1);
    const rows = (data ?? []) as Announcement[];
    setList(rows);
    setHasMore(rows.length === PAGE_SIZE);
    setLoading(false);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    const { data } = await supabase
      .from("announcements")
      .select("id, title, message, type, is_active, target_audience, target_user_id, created_at, expires_at")
      .order("created_at", { ascending: false })
      .range(list.length, list.length + PAGE_SIZE - 1);
    const rows = (data ?? []) as Announcement[];
    setList((prev) => [...prev, ...rows]);
    setHasMore(rows.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    if (duration === "custom" && !customValue) {
      setToast({ kind: "error", text: "Pick an expiry date/time first." });
      return;
    }
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("announcements").insert({
      title: title.trim(),
      message: message.trim(),
      type,
      target_audience: audience,
      created_by: user?.id,
      expires_at: durationToExpiresAt(duration, customValue),
    });
    if (!error) {
      setTitle("");
      setMessage("");
      setType("info");
      setAudience("all");
      setDuration("7d");
      setCustomValue(defaultCustomValue());
      setToast({ kind: "success", text: "Announcement sent." });
      load();
    } else {
      setToast({ kind: "error", text: "Failed to send: " + error.message });
    }
    setSending(false);
  };

  const handleDeactivate = async (id: string) => {
    await supabase.from("announcements").update({ is_active: false }).eq("id", id);
    setToast({ kind: "success", text: "Announcement deactivated." });
    load();
  };

  const handleRunReminders = async () => {
    setRunningReminders(true);
    const { data, error } = await supabase.rpc("send_expiry_reminders");
    if (!error) {
      const count = data ?? 0;
      setToast({
        kind: "success",
        text: count > 0
          ? `Sent ${count} renewal reminder${count === 1 ? "" : "s"}.`
          : "No Pro users are due for a reminder right now.",
      });
      load();
    } else {
      setToast({ kind: "error", text: "Failed to send reminders: " + error.message });
    }
    setRunningReminders(false);
  };

  return (
    <div className="space-y-6 relative">
      <PageHelmet
        title="Admin Broadcasts | SCHOOLDRA"
        description="Create and manage announcements targeted to Schooldra users, schedule expiries, and send reminders to Pro users."
        canonical="https://www.schooldra.com/admin/broadcast"
      />
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-brand-lg border px-4 py-3 text-sm font-medium shadow-lg max-w-[90vw]",
            toast.kind === "success"
              ? "bg-success/10 border-success/30 text-success"
              : "bg-danger/10 border-danger/30 text-danger",
          )}
        >
          {toast.kind === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Composer */}
      <div className="bg-bgCard border-borderMuted rounded-brand-lg border p-5 space-y-3">
        <p className="text-textDim text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
          <Megaphone className="w-3.5 h-3.5" /> New Announcement
        </p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. Scheduled maintenance)"
          className="bg-bgSurface border-borderMuted rounded-brand text-textMain placeholder:text-textDim w-full border px-3 py-2.5 text-sm outline-none focus:border-brand"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message shown to students…"
          rows={3}
          className="bg-bgSurface border-borderMuted rounded-brand text-textMain placeholder:text-textDim w-full border px-3 py-2.5 text-sm outline-none focus:border-brand resize-none"
        />

        <div className="flex items-center gap-2 flex-wrap">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-bold transition-all",
                type === t.value ? t.color : "text-textDim border-borderMuted bg-bgSurface",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-textDim text-[10px] font-bold uppercase tracking-widest mr-1">
            Show to:
          </span>
          {AUDIENCES.map((a) => (
            <button
              key={a.value}
              onClick={() => setAudience(a.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-bold transition-all",
                audience === a.value
                  ? "text-brand-light bg-brand/10 border-brand/20"
                  : "text-textDim border-borderMuted bg-bgSurface",
              )}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-textDim text-[10px] font-bold uppercase tracking-widest mr-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Expires:
            </span>
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-bold transition-all",
                  duration === d.value
                    ? d.value === "none"
                      ? "text-danger bg-danger/10 border-danger/20"
                      : "text-brand-light bg-brand/10 border-brand/20"
                    : "text-textDim border-borderMuted bg-bgSurface",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Custom date/time picker — only shown when "Pick date/time" is selected */}
          {duration === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="bg-bgSurface border-borderMuted rounded-brand text-textMain w-full max-w-xs border px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <span className="text-textDim text-[10px]">
                Your local time ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={sending || !title.trim() || !message.trim()}
            className="bg-brand hover:bg-brand-light rounded-brand flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </button>
        </div>
      </div>

      {/* Renewal reminders */}
      <div className="bg-bgCard border-borderMuted rounded-brand-lg border p-5 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-textMain text-sm font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-warn" /> Renewal Reminders
          </p>
          <p className="text-textDim text-xs mt-0.5">
            Sends a renewal notice to every Pro user expiring within 7 days who hasn't already been reminded.
          </p>
        </div>
        <button
          onClick={handleRunReminders}
          disabled={runningReminders}
          className="bg-warn/10 border border-warn/20 text-warn hover:bg-warn/20 rounded-brand flex items-center gap-2 px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {runningReminders ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send Reminders Now
        </button>
      </div>

      {/* List */}
      <div className="bg-bgCard border-borderMuted rounded-brand-lg border overflow-hidden">
        <div className="max-h-130 overflow-y-auto divide-y divide-borderMuted">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-brand" />
            </div>
          ) : list.length === 0 ? (
            <p className="text-textDim text-sm text-center py-10">No announcements yet</p>
          ) : (
            list.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-textMain text-sm font-semibold truncate">{a.title}</p>
                  <p className="text-textDim text-xs mt-0.5 line-clamp-2">{a.message}</p>
                  <p className="text-textDim text-[10px] mt-1 flex items-center gap-2 flex-wrap">
                    <span>
                      {new Date(a.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {!a.is_active && " · inactive"}
                    </span>
                    <span className="rounded-full border border-borderMuted bg-bgSurface px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-textDim">
                      {a.target_user_id
                        ? "Individual reminder"
                        : a.target_audience === "all"
                          ? "Everyone"
                          : a.target_audience === "pro"
                            ? "Pro only"
                            : "Free only"}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                        !a.expires_at
                          ? "border-danger/20 bg-danger/10 text-danger"
                          : "border-borderMuted bg-bgSurface text-textDim",
                      )}
                    >
                      {formatExpiry(a.expires_at)}
                    </span>
                  </p>
                </div>
                {a.is_active && (
                  <button
                    onClick={() => handleDeactivate(a.id)}
                    className="text-textDim hover:text-danger p-1.5 shrink-0"
                    title="Deactivate"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {!loading && hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-textDim hover:text-textMain border-t border-borderMuted disabled:opacity-50"
          >
            {loadingMore ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            Load more
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminBroadcast;