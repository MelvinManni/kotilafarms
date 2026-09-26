// Shown in place after saving with no signal: no page load needed, the entry is safe on the phone
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { farmDay } from "@/utils/format/dates";

export function SavedOnPhone({ setId, setNumber, date }: { setId: string; setNumber: number; date: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Notice tone="neutral" icon="wifi-off" title={`Saved on this phone: Set ${setNumber}, ${farmDay(date)}`}>
        It will send by itself when signal returns. Keep working.
      </Notice>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size="lg" href="/today">Back to Today</Button>
        <Button size="lg" href={`/log/${setId}`}>All days for Set {setNumber}</Button>
      </div>
    </div>
  );
}
