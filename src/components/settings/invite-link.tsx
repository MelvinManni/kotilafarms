"use client";
// The invite link to share: copy it, or send it on WhatsApp
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";

export function InviteLink({ name, url, isReset }: { name: string; url: string; isReset: boolean }) {
  const [copied, setCopied] = useState(false);
  const message = isReset
    ? `Hi ${name}, use this link to set a new password for Kotila Farm: ${url}`
    : `Hi ${name}, you've been added to Kotila Farm. Set your password here: ${url}`;
  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
  };
  return (
    <div className="flex flex-col gap-4">
      <Notice tone="success" title={isReset ? "Reset link ready" : "Invite ready"}>
        Send this link to {name}. It works once and runs out in 7 days.
      </Notice>
      <code className="rounded-md bg-surface-sunken px-4 py-3 text-sm break-all text-ink-2">{url}</code>
      <div className="flex flex-wrap gap-3">
        <Button onClick={copy} icon={copied ? "check" : "note"}>{copied ? "Copied" : "Copy link"}</Button>
        <Button variant="outline" href={`https://wa.me/?text=${encodeURIComponent(message)}`}>
          Send on WhatsApp
        </Button>
      </div>
    </div>
  );
}
