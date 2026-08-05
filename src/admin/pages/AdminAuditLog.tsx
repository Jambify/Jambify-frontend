/**
 * src/admin/pages/AdminAuditLog.tsx
 * ───────────────────────────────────
 * Read-only feed of every admin action.
 */

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Loader2, Crown, ShieldOff, ShieldCheck, Trash2, Clock,
  UserPlus, UserMinus, Flag, FilePlus, FileEdit, FileX,
} from "lucide-react";
import PageHelmet from "../../components/SEO/PageHelmet";
import { cn } from "../../lib/utils/utils";

interface AuditEntry {
  id: string;
  admin_email: string;
  action: string;
  target_email: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

const ACTION_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  grant_pro: { label: "Granted Pro", icon: <Crown className="h-3.5 w-3.5" />, color: "text-warn bg-warn/10 border-warn/20" },
  revoke_pro: { label: "Revoked Pro", icon: <Crown className="h-3.5 w-3.5" />, color: "text-textDim bg-bgSurface border-borderMuted" },
  freeze: { label: "Froze Account", icon: <ShieldOff className="h-3.5 w-3.5" />, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  unfreeze: { label: "Unfroze Account", icon: <ShieldCheck className="h-3.5 w-3.5" />, color: "text-success bg-success/10 border-success/20" },
  delete: { label: "Deleted Account", icon: <Trash2 className="h-3.5 w-3.5" />, color: "text-danger bg-danger/10 border-danger/20" },
  admin_added: { label: "Added Admin", icon: <UserPlus className="h-3.5 w-3.5" />, color: "text-brand-light bg-brand/10 border-brand/20" },
  admin_removed: { label: "Removed Admin", icon: <UserMinus className="h-3.5 w-3.5" />, color: "text-danger bg-danger/10 border-danger/20" },
  report_status_change: { label: "Updated Report", icon: <Flag className="h-3.5 w-3.5" />, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  question_added: { label: "Added Question", icon: <FilePlus className="h-3.5 w-3.5" />, color: "text-success bg-success/10 border-success/20" },
  question_updated: { label: "Edited Question", icon: <FileEdit className="h-3.5 w-3.5" />, color: "text-warn bg-warn/10 border-warn/20" },
  question_deleted: { label: "Deleted Question", icon: <FileX className="h-3.5 w-3.5" />, color: "text-danger bg-danger/10 border-danger/20" },
};

const AdminAuditLog: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("admin_audit_log")
        .select("id, admin_email, action, target_email, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!error) setEntries((data ?? []) as AuditEntry[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <>
        <PageHelmet
          title="Admin Audit Log | SCHOOLDRA"
          description="Read-only feed of administrative actions: grants, revocations, deletions, and question edits."
          canonical="https://www.schooldra.com/admin/audit-log"
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      </>
    );
  }

  if (entries.length === 0) {
    return (
      <>
        <PageHelmet
          title="Admin Audit Log | SCHOOLDRA"
          description="Read-only feed of administrative actions: grants, revocations, deletions, and question edits."
          canonical="https://www.schooldra.com/admin/audit-log"
        />
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Clock className="text-textDim h-10 w-10" />
          <p className="text-textDim text-sm">No admin actions logged yet</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHelmet
        title="Admin Audit Log | SCHOOLDRA"
        description="Read-only feed of administrative actions: grants, revocations, deletions, and question edits."
        canonical="https://www.schooldra.com/admin/audit-log"
      />
      <div className="bg-bgCard border-borderMuted rounded-brand-lg divide-borderMuted divide-y border overflow-hidden">
      {entries.map((e) => {
        const meta = ACTION_META[e.action] ?? {
          label: e.action,
          icon: <Clock className="h-3.5 w-3.5" />,
          color: "text-textDim bg-bgSurface border-borderMuted",
        };
        return (
          <div key={e.id} className="flex items-center gap-3 px-4 py-3">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold shrink-0", meta.color)}>
              {meta.icon} {meta.label}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-textMain text-sm truncate">
                <span className="text-textDim">{e.admin_email}</span> → {e.target_email}
              </p>
            </div>
            <span className="text-textDim text-[11px] shrink-0">
              {new Date(e.created_at).toLocaleString("en-GB", {
                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>
        );
      })}
      </div>
    </>
  );
};

export default AdminAuditLog;