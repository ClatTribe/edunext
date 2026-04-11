/**
 * lib/reminders-store.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads/writes reminder subscriptions from the `college_enquiries` table
 * in Supabase.
 *
 * Column mapping:
 *   contact_email           → subscriber's email
 *   colleges                → examLabel  (e.g. "IPM", "JEE")
 *   notification_preference → examTab    (e.g. ExamTab enum value)
 *   forms                   → JSON array of NotificationRecord[]
 *   user_id                 → null unless the user is logged in
 *
 * .env.local vars needed (you likely already have these):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   ← use service role so cron can write freely
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";

// ─── Supabase client (server-side only) ───────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationRecord {
  formName: string;
  deadline: string;       // ISO date string
  sent7Day: boolean;
  sent3Day: boolean;
  sentDeadline: boolean;
}

interface EnquiryRow {
  id: string;
  contact_email: string;
  colleges: string;                // stores examLabel
  notification_preference: string; // stores examTab
  forms: string;                   // JSON → NotificationRecord[]
  user_id: string | null;
  contact_phone: string | null;
}

export interface Subscription {
  id: string;
  email: string;
  examLabel: string;
  examTab: string;
  notifications: NotificationRecord[];
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function rowToSub(row: EnquiryRow): Subscription {
  let notifications: NotificationRecord[] = [];
  try { notifications = JSON.parse(row.forms || "[]"); } catch { /* empty */ }
  return {
    id: row.id,
    email: row.contact_email,
    examLabel: row.colleges,
    examTab: row.notification_preference,
    notifications,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Save a new subscription (upserts on email + examTab).
 * Creates notification records only for forms whose deadline can be parsed.
 */
export async function upsertSubscription(
  email: string,
  examLabel: string,
  examTab: string,
  forms: Array<{ name: string; endDate: string }>,
  userId?: string | null,
  phone?: string | null
): Promise<void> {
  const notifications: NotificationRecord[] = forms.flatMap((f) => {
    const deadline = parseDeadline(f.endDate);
    if (!deadline) return [];
    return [{
      formName: f.name,
      deadline: deadline.toISOString(),
      sent7Day: false,
      sent3Day: false,
      sentDeadline: false,
    }];
  });

  // NOTE: For upsert to work on conflict you need a unique constraint in Supabase.
  // Run this once in the SQL editor:
  //   ALTER TABLE college_enquiries
  //   ADD CONSTRAINT uniq_email_tab UNIQUE (contact_email, notification_preference);

  const { error } = await supabase
    .from("college_enquiries")
    .upsert(
      {
        contact_email: email,
        colleges: examLabel,
        notification_preference: examTab,
        forms: JSON.stringify(notifications),
        user_id: userId ?? null,
        contact_phone: phone ?? null,
      },
      { onConflict: "contact_email,notification_preference" }
    );

  if (error) throw new Error(error.message);
}

/** Fetch every row — called by the daily cron job. */
export async function getAllSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from("college_enquiries")
    .select("id, contact_email, colleges, notification_preference, forms, user_id, contact_phone");

  if (error) throw new Error(error.message);
  return (data as EnquiryRow[]).map(rowToSub);
}

/** Write updated sent-flags back to Supabase after an email is dispatched. */
export async function saveSubscription(sub: Subscription): Promise<void> {
  const { error } = await supabase
    .from("college_enquiries")
    .update({ forms: JSON.stringify(sub.notifications) })
    .eq("id", sub.id);

  if (error) throw new Error(error.message);
}

// ─── Date helpers (used here and by the cron route) ──────────────────────────

const SKIP_TERMS = [
  "tba", "to be announced", "coming soon", "ongoing", "—",
  "currently open", "n/a",
];

export function parseDeadline(raw: string): Date | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  if (SKIP_TERMS.some((t) => lower.includes(t))) return null;

  // Strip ordinals: "14th" → "14", "21st" → "21"
  const cleaned = raw.replace(/(\d+)(st|nd|rd|th)/gi, "$1");

  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d;

  // Handle "May '26" → "May 2026"
  const short = cleaned.match(/([A-Za-z]+)\s+'?(\d{2})$/);
  if (short) {
    const full = new Date(`${short[1]} 20${short[2]}`);
    if (!isNaN(full.getTime())) return full;
  }

  return null;
}

/** Days between today (midnight) and the target date. Negative = past. */
export function daysUntil(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}