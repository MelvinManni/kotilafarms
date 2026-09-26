// Dev preview: growth chart (deep and light), sparkline, bar list
import { BarList } from "@/components/kotila/charts/bar-list";
import { GrowthChart } from "@/components/kotila/charts/growth-chart";
import { Sparkline } from "@/components/kotila/charts/sparkline";
import { Panel } from "@/components/kotila/panel";
import { PreviewSection } from "@/components/dev/preview-section";

const set4 = [
  { day: 7, kg: 0.176 },
  { day: 14, kg: 0.455 },
  { day: 21, kg: 0.84 },
  { day: 24, kg: 1.03 },
];

export function ChartsPreview() {
  return (
    <PreviewSection title="Charts">
      <Panel variant="deep" headline title="Set 4 is 10% under weight — and the gap is widening" subtitle="Average weight by day of age, against the breed standard">
        <GrowthChart samples={set4} today={24} projectTo={35} />
      </Panel>
      <Panel title="Growth">
        <GrowthChart samples={set4} today={24} theme="light" callout={false} />
      </Panel>
      <div className="grid gap-5 sm:grid-cols-2">
        <Panel title="Finisher price per bag" subtitle="Last six purchases">
          <Sparkline values={[21500, 22000, 22800, 23200, 23800, 24800]} endTone="alert" label="Finisher price up to ₦24,800 a bag" />
        </Panel>
        <Panel title="Set 3 spend by category">
          <BarList items={[{ label: "Feed", value: 2066412 }, { label: "Day-old chicks", value: 445000 }, { label: "Drugs and vaccines", value: 131600 }, { label: "Brooding", value: 96500 }, { label: "Labour", value: 90000 }]} />
        </Panel>
      </div>
    </PreviewSection>
  );
}
