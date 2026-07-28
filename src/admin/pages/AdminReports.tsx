/**
 * src/admin/pages/AdminReports.tsx
 * ─────────────────────────────────────
 * Admin view to monitor and resolve student-flagged question reports.
 *
 * FIX: `question_reports.reported_by` has a FK to `auth.users`, not to
 * `public.profiles`, so PostgREST has no relationship to walk for an
 * embedded `profiles:reported_by(...)` select — that's the
 * "Could not find a relationship between 'question_reports' and 'reported_by'"
 * error. Instead of adding a new FK via SQL, we fetch profiles in a second
 * query (by the list of reporter ids) and merge them in JS below.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/utils/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Loader2,
  Search,
  X,
  Check,
  Ban,
} from "lucide-react";

interface QuestionReport {
  id: string;
  question_id: string;
  reported_by: string | null;
  reason: string;
  details: string | null;
  context: string;
  status: "open" | "reviewed" | "fixed" | "dismissed";
  created_at: string;
  questions?: {
    id: string;
    subject: string;
    topic: string | null;
    year: number | null;
    text: string;
    options: string[];
    answer: number;
  };
  profiles?: {
    name: string | null;
    university: string | null;
  };
}

type ToastType = "success" | "error";
interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ReporterProfile {
  id: string;
  name: string | null;
  university: string | null;
}

interface PostgrestError {
  message: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-warn/10 text-warn border-warn/30",
  reviewed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  fixed: "bg-success/10 text-success border-success/30",
  dismissed: "bg-bgSurface text-textDim border-borderMuted",
};

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

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

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      // 1) Fetch reports + their embedded question (this FK is fine —
      //    question_reports.question_id -> questions.id exists).
      const { data: reportsData, error: reportsError } = await supabase
        .from("question_reports")
        .select(
          `
          id,
          question_id,
          reported_by,
          reason,
          details,
          context,
          status,
          created_at,
          questions:question_id (
            id, subject, topic, year, text, options, answer
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (reportsError) throw reportsError;

      const rows = (reportsData ?? []) as unknown as QuestionReport[];

      // 2) Separately fetch the reporting students' profiles, then merge
      //    in JS — this sidesteps the missing profiles FK entirely.
      const reporterIds = Array.from(
        new Set(
          rows.map((r) => r.reported_by).filter((id): id is string => !!id),
        ),
      );

      let profileMap = new Map<
        string,
        { name: string | null; university: string | null }
      >();

      if (reporterIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, university")
          .in("id", reporterIds);

        if (profilesError) throw profilesError;

        profileMap = new Map(
          (profilesData ?? []).map((p: ReporterProfile) => [
            p.id,
            { name: p.name, university: p.university },
          ]),
        );
      }

      const merged = rows.map((r) => ({
        ...r,
        profiles: r.reported_by ? profileMap.get(r.reported_by) : undefined,
      }));

      setReports(merged);
    } catch (err: unknown) {
      const error = err as PostgrestError;
      toast("error", error.message ?? "Failed to load question reports");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateStatus = async (
    id: string,
    newStatus: QuestionReport["status"],
  ) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("question_reports")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
      );
      toast("success", `Report marked as ${newStatus}`);
    } catch (err: unknown) {
      const error = err as PostgrestError;
      toast("error", error.message ?? "Failed to update report status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = reports.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const qText = r.questions?.text ?? "";
    const details = r.details ?? "";
    const reason = r.reason ?? "";
    const matchesSearch =
      !search ||
      qText.toLowerCase().includes(search.toLowerCase()) ||
      details.toLowerCase().includes(search.toLowerCase()) ||
      reason.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Flagged Questions
          </h2>
          <p className="text-textDim text-sm">
            Review student flags regarding incorrect or unclear test content.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full min-w-0 flex-1 sm:max-w-sm">
          <Search className="text-textDim pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report details or question text…"
            className="bg-bgSurface border-borderMuted text-textMain placeholder:text-textDim focus:border-brand w-full rounded-lg border py-2.5 pr-4 pl-9 text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-textDim h-4 w-4 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-bgSurface border-borderMuted text-textMain focus:border-brand rounded-lg border px-3 py-2.5 text-sm outline-none"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="reviewed">Reviewed</option>
            <option value="fixed">Fixed</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-bgCard border-borderMuted overflow-hidden rounded-xl border">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="text-brand h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertTriangle className="text-textDim h-10 w-10" />
            <p className="text-textDim text-sm">No question reports found</p>
          </div>
        ) : (
          <div className="divide-borderMuted divide-y">
            {filtered.map((report) => (
              <div key={report.id} className="space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                        STATUS_COLORS[report.status] ||
                          "bg-bgSurface text-textMain",
                      )}
                    >
                      {report.status}
                    </span>
                    <span className="bg-brand/10 text-brand-light rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                      {report.reason.replace("_", " ")}
                    </span>
                    <span className="bg-bgSurface text-textDim rounded-full px-2 py-0.5 text-[10px]">
                      Context: {report.context}
                    </span>
                  </div>
                  <span className="text-textDim text-xs">
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                </div>

                {/* Question Info Box */}
                {report.questions ? (
                  <div className="bg-bgSurface border-borderMuted space-y-2 rounded-lg border p-4">
                    <div className="text-textDim flex items-center justify-between text-xs">
                      <span className="text-textMain font-semibold">
                        {report.questions.subject}{" "}
                        {report.questions.year
                          ? `(${report.questions.year})`
                          : ""}
                        {report.questions.topic
                          ? ` · ${report.questions.topic}`
                          : ""}
                      </span>
                      <span className="text-success font-medium">
                        Correct Option:{" "}
                        {String.fromCharCode(65 + report.questions.answer)}
                      </span>
                    </div>
                    <p className="text-textMain text-sm font-medium">
                      {report.questions.text}
                    </p>
                    <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                      {report.questions.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "rounded border px-3 py-1.5 text-xs",
                            idx === report.questions?.answer
                              ? "bg-success/10 border-success/30 text-success font-semibold"
                              : "bg-bgCard border-borderMuted text-textDim",
                          )}
                        >
                          {String.fromCharCode(65 + idx)}. {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-danger text-xs italic">
                    Referenced question has been deleted from the database.
                  </p>
                )}

                {/* Report Details & Reporter */}
                <div className="flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-textDim space-y-1">
                    {report.details && (
                      <p className="text-textMain bg-bgSurface/50 border-borderMuted rounded border p-2 italic">
                        &ldquo;{report.details}&rdquo;
                      </p>
                    )}
                    <p>
                      Reported by:{" "}
                      <span className="text-textMain font-medium">
                        {report.profiles?.name ?? "Anonymous Student"}
                      </span>{" "}
                      {report.profiles?.university
                        ? `(${report.profiles.university})`
                        : ""}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    {updatingId === report.id ? (
                      <Loader2 className="text-brand h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {report.status !== "reviewed" && (
                          <button
                            onClick={() => updateStatus(report.id, "reviewed")}
                            className="bg-bgSurface border-borderMuted text-textMuted hover:text-textMain rounded-lg border px-2.5 py-1.5 font-semibold"
                          >
                            Mark Reviewed
                          </button>
                        )}
                        {report.status !== "fixed" && (
                          <button
                            onClick={() => updateStatus(report.id, "fixed")}
                            className="bg-success/10 text-success border-success/30 hover:bg-success/20 flex items-center gap-1 rounded-lg border px-2.5 py-1.5 font-semibold"
                          >
                            <Check className="h-3 w-3" /> Mark Fixed
                          </button>
                        )}
                        {report.status !== "dismissed" && (
                          <button
                            onClick={() => updateStatus(report.id, "dismissed")}
                            className="bg-bgSurface border-borderMuted text-textDim hover:text-danger flex items-center gap-1 rounded-lg border px-2.5 py-1.5 font-semibold"
                          >
                            <Ban className="h-3 w-3" /> Dismiss
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast container */}
      <div className="pointer-events-none fixed right-6 bottom-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "rounded-brand-lg pointer-events-auto flex items-center gap-2.5 px-4 py-3 text-sm font-medium shadow-xl",
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
              onClick={() => removeToast(t.id)}
              className="ml-2 opacity-60 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReports;
