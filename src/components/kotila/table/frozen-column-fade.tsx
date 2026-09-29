// Soft shadow beside the pinned first column once the table has scrolled sideways
export function FrozenColumnFade() {
  return <span aria-hidden className="pointer-events-none absolute inset-y-0 left-full w-6 bg-linear-to-r from-ink/8 to-transparent" />;
}
