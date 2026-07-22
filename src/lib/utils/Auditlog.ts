/**
 * src/admin/utils/auditLog.ts
 * ─────────────────────────────
 * Shared helper for writing to admin_audit_log.
 *
 * Deliberately fire-and-forget: a failed log write should never block the
 * actual admin action (e.g. don't fail a question delete just because the
 * log insert had a hiccup). Errors are logged to console only.
 *
 * Only call this for real state-changing actions (add/remove/update/delete/
 * status-change) — never for reads, searches, or filter changes. That's
 * what keeps the audit log meaningful instead of flooded.
 */

import { supabase } from "../../lib/supabase";

export async function logAdminAction(
  action: string,
  targetEmail: string,
  metadata: Record<string, any> = {},
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      console.warn("[auditLog] No authenticated user email — skipping log entry for:", action);
      return;
    }

    const { error } = await supabase.from("admin_audit_log").insert({
      admin_email: user.email,
      action,
      target_email: targetEmail,
      metadata,
    });

    if (error) {
      console.error("[auditLog] Failed to write audit entry:", error);
    }
  } catch (err) {
    console.error("[auditLog] Unexpected error writing audit entry:", err);
  }
}