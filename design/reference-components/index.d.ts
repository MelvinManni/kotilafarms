// Kotila Farm Ledger — component types (documentation). Global: window.Kotila
import type { ReactNode } from 'react';

export type IconName = 'home' | 'sets' | 'log' | 'feed' | 'weight' | 'health' | 'sales' | 'expenses' | 'finance' | 'reports' | 'settings'
  | 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevron-right' | 'chevron-left' | 'chevron-down' | 'eye' | 'wifi-off' | 'sync' | 'alert'
  | 'info' | 'clock' | 'history' | 'user' | 'users' | 'calendar' | 'calendar-x' | 'receipt' | 'camera' | 'download' | 'filter' | 'arrow-up'
  | 'arrow-down' | 'edit' | 'lock' | 'water' | 'temp' | 'truck' | 'bag' | 'syringe' | 'scale' | 'compare' | 'note' | 'naira' | 'more';
export type Role = 'owner' | 'manager' | 'recorder';
export type SetStatus = 'brooding' | 'growing' | 'selling' | 'closed';
export type Option = string | { value: string; label: string };

/** Stroke icon, 24px grid, 2px stroke. Decorative unless `label` is given. */
export declare function Icon(p: { name: IconName; size?: number; strokeWidth?: number; color?: string; label?: string }): JSX.Element;
/** One primary per view. `lg` (56px) on entry screens, `xl` (64px) for the phone's main action. */
export declare function Button(p: { variant?: 'primary' | 'secondary' | 'outline' | 'quiet' | 'danger' | 'owed'; size?: 'md' | 'lg' | 'xl'; icon?: IconName; full?: boolean; href?: string; disabled?: boolean; type?: 'button' | 'submit'; onClick?: () => void; children?: ReactNode }): JSX.Element;
/** Icon-only button. `label` is required: it becomes aria-label and the tooltip. */
export declare function IconButton(p: { icon: IconName; label: string; tooltip?: string; variant?: 'default' | 'ghost'; size?: 'md' | 'lg'; tooltipPlacement?: 'above' | 'below'; onClick?: () => void }): JSX.Element;
/** Hover/focus tooltip. Wrap any focusable element. `open` forces it visible (previews, docs). */
export declare function Tooltip(p: { label: ReactNode; placement?: 'above' | 'below'; open?: boolean; children: ReactNode }): JSX.Element;
export declare function Field(p: { label?: ReactNode; hint?: ReactNode; error?: ReactNode; required?: boolean; optional?: boolean; htmlFor?: string; aside?: ReactNode; children: ReactNode }): JSX.Element;
export declare function TextInput(p: { label?: string; value?: string; defaultValue?: string; onChange?: (v: string) => void; placeholder?: string; hint?: string; error?: string; required?: boolean; optional?: boolean; readOnly?: boolean; multiline?: boolean; suffix?: string; type?: string; inputMode?: string }): JSX.Element;
/** Naira amount. Shows ₦ and thousands separators, no decimals. `calculated` marks a value derived from two others. */
export declare function MoneyInput(p: { label?: string; value?: number | null; defaultValue?: number; onChange?: (v: number | null) => void; hint?: string; error?: string; required?: boolean; calculated?: boolean; readOnly?: boolean }): JSX.Element;
export declare function Select(p: { label?: string; options: Option[]; value?: string; defaultValue?: string; placeholder?: string; onChange?: (v: string) => void; hint?: string; error?: string; required?: boolean; optional?: boolean }): JSX.Element;
/** quantity × unit price = total. Any two calculate the third; none can be blank. Bags of feed, birds sold. */
export declare function LinkedAmounts(p: { quantityLabel?: string; quantityUnit?: string; unitLabel?: string; totalLabel?: string; defaultQuantity?: number; defaultUnitPrice?: number; defaultTotal?: number; stacked?: boolean; note?: string; onChange?: (v: { quantity: number; unitPrice: number; total: number }) => void }): JSX.Element;
/** Big − / + counter for mortality and other counts. 72px targets. `alertAbove` turns the value alert-coloured. */
export declare function Stepper(p: { label?: string; value?: number; defaultValue?: number; onChange?: (v: number) => void; min?: number; max?: number; step?: number; unit?: string; hint?: string; alertAbove?: number; size?: 'md' | 'lg'; aside?: ReactNode }): JSX.Element;
/** Toggle chips. Quick observation tags (multiple) or a short optional cause (single). */
export declare function ChipGroup(p: { label?: string; options: Option[]; value?: string[] | string | null; defaultValue?: string[] | string | null; multiple?: boolean; onChange?: (v: any) => void; size?: 'sm' | 'md'; optional?: boolean; hint?: string }): JSX.Element;
export declare function Segmented(p: { label?: string; options: Option[]; value?: string; defaultValue?: string; onChange?: (v: string) => void; optional?: boolean }): JSX.Element;
/** Required Set-or-overhead choice for every expense. Value: a Set id or 'overhead'. */
export declare function AttributionField(p: { sets: { id: string; label: string; meta?: string }[]; value?: string; defaultValue?: string; onChange?: (v: string) => void; showError?: boolean; label?: string; overheadHint?: string }): JSX.Element;
export declare function Checkbox(p: { label: ReactNode; checked?: boolean; defaultChecked?: boolean; onChange?: (v: boolean) => void }): JSX.Element;
export declare function Tag(p: { tone?: 'neutral' | 'success' | 'warning' | 'alert' | 'deep' | 'closed'; dot?: boolean; title?: string; children: ReactNode }): JSX.Element;
export declare function StatusChip(p: { status: SetStatus; day?: number }): JSX.Element;
/** A labelled figure. Money and counts are ink; `tone="alert"` only when a number needs action. */
export declare function Figure(p: { label?: ReactNode; value: ReactNode; sub?: ReactNode; delta?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; tone?: 'alert' | 'owed' | 'ondeep' | 'standard' }): JSX.Element;
export declare function Delta(p: { direction?: 'up' | 'down' | 'flat'; goodWhen?: 'up' | 'down'; tone?: 'good' | 'bad'; tooltip?: string; children: ReactNode }): JSX.Element;
export declare function Money(p: { value: number; sign?: boolean }): JSX.Element;
export declare function Panel(p: { title?: ReactNode; subtitle?: ReactNode; headline?: boolean; action?: ReactNode | { label: string; href?: string; onClick?: () => void }; variant?: 'sunken' | 'raised' | 'deep'; flush?: boolean; children?: ReactNode }): JSX.Element;
export declare function Rows(p: { items: { label: ReactNode; value: ReactNode; sub?: ReactNode; total?: boolean; tone?: 'alert' | 'owed' }[] }): JSX.Element;
export type Cell = ReactNode | { value?: ReactNode; sub?: ReactNode; tone?: 'alert' | 'owed' | 'muted'; figure?: boolean; tag?: { tone: string; label: string }; status?: SetStatus; day?: number; delta?: { direction: 'up' | 'down'; label: string; tone?: 'good' | 'bad' } };
export declare function LedgerTable(p: { columns: { key: string; label: string; align?: 'left' | 'right' | 'center'; width?: number | string }[]; rows: Record<string, Cell>[]; footer?: Record<string, Cell>; dense?: boolean; caption?: string; onRowClick?: (row: any) => void }): JSX.Element;
export declare function Notice(p: { tone?: 'neutral' | 'warning' | 'alert' | 'success' | 'owed'; icon?: IconName; title?: ReactNode; compact?: boolean; action?: ReactNode | { label: string; variant?: string; href?: string; onClick?: () => void }; children?: ReactNode }): JSX.Element;
/** Connection and sync state. Always words plus colour, with an explanatory tooltip. */
export declare function SyncStatus(p: { state: 'synced' | 'syncing' | 'offline' | 'conflict'; pending?: number; lastSynced?: string; variant?: 'pill' | 'block'; tooltip?: string; tooltipOpen?: boolean; tooltipPlacement?: 'above' | 'below'; onClick?: () => void }): JSX.Element;
export declare function Person(p: { name: string; role?: Role; meta?: string; size?: 'sm' | 'md' | 'lg'; hideText?: boolean }): JSX.Element;
export declare function RoleBadge(p: { role: Role }): JSX.Element;
/** Who changed what, when, from what. Every record's edit history. */
export declare function AuditTrail(p: { entries: { who: string; role?: Role; when: string; action?: string; field?: string; from?: ReactNode; to?: ReactNode; note?: string; device?: string }[] }): JSX.Element;
export declare function EmptyState(p: { title: string; icon?: IconName; action?: ReactNode | { label: string; icon?: IconName; href?: string; onClick?: () => void }; children?: ReactNode }): JSX.Element;
export declare function SideRail(p: { active?: string; items?: { id: string; label: string; icon: IconName; href?: string; roles?: Role[] }[]; badges?: Record<string, number | { count: number; title: string }>; user?: { name: string; role: Role }; sync?: { state: 'synced' | 'syncing' | 'offline' | 'conflict'; pending?: number; lastSynced?: string }; logoSrc?: string }): JSX.Element;
export declare function TopBar(p: { title?: string; back?: string; logoSrc?: string; sync?: { state: 'synced' | 'syncing' | 'offline' | 'conflict'; pending?: number; lastSynced?: string }; user?: { name: string; role: Role } }): JSX.Element;
export declare function TabBar(p: { active?: string; items?: { id: string; label: string; icon?: IconName; href?: string; primary?: boolean }[] }): JSX.Element;
export declare function Tabs(p: { items: (string | { value: string; label: string; count?: number })[]; active?: string; onChange?: (v: string) => void }): JSX.Element;
export declare function Wordmark(p: {}): JSX.Element;
/** Glass modal (desktop) or bottom sheet (phone). Positioned over its nearest positioned ancestor unless `fixed`. */
export declare function Sheet(p: { title: ReactNode; description?: ReactNode; open?: boolean; variant?: 'modal' | 'sheet'; wide?: boolean; fixed?: boolean; onClose?: () => void; footer?: ReactNode; children?: ReactNode }): JSX.Element | null;
/** Weight vs breed standard by day of age: ±5% band, today marker, late zone, projection gap. */
export declare function GrowthChart(p: { samples: { day: number; kg: number }[]; standard?: { day: number; kg: number }[]; today?: number; projectTo?: number; lateFrom?: number | null; maxDay?: number; maxKg?: number; theme?: 'deep' | 'light'; callout?: boolean; ariaLabel?: string }): JSX.Element;
export declare function Sparkline(p: { values: number[]; width?: number; height?: number; tone?: 'default' | 'alert'; endTone?: 'alert'; label?: string }): JSX.Element | null;
export declare function BarList(p: { items: { label: string; value: number }[]; format?: 'naira' | 'plain'; emphasizeFirst?: boolean }): JSX.Element;
export declare const format: { naira(n: number, o?: { sign?: boolean }): string; pct(n: number, digits?: number): string; kg(n: number, digits?: number): string; int(n: number): string };
export declare const standardCurve: { day: number; kg: number }[];
