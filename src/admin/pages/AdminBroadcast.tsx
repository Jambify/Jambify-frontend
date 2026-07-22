// src/admin/pages/AdminBroadcast.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Megaphone, Loader2, Trash2, Send, Clock } from "lucide-react";
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

const AdminBroadcast: React.FC = () => {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [runningReminders, setRunningReminders] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [audience, setAudience] = useState<Announcement["target_audience"]>("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("announcements")
      .select("id, title, message, type, is_active, target_audience, target_user_id, created_at")
      .order("created_at", { ascending: false });
    setList((data ?? []) as Announcement[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("announcements").insert({
      title: title.trim(),
      message: message.trim(),
      type,
      target_audience: audience,
      created_by: user?.id,
    });
    if (!error) {
      setTitle("");
      setMessage("");
      setType("info");
      setAudience("all");
      load();
    }
    setSending(false);
  };

  const handleDeactivate = async (id: string) => {
    await supabase.from("announcements").update({ is_active: false }).eq("id", id);
    load();
  };

  // Manually trigger the "expiring within 7 days" reminder batch.
  // Safe to click repeatedly — reminder_sent_at prevents duplicates.
  const handleRunReminders = async () => {
    setRunningReminders(true);
    const { data, error } = await supabase.rpc("send_expiry_reminders");
    if (!error) {
      alert(`Sent ${data ?? 0} renewal reminder(s).`);
      load();
    } else {
      alert("Failed to send reminders: " + error.message);
    }
    setRunningReminders(false);
  };

  return (
    <div className="space-y-6">
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

        <div className="flex items-center gap-2">
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
          <button
            onClick={handleSend}
            disabled={sending || !title.trim() || !message.trim()}
            className="ml-auto bg-brand hover:bg-brand-light rounded-brand flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
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
      <div className="bg-bgCard border-borderMuted rounded-brand-lg border divide-y divide-borderMuted overflow-hidden">
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
    </div>
  );
};

export default AdminBroadcast;