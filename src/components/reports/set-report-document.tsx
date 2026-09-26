// The Set report itself: used on screen and on the A4 page the PDF is printed from
import { ReportExpenses } from "@/components/reports/report-expenses";
import { ReportFigures } from "@/components/reports/report-figures";
import { ReportGrowth } from "@/components/reports/report-growth";
import { ReportMoney } from "@/components/reports/report-money";
import { KotilaMark } from "@/svgs/kotila-mark";
import type { SetReportPayload } from "@/types/report";
import { setNames } from "@/utils/format/set-names";
import { reportFootnote, reportPeriod, reportTitle } from "@/utils/metrics/report-headlines";

export function SetReportDocument({ r }: { r: SetReportPayload }) {
  const name = setNames(r.sets.map((s) => s.number));
  return (
    <article className="flex flex-col gap-8 rounded-xl border border-line bg-surface px-8 py-8 text-ink print:rounded-none print:border-0 print:p-0">
      <header className="flex flex-col gap-3 border-b-[1.5px] border-ink pb-5">
        <div className="flex items-center gap-2.5 text-green-800">
          <KotilaMark className="h-7 w-auto" />
          <strong className="font-display text-[17px] font-semibold">Kotila Farms</strong>
        </div>
        <p className="m-0 text-sm font-medium text-ink-muted">{reportPeriod(r)}</p>
        <h1 className="m-0 font-display text-[30px] leading-9 font-semibold tracking-[-0.01em]">{reportTitle(r)}</h1>
      </header>
      <ReportFigures r={r} />
      <ReportMoney r={r} />
      {r.growth ? <ReportGrowth growth={r.growth} setNumber={r.sets[0]!.number} /> : null}
      <ReportExpenses list={r.largestExpenses} caption={`${name} expenses by date`} />
      <footer className="border-t border-line pt-4 text-caption text-ink-muted">{reportFootnote(r)}</footer>
    </article>
  );
}
