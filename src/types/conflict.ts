// A daily log two people entered for the same Set and day, waiting for a manager to keep one
export type LogVersion = { deaths: number; feedQty: number | null; feedUnit: string; waterLevel: string | null; tags: string[]; note: string | null; by: string };

export type LogConflict = {
  id: string;
  setId: string;
  setNumber: number;
  date: string;
  existing: LogVersion & { id: string; version: number };
  incoming: LogVersion;
  raisedAt: string;
};
