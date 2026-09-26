// Confirmation after a sample reached the farm records
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import type { WeighSaved } from "@/components/weights/weigh-form";
import { kg } from "@/utils/format/weight";

export function WeighDone({ setNumber, saved }: { setNumber: number; saved: WeighSaved }) {
  return (
    <div className="flex flex-col gap-4">
      <Notice tone="success" icon="check" title={`Saved: Set ${setNumber} weights`}>
        {saved.count} {saved.count === 1 ? "bird" : "birds"}, averaging {kg(saved.averageGrams)}.
      </Notice>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size="lg" href="/today">Back to Today</Button>
        <Button size="lg" href="/weigh">Weigh another Set</Button>
      </div>
    </div>
  );
}
