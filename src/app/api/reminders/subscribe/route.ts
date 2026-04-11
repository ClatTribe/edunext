/**
 * app/api/reminders/subscribe/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseDeadline, type NotificationRecord } from "../../../lib/reminders-store";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, examTab, forms } = await req.json();

    if (!examTab || !Array.isArray(forms) || forms.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const notifications: NotificationRecord[] = forms.flatMap(
      (f: { name: string; endDate: string }) => {
        const deadline = parseDeadline(f.endDate);
        if (!deadline) return [];
        return [{
          formName: f.name,
          deadline: deadline.toISOString(),
          sent7Day: false,
          sent3Day: false,
          sentDeadline: false,
        }];
      }
    );

    if (userId) {
      // Pull email/phone from any existing row for this user
      const { data: anyRow } = await supabase
        .from("college_enquiries")
        .select("contact_email, contact_phone")
        .eq("user_id", userId)
        .maybeSingle();

      const { error } = await supabase
        .from("college_enquiries")
        .upsert(
          {
            user_id:                 userId,
            colleges:                examTab,
            contact_email:           anyRow?.contact_email ?? "",
            contact_phone:           anyRow?.contact_phone ?? null,
            notification_preference: "email",
            forms:                   JSON.stringify(notifications),
          },
          { onConflict: "user_id,colleges" }   // requires uniq_user_tab index
        );

      if (error) throw new Error(error.message);

    } else {
      // Anonymous: check first, then insert or update
      const { data: existing } = await supabase
        .from("college_enquiries")
        .select("id")
        .is("user_id", null)
        .eq("contact_email", "")
        .eq("colleges", examTab)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("college_enquiries")
          .update({ forms: JSON.stringify(notifications) })
          .eq("id", existing.id);

        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from("college_enquiries")
          .insert({
            contact_email:           "",
            colleges:                examTab,
            notification_preference: "email",
            forms:                   JSON.stringify(notifications),
          });

        if (error) throw new Error(error.message);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[subscribe] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
