import { useEffect, useRef, useState } from "react";
import { useUserStore } from "../Store/useUserStore";
import { supabase } from "../lib/supabase";

export type ProStatusState =
  | "active"
  | "expiring_soon"
  | "expired_natural"
  | "expired_admin_grant"
  | "revoked_early"
  | "payment_failed"
  | "inactive"
  | "none";

export type ProStatusAction =
  | "renew"
  | "contact_support"
  | "try_again"
  | null;

interface ProStatusInfo {
  isActive: boolean;
  status: ProStatusState;
  message: string;
  shortMessage: string;
  showAlert: boolean;
  expiresAt: Date | null;
  /** Which CTA to render next to the banner message */
  primaryAction: ProStatusAction;
  /** pro_users row id — used to scope localStorage dismissal per event */
  proRowId: string | null;
}

interface ProRow {
  id: string;
  status: "active" | "inactive" | "expired" | string;
  plan_type: string | null;
  payment_reference: string | null;
  expires_at: string | Date | null;
  updated_at: string | Date | null;
  created_at: string | Date | null;
}

const toDate = (v: string | Date | null): Date | null => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const fmt = (d: Date | null): string => {
  if (!d) return "";
  try {
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(d);
  }
};

const MS_PER_DAY = 86_400_000;

export const useProStatus = (): ProStatusInfo => {
  const userId = useUserStore((s) => s.id);
  const downgradeToPro = useUserStore((s) => s.downgradeToPro);
  const storeIsPro = useUserStore((s) => s.isPro);

  const [info, setInfo] = useState<ProStatusInfo>({
    isActive: storeIsPro,
    status: "none",
    message: "",
    shortMessage: "",
    showAlert: false,
    expiresAt: null,
    primaryAction: null,
    proRowId: null,
  });

  // Guards the stale-row DB sync so it only fires once per mount, not
  // repeatedly if a store update causes re-renders mid-effect.
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      hasSyncedRef.current = false;
      setInfo({
        isActive: false,
        status: "none",
        message: "",
        shortMessage: "",
        showAlert: false,
        expiresAt: null,
        primaryAction: null,
        proRowId: null,
      });
      return;
    }

    const check = async () => {
      const { data: proRow } = await supabase
        .from("pro_users")
        .select(
          "id, status, plan_type, payment_reference, expires_at, updated_at, created_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (!proRow) {
        hasSyncedRef.current = false;
        setInfo({
          isActive: false,
          status: "none",
          message: "",
          shortMessage: "",
          showAlert: false,
          expiresAt: null,
          primaryAction: null,
          proRowId: null,
        });
        return;
      }

      const row = proRow as ProRow;
      const rowId = row.id;
      const now = new Date();
      const expiresAt = toDate(row.expires_at);
      const updatedAt = toDate(row.updated_at);
      const planType = (row.plan_type ?? "").toLowerCase();
      const paymentRef = row.payment_reference ?? "";
      const isAdminGrant =
        paymentRef.startsWith("admin-grant-") || planType === "admin_grant";
      const paidPlan =
        planType === "monthly" ||
        planType === "yearly" ||
        planType === "lifetime" ||
        planType === "quarterly" ||
        planType === "annual";

      // ───────────────────────────────────────────────────────
      // 1 & 2 — status === "active"
      // ───────────────────────────────────────────────────────
      if (row.status === "active") {
        if (expiresAt && expiresAt.getTime() > now.getTime()) {
          const msLeft = expiresAt.getTime() - now.getTime();
          const daysLeft = Math.ceil(msLeft / MS_PER_DAY);
          const expiringSoon = daysLeft <= 3;
          const shortMsg = expiringSoon
            ? `Pro expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
            : "Pro Active";
          const msg = expiringSoon
            ? `Your Schooldra Pro access expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"
            } (${fmt(expiresAt)}). Renew now to keep access.`
            : `Pro access is active until ${fmt(expiresAt)}.`;
          setInfo({
            isActive: true,
            status: expiringSoon ? "expiring_soon" : "active",
            message: msg,
            shortMessage: shortMsg,
            showAlert: expiringSoon,
            expiresAt,
            primaryAction: expiringSoon ? "renew" : null,
            proRowId: rowId,
          });
          return;
        }

        // 2 — stale row: status is "active" but expires_at is in the past.
        //     Background-sync the database state, store-correct is_pro,
        //     then fall through to expired-handling below for messaging.
        try {
          await supabase
            .from("pro_users")
            .update({ status: "expired" })
            .eq("user_id", userId);
          await supabase
            .from("profiles")
            .update({ is_pro: false })
            .eq("id", userId);
          if (!cancelled) downgradeToPro();
        } catch (err) {
          console.error("[useProStatus] stale sync failed:", err);
        }
        if (cancelled) return;
      }

      // ───────────────────────────────────────────────────────
      // 3 — status === "expired" (or stale row we just synced)
      // ───────────────────────────────────────────────────────
      const treatedAsExpired =
        row.status === "expired" ||
        (row.status === "active" && !!expiresAt && expiresAt.getTime() <= now.getTime());

      if (treatedAsExpired && expiresAt && updatedAt) {
        const hoursDiff = Math.abs(updatedAt.getTime() - expiresAt.getTime()) / 3_600_000;

        // Natural expiry (updated_at close in time to expires_at)
        if (hoursDiff <= 24) {
          if (isAdminGrant) {
            setInfo({
              isActive: false,
              status: "expired_admin_grant",
              message: `Your Pro access (granted by admin) ended on ${fmt(
                expiresAt,
              )}. Contact support if you need it renewed.`,
              shortMessage: "Pro ended (admin grant)",
              showAlert: true,
              expiresAt,
              primaryAction: "contact_support",
              proRowId: rowId,
            });
          } else {
            setInfo({
              isActive: false,
              status: "expired_natural",
              message: `Your Schooldra Pro subscription expired on ${fmt(
                expiresAt,
              )}. Renew to keep access to unlimited mock exams, AI explanations, and performance tracking.`,
              shortMessage: "Pro expired",
              showAlert: true,
              expiresAt,
              primaryAction: "renew",
              proRowId: rowId,
            });
          }
          return;
        }

        // Early revoke (updated_at significantly before expires_at)
        setInfo({
          isActive: false,
          status: "revoked_early",
          message: `Your Schooldra Pro access was ended early on ${fmt(
            updatedAt,
          )}. Contact support@schooldra.com for details.`,
          shortMessage: "Pro access ended early",
          showAlert: true,
          expiresAt,
          primaryAction: "contact_support",
          proRowId: rowId,
        });
        return;
      }

      // Safe fallback for expired rows missing a timestamp
      if (treatedAsExpired) {
        setInfo({
          isActive: false,
          status: isAdminGrant ? "expired_admin_grant" : "expired_natural",
          message: isAdminGrant
            ? "Your admin-granted Pro access is no longer active. Contact support if you need it renewed."
            : "Your Schooldra Pro subscription is no longer active. Renew to keep access.",
          shortMessage: "Pro ended",
          showAlert: true,
          expiresAt,
          primaryAction: isAdminGrant ? "contact_support" : "renew",
          proRowId: rowId,
        });
        return;
      }

      // ───────────────────────────────────────────────────────
      // 4 — status === "inactive"
      // ───────────────────────────────────────────────────────
      if (row.status === "inactive") {
        const looksLikeFailedPayment =
          !isAdminGrant && paidPlan && !storeIsPro;

        if (looksLikeFailedPayment) {
          setInfo({
            isActive: false,
            status: "payment_failed",
            message:
              "Your Pro payment could not be confirmed. Please try again or contact support.",
            shortMessage: "Payment unconfirmed",
            showAlert: true,
            expiresAt,
            primaryAction: "try_again",
            proRowId: rowId,
          });
        } else {
          setInfo({
            isActive: false,
            status: "inactive",
            message:
              "Your Schooldra Pro is currently inactive. Contact support@schooldra.com.",
            shortMessage: "Pro inactive",
            showAlert: true,
            expiresAt,
            primaryAction: "contact_support",
            proRowId: rowId,
          });
        }
        return;
      }

      // Unknown status — fall back silently so we never spam the user
      setInfo({
        isActive: storeIsPro,
        status: "none",
        message: "",
        shortMessage: "",
        showAlert: false,
        expiresAt,
        primaryAction: null,
        proRowId: rowId,
      });
    };

    check();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return info;
};
