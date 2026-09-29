// One line of the activity log, and a page of them
export type ActivityItem = { id: string; at: string; who: string | null; role: string | null; text: string; reason: string | null; ip: string | null };

export type ActivityPage = { items: ActivityItem[]; nextBefore: string | null };
