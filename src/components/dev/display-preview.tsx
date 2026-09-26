// Dev preview: tags, figures, rows, panels
import { Delta } from "@/components/kotila/delta";
import { Figure } from "@/components/kotila/figure";
import { Money } from "@/components/kotila/money";
import { Panel } from "@/components/kotila/panel";
import { Rows } from "@/components/kotila/rows";
import { StatusChip } from "@/components/kotila/status-chip";
import { Tag } from "@/components/kotila/tag";
import { PreviewSection } from "@/components/dev/preview-section";

export function DisplayPreview() {
  return (
    <PreviewSection title="Figures and panels">
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip status="brooding" day={6} />
        <StatusChip status="growing" day={24} />
        <StatusChip status="selling" />
        <StatusChip status="closed" />
        <Tag dot tone="warning">On this phone</Tag>
        <Tag tone="alert">Late</Tag>
        <Delta direction="up" goodWhen="down" tooltip="Up from 2 last week">4 this week</Delta>
        <Delta direction="up" goodWhen="up">63 g a day</Delta>
        <Delta direction="flat">no change</Delta>
      </div>
      <div className="grid gap-5 sm:grid-cols-4">
        <Figure label="Live birds" value="482" sub="of 500 started" size="lg" />
        <Figure label="Deaths" value="18" tone="alert" delta={<Delta direction="up" goodWhen="down">4 this week</Delta>} sub="3.6%" />
        <Figure label="Owed to the farm" value={<Money value={412000} />} tone="owed" sub="by 3 buyers" />
        <Figure label="Set 3 profit" value={<Money value={568750} sign />} size="xl" sub="15.96% margin" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Panel title="Cash position" subtitle="Since reconciled on 1 Sep by Kosi" action={{ label: "Reconcile cash", href: "#" }}>
          <Rows items={[{ label: "Money in", value: <Money value={2164300} /> }, { label: "Money out", value: <Money value={-879550} /> }, { label: "Should be on hand", value: <Money value={1284750} />, total: true }]} />
        </Panel>
        <Panel headline title="Set 4 is 10% under weight — and the gap is widening" variant="sunken">
          <Rows items={[{ label: "Average at day 24", value: "1.03 kg" }, { label: "Standard", value: "1.15 kg", sub: "Breed curve from Settings" }, { label: "Gap", value: "−10.4%", tone: "alert" }]} />
        </Panel>
      </div>
    </PreviewSection>
  );
}
