// Shared email frame: escaped text, a green button, the Kotila header and footer
const GREEN = "#1f5c3a";

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function button(label: string, href: string, tone: "primary" | "outline" = "primary"): string {
  const style =
    tone === "primary"
      ? `background:${GREEN};color:#ffffff;border:2px solid ${GREEN}`
      : `background:#ffffff;color:${GREEN};border:2px solid ${GREEN}`;
  return `<a href="${escapeHtml(href)}" style="${style};display:inline-block;padding:12px 20px;border-radius:10px;font-weight:600;text-decoration:none;margin:4px 8px 4px 0">${escapeHtml(label)}</a>`;
}

// Body is already-escaped HTML
export function frame(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#1d2420">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
<p style="margin:0 0 16px;font-size:18px;font-weight:700;color:${GREEN}">Kotila Farms</p>
<div style="background:#ffffff;border-radius:14px;padding:24px;font-size:16px;line-height:1.5">
<h1 style="margin:0 0 16px;font-size:20px">${escapeHtml(title)}</h1>
${body}
</div>
<p style="margin:16px 0 0;font-size:13px;color:#5b645f">Sent by the Kotila Farms record app.</p>
</div></body></html>`;
}
