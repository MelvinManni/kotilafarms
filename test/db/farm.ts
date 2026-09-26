// A farm ready for API tests: fixed lists in place, plus an owner, a manager and a recorder
import type { Tx } from "@/db";
import { insertReferenceData } from "@/db/setup/insert-reference-data";
import { makePerson } from "@test/db/people";

export async function readyFarm(tx: Tx) {
  const owner = await makePerson(tx, "owner", "Kosi");
  const manager = await makePerson(tx, "manager", "Adaeze Nwankwo");
  const recorder = await makePerson(tx, "recorder", "Chinedu Okafor");
  await insertReferenceData(tx, owner.id);
  return { owner, manager, recorder };
}

// Set 4 as in docs/12-seed-data.md: 500 day-olds from Chi Farms at ₦950 on 2 Sep
export const SET4 = { pen: "Back pen", startDate: "2026-09-02", intake: 500, dayOldSupplier: "Chi Farms", dayOldUnitCost: 950 };
