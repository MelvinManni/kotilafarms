// Email content: names are escaped, links and the password are in both versions
import { describe, expect, it } from "vitest";
import { startingPasswordMail } from "@/server/mail/starting-password";

const urls = { appUrl: "https://kotilafarms.com", videoUrl: "https://example.com/how-to.mp4" };

describe("starting password email", () => {
  it("has the password, sign-in link and video in html and text", () => {
    const mail = startingPasswordMail({ name: "Chinedu", email: "chinedu@example.com", role: "recorder", password: "Abc-def-ghj-kmn", addedBy: "Kosi", isReset: false }, urls);
    expect(mail.subject).toBe("Kosi added you to Kotila Farms");
    for (const body of [mail.html, mail.text]) {
      expect(body).toContain("Abc-def-ghj-kmn");
      expect(body).toContain("https://kotilafarms.com/sign-in");
      expect(body).toContain("https://example.com/how-to.mp4");
    }
    expect(mail.text).toContain("as a recorder");
  });

  it("escapes names and says when it is a reset", () => {
    const mail = startingPasswordMail({ name: "<b>Ada</b>", email: "a@example.com", role: "owner", password: "x", addedBy: "Kosi", isReset: true }, urls);
    expect(mail.subject).toBe("Your new Kotila Farms password");
    expect(mail.html).toContain("&lt;b&gt;Ada&lt;/b&gt;");
    expect(mail.html).not.toContain("<b>Ada</b>");
  });
});
