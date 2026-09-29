// Email with a new person's starting password (or a reset one), the sign-in link and the how-to video
import "server-only";
import { env } from "@/lib/env";
import { button, escapeHtml, frame } from "@/server/mail/layout";
import type { Mail } from "@/server/mail/send-mail";
import type { Role } from "@/types/role";

const ROLE_WORD: Record<Role, string> = { owner: "an owner", manager: "a manager", recorder: "a recorder" };

type Input = { name: string; email: string; role: Role; password: string; addedBy: string; isReset: boolean };

export function startingPasswordMail(p: Input, e: { appUrl: string; videoUrl: string } = { appUrl: env().NEXTAUTH_URL, videoUrl: env().HOW_TO_VIDEO_URL }): Mail {
  const signIn = new URL("/sign-in", e.appUrl).toString();
  const title = p.isReset ? "Your new Kotila Farms password" : `${p.addedBy} added you to Kotila Farms`;
  const lead = p.isReset ? `${p.addedBy} made you a new password.` : `You can now sign in to the farm records as ${ROLE_WORD[p.role]}.`;
  const html = frame(
    title,
    `<p style="margin:0 0 12px">Hi ${escapeHtml(p.name)}, ${escapeHtml(lead)}</p>
<p style="margin:0 0 4px">Email: <strong>${escapeHtml(p.email)}</strong></p>
<p style="margin:0 0 16px">Password: <strong style="font-family:monospace;font-size:18px;letter-spacing:1px">${escapeHtml(p.password)}</strong></p>
<p style="margin:0 0 16px">You'll choose your own password the first time you sign in.</p>
<p style="margin:0 0 20px">${button("Sign in", signIn)}</p>
<p style="margin:0 0 8px">New to the app? Watch how to log a day, record a sale and more:</p>
<p style="margin:0">${button("Watch the how-to video", e.videoUrl, "outline")}</p>`,
  );
  const text = [
    `Hi ${p.name}, ${lead}`,
    "",
    `Email: ${p.email}`,
    `Password: ${p.password}`,
    "",
    "You'll choose your own password the first time you sign in.",
    `Sign in: ${signIn}`,
    `How-to video: ${e.videoUrl}`,
  ].join("\n");
  return { to: [p.email], subject: title, html, text };
}
