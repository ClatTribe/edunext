/**
 * lib/mailer.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Free email sending via Gmail SMTP + Nodemailer.
 *
 * Setup (one-time, 2 minutes):
 *   1. Go to myaccount.google.com → Security → 2-Step Verification → ON
 *   2. Search "App Passwords" → Select app: Mail → Generate
 *   3. Copy the 16-char password into your .env
 *
 * .env variables needed:
 *   GMAIL_USER=you@gmail.com
 *   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   ← the 16-char app password
 * ─────────────────────────────────────────────────────────────────────────────
 */

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendReminderEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: `"EduNext Deadlines 📅" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

// ─── HTML Email Templates ─────────────────────────────────────────────────────

export function buildReminderHtml({
  examLabel,
  forms,
  daysLeft,
}: {
  examLabel: string;
  forms: Array<{ name: string; deadline: string }>;
  daysLeft: number;
}) {
  const urgencyColor =
    daysLeft === 0 ? "#ef4444" : daysLeft <= 3 ? "#f97316" : "#f9a01b";

  const urgencyLabel =
    daysLeft === 0
      ? "⚠️ TODAY IS THE LAST DATE"
      : daysLeft === 1
      ? "⚠️ TOMORROW IS THE LAST DATE"
      : `⏰ ${daysLeft} DAYS LEFT`;

  const rows = forms
    .map(
      (f) => `
      <tr>
        <td style="padding:14px 20px;border-bottom:1px solid #1e293b;color:#e2e8f0;font-size:14px;font-weight:600;">
          ${f.name}
        </td>
        <td style="padding:14px 20px;border-bottom:1px solid #1e293b;color:${urgencyColor};font-size:13px;font-weight:700;text-align:right;">
          ${f.deadline}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:20px 20px 0 0;padding:36px 40px;border:1px solid #334155;border-bottom:none;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:900;letter-spacing:4px;color:${urgencyColor};text-transform:uppercase;">EduNext · Deadline Alert</p>
            <h1 style="margin:0;font-size:28px;font-weight:900;color:#fff;line-height:1.2;">
              ${urgencyLabel}
            </h1>
            <p style="margin:12px 0 0;font-size:15px;color:#94a3b8;">
              These <strong style="color:#fff;">${examLabel}</strong> form deadlines need your attention.
            </p>
          </td>
        </tr>

        <!-- Table -->
        <tr>
          <td style="background:#0f172a;border:1px solid #334155;border-top:none;border-bottom:none;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <th style="padding:12px 20px;background:#1e293b;color:#64748b;font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;text-align:left;">Form / Exam</th>
                <th style="padding:12px 20px;background:#1e293b;color:#64748b;font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;text-align:right;">Last Date</th>
              </tr>
              ${rows}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="background:#0f172a;border:1px solid #334155;border-top:none;border-radius:0 0 20px 20px;padding:28px 40px;text-align:center;">
            <a href="https://edunext.in/forms-and-deadlines" 
               style="display:inline-block;padding:14px 36px;background:${urgencyColor};color:#000;font-weight:900;font-size:14px;text-decoration:none;border-radius:100px;letter-spacing:1px;">
              Apply Now →
            </a>
            <p style="margin:20px 0 0;font-size:11px;color:#475569;">
              You're receiving this because you set a reminder on EduNext.<br/>
              <a href="https://edunext.in/unsubscribe" style="color:#475569;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}