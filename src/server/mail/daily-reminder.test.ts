// The 6pm email names each Set and links to its log for today
import { describe, expect, it } from "vitest";
import { dailyReminderMail } from "@/server/mail/daily-reminder";

describe("daily reminder email", () => {
  it("counts the Sets in the subject and links each one", () => {
    const sets = [
      { id: "a", number: 4, name: null, dayOfAge: 24 },
      { id: "b", number: 5, name: "Front pen", dayOfAge: 6 },
    ];
    const mail = dailyReminderMail(["kosi@example.com"], sets, "2026-09-26", "https://kotilafarms.com");
    expect(mail.subject).toBe("No daily log yet for 2 Sets today");
    expect(mail.text).toContain("Set 5 (Front pen) · day 6: https://kotilafarms.com/log/b/2026-09-26");
    expect(mail.html).toContain("https://kotilafarms.com/log/a/2026-09-26");
  });
});
