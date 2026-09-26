"use client";
// A loan's interest in three numbers, and marking it repaid
import { useState } from "react";
import { Button } from "@/components/kotila/button";
import { TextInput } from "@/components/kotila/fields/text-input";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { LoanBreakdown } from "@/components/finance/loan-breakdown";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useRepayLoan } from "@/hooks/queries/use-capital";
import type { LoanRow } from "@/types/capital";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { naira } from "@/utils/format/naira";
import { shortDate } from "@/utils/format/dates";

export function LoanDetailSheet({ loan, onClose }: { loan: LoanRow; onClose: () => void }) {
  const repay = useRepayLoan();
  const [date, setDate] = useState(() => todayInZone(FARM_TIMEZONE));
  return (
    <Sheet title={`${loan.lender.name}'s loan · ${naira(loan.amount)}`} description={`Lent ${shortDate(loan.advancedOn)}. Gross interest, withholding tax and net interest are three different numbers; the company pays the tax to FIRS.`} onClose={onClose}
      footer={loan.repaidOn ? <Button onClick={onClose}>Close</Button> : <><Button onClick={onClose}>Cancel</Button><Button variant="primary" icon="check" disabled={repay.isPending} onClick={() => repay.mutate({ id: loan.id, repaidOn: date, baseVersion: loan.version }, { onSuccess: onClose })}>Mark repaid</Button></>}>
      {repay.error ? <Notice tone="alert" compact>{repay.error.message}</Notice> : null}
      <LoanBreakdown loan={loan} />
      {loan.repaidOn ? null : <TextInput label="Repaid on" type="date" value={date} onChange={setDate} hint="Interest runs to this day" />}
    </Sheet>
  );
}
