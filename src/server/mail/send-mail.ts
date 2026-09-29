// Send one email through Resend's HTTP API; reports the outcome and never throws
import "server-only";
import { env } from "@/lib/env";

export type Mail = { to: string[]; subject: string; html: string; text: string };
export type MailResult = { sent: true } | { sent: false; reason: string };

export async function sendMail(mail: Mail): Promise<MailResult> {
  const { RESEND_API_KEY, MAIL_FROM } = env();
  if (!RESEND_API_KEY) return { sent: false, reason: "RESEND_API_KEY is not set" };
  if (!mail.to.length) return { sent: false, reason: "nobody to send to" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: MAIL_FROM, ...mail }),
      signal: AbortSignal.timeout(15_000),
    });
    if (res.ok) return { sent: true };
    const reason = `Resend answered ${res.status}: ${(await res.text()).slice(0, 300)}`;
    console.error(`Email "${mail.subject}" was not sent. ${reason}`);
    return { sent: false, reason };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`Email "${mail.subject}" was not sent: ${reason}`);
    return { sent: false, reason };
  }
}
