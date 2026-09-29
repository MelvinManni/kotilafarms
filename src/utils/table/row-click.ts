// When a tap on a table row should open it: not on a control inside it, not after a drag
export const ROW_CLICK_IGNORE_SELECTOR =
  'button, a, input, select, textarea, label, [role="checkbox"], [role="combobox"], [role="menuitem"], [contenteditable="true"], [data-row-click-ignore]';

// Furthest the pointer may move between press and click and still count as a tap
export const ROW_CLICK_DRAG_THRESHOLD = 10;

export type RowClickPoint = { x: number; y: number };

// No press on this row means the click came from closing a sheet or popover above it
export function shouldActivateRow(press: RowClickPoint | null | undefined, click: RowClickPoint, threshold = ROW_CLICK_DRAG_THRESHOLD): boolean {
  if (!press) return false;
  return Math.abs(click.x - press.x) <= threshold && Math.abs(click.y - press.y) <= threshold;
}
