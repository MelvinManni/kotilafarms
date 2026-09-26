// Health page data: a Set's vaccine schedule and drug or supplement records
import type { VaccineState } from "@/utils/metrics/vaccine-status";

export type SetVaccineRow = {
  id: string;
  item: string;
  doseNo: number;
  dueAgeDays: number;
  dueOn: string;
  method: string;
  givenOn: string | null;
  givenDay: number | null;
  givenBy: string | null;
  note: string | null;
  state: VaccineState;
  daysLate: number;
  version: number;
};

export type HealthRecordRow = { id: string; date: string; set: { id: string; number: number }; item: string; dose: string; cost: number | null; reason: string; by: string; enteredAt: string };

export type ScheduleDefault = { id: string; item: string; doseNo: number; dueAgeDays: number; method: string };
