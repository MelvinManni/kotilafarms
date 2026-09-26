// Shown in place after saving with no signal: no page load needed, the entry is safe on the phone
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";

type SavedOnPhoneProps = { what: string; more: { href: string; label: string } };

export function SavedOnPhone({ what, more }: SavedOnPhoneProps) {
  return (
    <div className="flex flex-col gap-4">
      <Notice tone="neutral" icon="wifi-off" title={`Saved on this phone: ${what}`}>
        It will send by itself when signal returns. Keep working.
      </Notice>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size="lg" href="/today">Back to Today</Button>
        <Button size="lg" href={more.href}>{more.label}</Button>
      </div>
    </div>
  );
}
