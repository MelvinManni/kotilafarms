// The 6pm email: only from 6pm Lagos time, once a day, only for Sets with no log, retried after a failed send
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dailyLogs, reminderRuns, sets } from "@/db/schema";
import { sendMail } from "@/server/mail/send-mail";
import { runDailyReminder } from "@/server/services/reminders/daily-reminder";
import { farmWithSet, made } from "@test/db/factories";
import { inRollback } from "@test/db/test-db";

vi.mock("@/server/mail/send-mail", () => ({ sendMail: vi.fn() }));
const mailed = vi.mocked(sendMail);

// Lagos is UTC+1: 17:00 UTC is 6pm on the farm
const SIX_PM = new Date("2026-09-26T17:00:00Z");

beforeEach(() => {
  mailed.mockReset();
  mailed.mockResolvedValue({ sent: true });
});

describe("daily reminder", () => {
  it("waits for 6pm, then emails owners once about the Set with no log", async () => {
    await inRollback(async (tx) => {
      const { set } = await farmWithSet(tx);
      expect(await runDailyReminder(tx, new Date("2026-09-26T16:59:00Z"))).toBe("too_early");
      expect(await runDailyReminder(tx, SIX_PM)).toBe("sent");
      const mail = mailed.mock.calls[0]![0];
      expect(mail.subject).toBe(`No daily log yet for Set ${set.number} today`);
      expect(mail.to).toHaveLength(1);
      expect(mail.text).toContain(`/log/${set.id}/2026-09-26`);
      expect(await runDailyReminder(tx, new Date("2026-09-26T18:00:00Z"))).toBe("already_done");
      expect(mailed).toHaveBeenCalledTimes(1);
      const [run] = await tx.select().from(reminderRuns);
      expect(run).toMatchObject({ day: "2026-09-26", sets: [set.number] });
    });
  });

  it("sends nothing when every running Set is logged, and skips closed Sets", async () => {
    await inRollback(async (tx) => {
      const { ownerId, set } = await farmWithSet(tx);
      await tx.insert(dailyLogs).values({ ...made(ownerId), setId: set.id, date: "2026-09-26", deaths: 0 });
      expect(await runDailyReminder(tx, SIX_PM)).toBe("all_logged");
      await tx.delete(reminderRuns);
      await tx.update(sets).set({ status: "closed" }).where(eq(sets.id, set.id));
      await tx.delete(dailyLogs);
      expect(await runDailyReminder(tx, SIX_PM)).toBe("all_logged");
      expect(mailed).not.toHaveBeenCalled();
    });
  });

  it("releases the claim when the email fails, so the next check tries again", async () => {
    await inRollback(async (tx) => {
      await farmWithSet(tx);
      mailed.mockResolvedValueOnce({ sent: false, reason: "Resend answered 500" });
      expect(await runDailyReminder(tx, SIX_PM)).toBe("failed");
      expect(await tx.select().from(reminderRuns)).toHaveLength(0);
      expect(await runDailyReminder(tx, SIX_PM)).toBe("sent");
    });
  });
});
