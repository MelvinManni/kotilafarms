// Optional cause of death: short on purpose, never required
export const DEATH_CAUSES = [
  { value: "unknown", label: "Unknown" },
  { value: "disease", label: "Disease" },
  { value: "heat", label: "Heat" },
  { value: "culled", label: "Culled" },
  { value: "predator", label: "Predator" },
  { value: "crush", label: "Crushed" },
] as const;

export type DeathCause = (typeof DEATH_CAUSES)[number]["value"];

export const CAUSE_VALUES = DEATH_CAUSES.map((c) => c.value) as [DeathCause, ...DeathCause[]];
