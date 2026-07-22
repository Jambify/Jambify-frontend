// src/components/AnnouncementBanner.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { X, Megaphone } from "lucide-react";
import { cn } from "../../lib/utils/utils";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
}

const TYPE_STYLES: Record<string, string> = {
  info: "border-blue-500/20 bg-blue-500/10",
  success: "border-success/20 bg-success/10",
  warning: "border-warn/20 bg-warn/10",
  urgent: "border-danger/20 bg-danger/10",
};

const AnnouncementBanner: React.FC = () => {
  const [queue, setQueue] = useState<Announcement[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Determine whether this user currently has an active Pro subscription
      const { data: proRow } = await supabase
        .from("pro_users")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      const isPro = !!proRow;
      const audienceKey = isPro ? "pro" : "free";

      // Fetch announcements that are either:
      //  - targeted directly at this user (individual reminders), or
      //  - broadcast to "all", or to this user's audience segment
      const { data: announcements } = await supabase
        .from("announcements")
        .select("id, title, message, type, is_active, target_audience, target_user_id, created_at")
        .eq("is_active", true)
        .or(`target_user_id.eq.${user.id},and(target_user_id.is.null,target_audience.eq.all),and(target_user_id.is.null,target_audience.eq.${audienceKey})`)
        .order("created_at", { ascending: false });

      const { data: dismissed } = await supabase
        .from("announcement_dismissals")
        .select("announcement_id")
        .eq("user_id", user.id);

      const dismissedIds = new Set((dismissed ?? []).map((d) => d.announcement_id));
      setQueue((announcements ?? []).filter((a) => !dismissedIds.has(a.id)));
    }
    load();
  }, []);

  const dismiss = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("announcement_dismissals").insert({ announcement_id: id, user_id: user.id });
    }
    setQueue((prev) => prev.filter((a) => a.id !== id));
  };

  if (queue.length === 0) return null;
  const current = queue[0];

  return (
    <div className={cn("rounded-brand-lg border p-4 mb-4 flex items-start gap-3", TYPE_STYLES[current.type] ?? TYPE_STYLES.info)}>
      <Megaphone className="w-4 h-4 mt-0.5 shrink-0 text-textMain" />
      <div className="min-w-0 flex-1">
        <p className="text-textMain text-sm font-semibold">{current.title}</p>
        <p className="text-textMuted text-xs mt-0.5">{current.message}</p>
      </div>
      <button onClick={() => dismiss(current.id)} className="text-textDim hover:text-textMain shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AnnouncementBanner;