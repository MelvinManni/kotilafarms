"use client";
// After adding someone or resetting a password: say it was emailed, or show it once to pass on
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import type { StartingPasswordResult } from "@/types/people";

export function StartingPassword({ result, isReset }: { result: StartingPasswordResult; isReset: boolean }) {
  const [copied, setCopied] = useState(false);
  const first = result.person.name.split(" ")[0];
  if (result.emailed) {
    return (
      <Notice tone="success" title={isReset ? "New password sent" : `${first} is added`}>
        We emailed {first} a password at {result.person.email}, with the sign-in link and the how-to video. They&apos;ll choose their own password when they first sign in.
      </Notice>
    );
  }
  const message = `Hi ${first}, ${isReset ? "here is your new Kotila Farms password" : "you've been added to Kotila Farms"}.\nEmail: ${result.person.email}\nPassword: ${result.password}\nSign in: ${result.signInUrl}\nYou'll choose your own password when you first sign in.\nHow-to video: ${result.videoUrl}`;
  const copy = async () => {
    await navigator.clipboard.writeText(result.password ?? "");
    setCopied(true);
  };
  return (
    <div className="flex flex-col gap-4">
      <Notice tone="warning" title="The email didn't go">
        Pass this password to {first} yourself. It&apos;s shown only now. They&apos;ll choose their own when they first sign in.
      </Notice>
      <code className="rounded-md bg-surface-sunken px-4 py-3 font-mono text-lg tracking-wide break-all text-ink">{result.password}</code>
      <div className="flex flex-wrap gap-3">
        <Button onClick={copy} icon={copied ? "check" : "note"}>{copied ? "Copied" : "Copy password"}</Button>
        <Button variant="outline" href={`https://wa.me/?text=${encodeURIComponent(message)}`}>Send on WhatsApp</Button>
      </div>
    </div>
  );
}
