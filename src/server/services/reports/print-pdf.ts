// Print one of our own pages to an A4 PDF with headless Chromium, signed in as the person asking
import "server-only";
import { chromium } from "playwright-core";
import { env } from "@/lib/env";

type Cookie = { name: string; value: string };

// "a=1; b=2" → [{ name: "a", value: "1" }, …]
export const parseCookies = (header: string | null): Cookie[] =>
  (header ?? "").split(";").map((c) => c.trim()).filter(Boolean).map((c) => ({ name: c.slice(0, c.indexOf("=")), value: decodeURIComponent(c.slice(c.indexOf("=") + 1)) }));

export async function printPdf(base: string, path: string, cookies: Cookie[]): Promise<Buffer> {
  const executablePath = env().CHROMIUM_PATH;
  // Dev machines print with the installed Chrome; the container brings its own Chromium
  const browser = await chromium.launch(executablePath ? { executablePath, args: ["--no-sandbox"] } : { channel: "chrome" });
  try {
    const context = await browser.newContext();
    await context.addCookies(cookies.map((c) => ({ ...c, url: base })));
    const page = await context.newPage();
    const res = await page.goto(new URL(path, base).toString(), { waitUntil: "load" });
    if (!res?.ok()) throw new Error(`The report page answered ${res?.status() ?? "nothing"}.`);
    await page.emulateMedia({ media: "print" });
    return await page.pdf({ format: "A4", printBackground: true, margin: { top: "14mm", bottom: "14mm", left: "14mm", right: "14mm" } });
  } finally {
    await browser.close();
  }
}

// The PDF download for a print page, as the person asking; never the request's Host header, so the browser only visits this app
export async function pdfResponse(req: Request, path: string, filename: string): Promise<Response> {
  const pdf = await printPdf(env().INTERNAL_APP_URL ?? env().NEXTAUTH_URL, path, parseCookies(req.headers.get("cookie")));
  return new Response(new Uint8Array(pdf), { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${filename}"`, "cache-control": "no-store" } });
}
