// Email to owners at 6pm: the running Sets with no daily log yet today, each with a link to fill it in
import "server-only";
import { button, escapeHtml, frame } from "@/server/mail/layout";
import type { Mail } from "@/server/mail/send-mail";
import { shortDate } from "@/utils/format/dates";

export type MissingSet = { id: string; number: number; name: string | null; dayOfAge: number };

const label = (s: MissingSet) => `Set ${s.number}${s.name ? ` (${s.name})` : ""}`;

export function dailyReminderMail(to: string[], sets: MissingSet[], today: string, appUrl: string): Mail {
  const subject = sets.length === 1 ? `No daily log yet for ${label(sets[0]!)} today` : `No daily log yet for ${sets.length} Sets today`;
  const link = (s: MissingSet) => new URL(`/log/${s.id}/${today}`, appUrl).toString();
  const rows = sets
    .map((s) => `<p style="margin:0 0 6px"><strong>${escapeHtml(label(s))}</strong> · day ${s.dayOfAge}</p><p style="margin:0 0 16px">${button("Fill in today", link(s))}</p>`)
    .join("");
  const html = frame(subject, `<p style="margin:0 0 16px">It's 6pm and these Sets have no daily log for ${escapeHtml(shortDate(today))}:</p>${rows}<p style="margin:0;color:#5b645f">If a log was made on a phone without signal, it arrives when that phone is back online.</p>`);
  const text = [`It's 6pm and these Sets have no daily log for ${shortDate(today)}:`, "", ...sets.map((s) => `${label(s)} · day ${s.dayOfAge}: ${link(s)}`)].join("\n");
  return { to, subject, html, text };
}
