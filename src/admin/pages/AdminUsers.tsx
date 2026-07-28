/**
 * src/admin/pages/AdminUsers.tsx
 * ───────────────────────────────
 * Users management panel.
 * Actions: search, filter by status, view profile,
 *          grant/revoke Pro, freeze/unfreeze, delete.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/utils/utils";
import {
  Search,
  RefreshCw,
  ChevronDown,
  Crown,
  ShieldOff,
  ShieldCheck,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  User,
  Mail,
  GraduationCap,
  Target,
  BookOpen,
  Calendar,
} from "lucide-react";
import { useUserStore } from "../../Store/useUserStore"; // Added this import!

// ── Types ─────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  name: string;
  email: string;
  university: string;
  subject_combo: string;
  target_score: string;
  exam_year: string;
  streak: number;
  overall_score: number;
  accuracy: number;
  questions_completed: number;
  is_pro: boolean;
  is_frozen: boolean;
  onboarding_complete: boolean;
  created_at: string;
}

type FilterStatus = "all" | "pro" | "free" | "frozen";
type ToastType = "success" | "error";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface PostgrestError {
  message: string;
}

// ── Toast helper ──────────────────────────────────────────────────────────────

const ToastBar: React.FC<{ toasts: Toast[]; remove: (id: number) => void }> = ({
  toasts,
  remove,
}) => (
  <div className="pointer-events-none fixed right-6 bottom-6 z-50 flex flex-col gap-2">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={cn(
          "rounded-brand-lg pointer-events-auto flex items-center gap-2.5 px-4 py-3 text-sm font-medium shadow-xl",
          "animate-in slide-in-from-bottom-2 duration-200",
          t.type === "success"
            ? "bg-success/10 border-success/30 text-success border"
            : "bg-danger/10 border-danger/30 text-danger border",
        )}
      >
        {t.type === "success" ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0" />
        )}
        <span>{t.message}</span>
        <button
          onClick={() => remove(t.id)}
          className="ml-2 opacity-60 hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    ))}
  </div>
);

// ── Stat mini card ────────────────────────────────────────────────────────────

const StatMini: React.FC<{
  label: string;
  value: string | number;
  color?: string;
}> = ({ label, value, color }) => (
  <div className="bg-bgCard border-borderMuted rounded-brand border p-3 text-center">
    <p
      className={cn(
        "font-display text-2xl font-black tracking-tight",
        color ?? "text-textMain",
      )}
    >
      {value}
    </p>
    <p className="text-textDim mt-0.5 text-[10px] tracking-widest uppercase">
      {label}
    </p>
  </div>
);

// ── User detail drawer ────────────────────────────────────────────────────────

const UserDrawer: React.FC<{
  user: AdminUser;
  onClose: () => void;
  onAction: (action: "pro" | "freeze" | "delete", user: AdminUser) => void;
  actionLoading: string | null;
}> = ({ user, onClose, onAction, actionLoading }) => {
  const loading = (a: string) => actionLoading === `${a}-${user.id}`;
  const { id: currentUserId } = useUserStore(); // Get current user's ID
  const isOwnAccount = currentUserId === user.id; // Check if it's the admin's own account

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-bgCard animate-in slide-in-from-right relative z-10 flex h-full w-full max-w-sm flex-col shadow-2xl duration-300">
        {/* Header */}
        <div className="border-borderMuted flex shrink-0 items-center justify-between border-b px-5 py-4">
          <h2 className="font-display text-base font-semibold">User Profile</h2>
          <button
            onClick={onClose}
            className="rounded-brand hover:bg-bgSurface text-textDim hover:text-textMain p-1.5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Identity */}
          <div className="flex items-center gap-3">
            <div className="bg-brand/15 border-brand/25 font-display text-brand-light flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-lg font-bold">
              {user.name ? user.name.slice(0, 2).toUpperCase() : "??"}
            </div>
            <div className="min-w-0">
              <p className="text-textMain truncate font-semibold">
                {user.name || "—"}
              </p>
              <p className="text-textDim truncate text-xs">{user.email}</p>
              <div className="mt-1 flex items-center gap-1.5">
                {user.is_pro && (
                  <span className="bg-warn/10 text-warn border-warn/20 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                    PRO
                  </span>
                )}
                {user.is_frozen && (
                  <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                    FROZEN
                  </span>
                )}
                {!user.onboarding_complete && (
                  <span className="bg-textDim/10 text-textDim border-borderMuted rounded-full border px-2 py-0.5 text-[10px] font-bold">
                    INCOMPLETE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatMini
              label="Best Score"
              value={user.overall_score}
              color="text-brand-light"
            />
            <StatMini
              label="Accuracy"
              value={`${user.accuracy ?? 0}%`}
              color="text-success"
            />
            <StatMini label="Questions" value={user.questions_completed} />
            <StatMini
              label="Streak"
              value={`${user.streak}d`}
              color="text-orange-400"
            />
          </div>

          {/* Profile info */}
          <div className="space-y-2.5">
            {[
              {
                icon: GraduationCap,
                label: "University",
                value: user.university || "—",
              },
              {
                icon: BookOpen,
                label: "Subjects",
                value: user.subject_combo || "—",
              },
              {
                icon: Target,
                label: "Target",
                value: user.target_score || "—",
              },
              {
                icon: Calendar,
                label: "Exam Year",
                value: user.exam_year || "—",
              },
              { icon: Mail, label: "Email", value: user.email },
              {
                icon: User,
                label: "Joined",
                value: new Date(user.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5 text-sm">
                <Icon className="text-textDim mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="text-textDim w-20 shrink-0">{label}</span>
                <span className="text-textMain wrap-break">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-borderMuted shrink-0 space-y-2 border-t p-4">
          {/* Grant / Revoke Pro */}
          <button
            onClick={() => onAction("pro", user)}
            disabled={!!actionLoading || isOwnAccount}
            className={cn(
              "rounded-brand flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all",
              isOwnAccount
                ? "bg-bgSurface text-textMuted border-borderMuted cursor-not-allowed opacity-50"
                : user.is_pro
                  ? "bg-warn/10 text-warn border-warn/20 hover:bg-warn/20 border"
                  : "bg-brand hover:bg-brand-light shadow-brand/20 text-white shadow-md",
            )}
          >
            {loading("pro") ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Crown className="h-4 w-4" />
            )}
            {isOwnAccount
              ? "Can't modify your own Pro access"
              : user.is_pro
                ? "Revoke Pro Access"
                : "Grant Pro Access"}
          </button>

          {/* Freeze / Unfreeze */}
          <button
            onClick={() => onAction("freeze", user)}
            disabled={!!actionLoading || isOwnAccount}
            className={cn(
              "rounded-brand flex w-full items-center justify-center gap-2 border py-2.5 text-sm font-semibold transition-all",
              isOwnAccount
                ? "bg-bgSurface text-textMuted border-borderMuted cursor-not-allowed opacity-50"
                : user.is_frozen
                  ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                  : "border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
            )}
          >
            {loading("freeze") ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : user.is_frozen ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <ShieldOff className="h-4 w-4" />
            )}
            {isOwnAccount
              ? "Can't modify your own account status"
              : user.is_frozen
                ? "Unfreeze Account"
                : "Freeze Account"}
          </button>

          {/* Delete */}
          <button
            onClick={() => onAction("delete", user)}
            disabled={!!actionLoading || isOwnAccount}
            className={cn(
              "rounded-brand text-danger border-danger/20 bg-danger/10 hover:bg-danger/20 flex w-full items-center justify-center gap-2 border py-2.5 text-sm font-semibold transition-all",
              isOwnAccount && "cursor-not-allowed opacity-50",
            )}
          >
            {loading("delete") ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isOwnAccount ? "Can't delete your own account" : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Delete confirmation modal ─────────────────────────────────────────────────

const DeleteConfirm: React.FC<{
  user: AdminUser;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ user, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div className="bg-bgCard border-danger/30 rounded-brand-xl animate-in fade-in zoom-in-95 relative z-10 w-full max-w-sm border p-6 shadow-2xl duration-200">
      <div className="bg-danger/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        <Trash2 className="text-danger h-5 w-5" />
      </div>
      <h3 className="font-display mb-1 text-center text-lg font-bold">
        Delete Account?
      </h3>
      <p className="text-textDim mb-1 text-center text-sm">
        You are about to permanently delete:
      </p>
      <p className="text-textMain mb-5 text-center text-sm font-semibold">
        {user.name} ({user.email})
      </p>
      <p className="text-danger bg-danger/10 border-danger/20 rounded-brand mb-5 border px-3 py-2 text-center text-xs">
        ⚠️ This cannot be undone. All their data, quiz history, and progress
        will be permanently erased.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="rounded-brand bg-bgSurface border-borderMuted text-textMuted hover:text-textMain flex-1 border py-2.5 text-sm font-semibold transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="rounded-brand bg-danger hover:bg-danger/90 flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Yes, Delete"
          )}
        </button>
      </div>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;
  const toastId = useRef(0);
  const { id: currentUserId } = useUserStore();

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const toast = useCallback((type: ToastType, message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  }, []);

  const removeToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Fetch users ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id, name, email, university, subject_combo,
          target_score, exam_year, streak, overall_score,
          accuracy, questions_completed, is_pro, is_frozen,
          onboarding_complete, created_at
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers((data ?? []) as AdminUser[]);
    } catch (err: unknown) {
      const error = err as PostgrestError;
      toast("error", error.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Filtered + searched users ──────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.university?.toLowerCase().includes(q);

    const matchesFilter =
      filter === "all"
        ? true
        : filter === "pro"
          ? u.is_pro
          : filter === "free"
            ? !u.is_pro
            : filter === "frozen"
              ? u.is_frozen
              : true;

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const stats = {
    total: users.length,
    pro: users.filter((u) => u.is_pro).length,
    free: users.filter((u) => !u.is_pro).length,
    frozen: users.filter((u) => u.is_frozen).length,
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const logAudit = async (
    action: string,
    target: AdminUser,
    metadata: Record<string, unknown> = {},
  ) => {
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser();
    await supabase.from("admin_audit_log").insert({
      admin_id: adminUser?.id,
      admin_email: adminUser?.email,
      action,
      target_user_id: target.id,
      target_email: target.email,
      metadata,
    });
  };

  const handleAction = async (
    action: "pro" | "freeze" | "delete",
    user: AdminUser,
  ) => {
    if (user.id === currentUserId) {
      toast("error", "You can't modify your own account!");
      return;
    }

    if (action === "delete") {
      setDeleteTarget(user);
      return;
    }

    const key = `${action}-${user.id}`;
    setActionLoading(key);

    try {
      if (action === "pro") {
        const newPro = !user.is_pro;

        // Always route through pro_users — the trigger keeps profiles.is_pro in sync.
        // No more direct writes to profiles.is_pro from the admin panel.
        if (newPro) {
          // NOTE: Date.now() below only ever executes when this async function
          // runs in response to the admin clicking "Grant Pro Access" (see
          // onAction={() => onAction("pro", user)} in UserDrawer above) — it
          // never runs during render. The purity rule's static analysis can't
          // see that this whole function is only reachable via onClick, so it
          // flags it conservatively; suppressing here is correct rather than
          // restructuring already-correct event-handler code.
          // eslint-disable-next-line react-hooks/purity -- runs only inside onClick handler, never during render
          const { error } = await supabase.from("pro_users").upsert(
            {
              user_id: user.id,
              email: user.email,
              status: "active",
              plan_type: "admin_grant",
              payment_reference: `admin-grant-${Date.now()}`,
              // eslint-disable-next-line react-hooks/purity -- runs only inside onClick handler, never during render
              expires_at: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
              ).toISOString(), // 30-day comp grant; adjust as needed
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );
          if (error) throw error;
        } else {
          // Row may not exist yet (e.g. never subscribed) — upsert is safe either way
          const { error } = await supabase.from("pro_users").upsert(
            {
              user_id: user.id,
              email: user.email,
              status: "inactive",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );
          if (error) throw error;
        }

        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, is_pro: newPro } : u)),
        );
        if (selected?.id === user.id)
          setSelected((prev) => (prev ? { ...prev, is_pro: newPro } : null));

        await logAudit(newPro ? "grant_pro" : "revoke_pro", user, {
          previous_status: user.is_pro,
        });

        toast(
          "success",
          `Pro ${newPro ? "granted" : "revoked"} for ${user.name}`,
        );
      }

      if (action === "freeze") {
        const newFrozen = !user.is_frozen;
        const { error } = await supabase
          .from("profiles")
          .update({ is_frozen: newFrozen })
          .eq("id", user.id);
        if (error) throw error;

        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, is_frozen: newFrozen } : u,
          ),
        );
        if (selected?.id === user.id)
          setSelected((prev) =>
            prev ? { ...prev, is_frozen: newFrozen } : null,
          );

        await logAudit(newFrozen ? "freeze" : "unfreeze", user);

        toast(
          "success",
          `Account ${newFrozen ? "frozen" : "unfrozen"}: ${user.name}`,
        );
      }
    } catch (err: unknown) {
      const error = err as PostgrestError;
      toast("error", error.message ?? "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.id === currentUserId) {
      toast("error", "You can't delete your own account!");
      setDeleteTarget(null);
      return;
    }

    const key = `delete-${deleteTarget.id}`;
    setActionLoading(key);
    try {
      // Log BEFORE deleting — target_user_id FK would otherwise dangle after cascade
      await logAudit("delete", deleteTarget, {
        was_pro: deleteTarget.is_pro,
        university: deleteTarget.university,
      });

      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;

      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) setSelected(null);
      toast("success", `Deleted: ${deleteTarget.name}`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const error = err as PostgrestError;
      toast("error", error.message ?? "Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatMini label="Total Users" value={stats.total} />
        <StatMini label="Pro Users" value={stats.pro} color="text-warn" />
        <StatMini
          label="Free Users"
          value={stats.free}
          color="text-brand-light"
        />
        <StatMini label="Frozen" value={stats.frozen} color="text-blue-400" />
      </div>

      {/* Controls */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative w-full min-w-0 flex-1 sm:max-w-sm">
          <Search className="text-textDim pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, university…"
            className="bg-bgSurface border-borderMuted rounded-brand text-textMain placeholder:text-textDim focus:border-brand w-full border py-2.5 pr-4 pl-9 text-sm transition-colors focus:outline-none"
          />
        </div>

        {/* Filter tabs */}
        <div className="bg-bgSurface border-borderMuted rounded-brand flex shrink-0 gap-1 border p-1">
          {(["all", "pro", "free", "frozen"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all",
                filter === f
                  ? "bg-bgCard text-textMain shadow-sm"
                  : "text-textDim hover:text-textMain",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="bg-bgSurface border-borderMuted rounded-brand text-textDim hover:text-textMain shrink-0 border p-2.5 transition-all"
          title="Refresh"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-bgCard border-borderMuted rounded-brand-lg overflow-hidden border">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="text-brand h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <User className="text-textDim h-10 w-10" />
            <p className="text-textDim text-sm">No users match your search</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-borderMuted bg-bgSurface/50 border-b">
                    {[
                      "User",
                      "University",
                      "Subjects",
                      "Score",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-textDim px-4 py-3 text-left text-[10px] font-bold tracking-widest uppercase first:pl-5 last:pr-5"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-borderMuted divide-y">
                  {paginated.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-bgSurface/40 group transition-colors"
                    >
                      {/* User */}
                      <td className="px-4 py-3 pl-5">
                        <button
                          onClick={() => setSelected(u)}
                          className="flex w-full items-center gap-2.5 text-left"
                        >
                          <div className="bg-brand/15 text-brand-light flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                            {u.name?.slice(0, 2).toUpperCase() ?? "??"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-textMain hover:text-brand-light max-w-40 truncate font-medium transition-colors">
                              {u.name || "—"}
                            </p>
                            <p className="text-textDim max-w-40 truncate text-[11px]">
                              {u.email}
                            </p>
                          </div>
                        </button>
                      </td>
                      {/* University */}
                      <td className="text-textMuted max-w-35 px-4 py-3">
                        <span className="block truncate">
                          {u.university || "—"}
                        </span>
                      </td>
                      {/* Subjects */}
                      <td className="text-textDim max-w-40 px-4 py-3">
                        <span className="block truncate text-xs">
                          {u.subject_combo || "—"}
                        </span>
                      </td>
                      {/* Score */}
                      <td className="px-4 py-3">
                        <span className="text-brand-light font-mono font-semibold">
                          {u.overall_score ?? 0}
                        </span>
                        <span className="text-textDim ml-1 text-xs">/ 400</span>
                      </td>
                      {/* Status badges */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.is_pro && (
                            <span className="bg-warn/10 text-warn border-warn/20 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                              PRO
                            </span>
                          )}
                          {u.is_frozen && (
                            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                              FROZEN
                            </span>
                          )}
                          {!u.is_pro && !u.is_frozen && (
                            <span className="bg-bgSurface text-textDim border-borderMuted rounded-full border px-2 py-0.5 text-[10px]">
                              FREE
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 pr-5">
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => handleAction("pro", u)}
                            title={u.is_pro ? "Revoke Pro" : "Grant Pro"}
                            className="rounded-brand hover:bg-warn/10 text-textDim hover:text-warn p-1.5 transition-all"
                          >
                            <Crown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleAction("freeze", u)}
                            title={u.is_frozen ? "Unfreeze" : "Freeze"}
                            className="rounded-brand text-textDim p-1.5 transition-all hover:bg-blue-500/10 hover:text-blue-400"
                          >
                            {u.is_frozen ? (
                              <ShieldCheck className="h-3.5 w-3.5" />
                            ) : (
                              <ShieldOff className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleAction("delete", u)}
                            title="Delete"
                            className="rounded-brand hover:bg-danger/10 text-textDim hover:text-danger p-1.5 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-borderMuted divide-y md:hidden">
              {paginated.map((u) => (
                <div
                  key={u.id}
                  className="hover:bg-bgSurface/40 flex items-center gap-3 px-4 py-3 transition-colors"
                >
                  <button
                    onClick={() => setSelected(u)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div className="bg-brand/15 text-brand-light flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                      {u.name?.slice(0, 2).toUpperCase() ?? "??"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-textMain truncate text-sm font-medium">
                        {u.name || "—"}
                      </p>
                      <p className="text-textDim truncate text-xs">{u.email}</p>
                      <div className="mt-0.5 flex gap-1">
                        {u.is_pro && (
                          <span className="bg-warn/10 text-warn rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                            PRO
                          </span>
                        )}
                        {u.is_frozen && (
                          <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-400">
                            FROZEN
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  <ChevronDown className="text-textDim h-4 w-4 shrink-0 -rotate-90" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-textDim text-xs">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""} · Page{" "}
            {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-bgSurface border-borderMuted rounded-brand text-textMuted hover:text-textMain border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="bg-bgSurface border-borderMuted rounded-brand text-textMuted hover:text-textMain border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* User drawer */}
      {selected && (
        <UserDrawer
          user={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
          actionLoading={actionLoading}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteConfirm
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={actionLoading === `delete-${deleteTarget.id}`}
        />
      )}

      {/* Toast notifications */}
      <ToastBar toasts={toasts} remove={removeToast} />
    </div>
  );
};

export default AdminUsers;