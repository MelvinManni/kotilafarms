"use client";
// /finance/capital (owners): the share register, money in and out, borrowing capacity and shareholder loans
import { useState } from "react";
import { CapacityPanel } from "@/components/finance/capacity-panel";
import { ContributionSheet } from "@/components/finance/contribution-sheet";
import { FinanceTabs } from "@/components/finance/finance-tabs";
import { LoanBreakdown } from "@/components/finance/loan-breakdown";
import { LoanDetailSheet } from "@/components/finance/loan-detail-sheet";
import { LoanSheet } from "@/components/finance/loan-sheet";
import { LoansPanel } from "@/components/finance/loans-panel";
import { OwnershipPanel } from "@/components/finance/ownership-panel";
import { ShareholderSheet } from "@/components/finance/shareholder-sheet";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { PageHeader } from "@/components/layout/page-header";
import { useCapital } from "@/hooks/queries/use-capital";
import { useOnline } from "@/hooks/use-online";
import { useCurrentUser } from "@/lib/auth/current-user";
import type { LoanRow } from "@/types/capital";

type Open = { kind: "shareholder" } | { kind: "contribution" } | { kind: "loan" } | { kind: "detail"; loan: LoanRow } | null;

export function CapitalScreen() {
  const role = useCurrentUser().role;
  const online = useOnline();
  const capital = useCapital();
  const [open, setOpen] = useState<Open>(null);
  const c = capital.data;
  const repaid = c?.loans.find((l) => l.repaidOn);
  const outstanding = c?.loans.find((l) => !l.repaidOn);
  const close = () => setOpen(null);
  return (
    <>
      <PageHeader
        eyebrow="Owners only"
        title="Partner capital and loans"
        actions={
          <>
            <Button icon="plus" onClick={() => setOpen({ kind: "contribution" })} disabled={!online || !c?.shareholders.length}>Record a contribution</Button>
            <Button variant="primary" icon="plus" onClick={() => setOpen({ kind: "loan" })} disabled={!online || !c?.shareholders.length}>Record a loan</Button>
          </>
        }
      />
      <FinanceTabs active="capital" role={role} />
      <Notice tone="neutral" icon="lock" compact>Only owners can see this page. It needs a connection to change anything.</Notice>
      {capital.isError ? <Notice tone="alert">{capital.error.message}</Notice> : null}
      {c ? (
        <>
          <OwnershipPanel c={c} onAdd={() => setOpen({ kind: "shareholder" })} />
          <LoansPanel loans={c.loans} onOpen={(loan) => setOpen({ kind: "detail", loan })} />
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            <CapacityPanel c={c} />
            {repaid ? <Panel title={`${repaid.lender.name}'s loan: what is paid`} subtitle="Gross interest, withholding tax and net interest are three different numbers. The company pays the tax to FIRS."><LoanBreakdown loan={repaid} /></Panel> : null}
            {outstanding ? <Panel title={`${outstanding.lender.name}'s loan, interest so far (${outstanding.interest.days} days)`}><LoanBreakdown loan={outstanding} /></Panel> : null}
          </div>
        </>
      ) : capital.isPending ? <p className="text-body text-on-deep-muted lg:text-ink-muted">Opening the register…</p> : null}
      {open?.kind === "shareholder" ? <ShareholderSheet onClose={close} /> : null}
      {open?.kind === "contribution" && c ? <ContributionSheet shareholders={c.shareholders} onClose={close} /> : null}
      {open?.kind === "loan" && c ? <LoanSheet c={c} onClose={close} /> : null}
      {open?.kind === "detail" ? <LoanDetailSheet loan={open.loan} onClose={close} /> : null}
    </>
  );
}
