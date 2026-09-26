// Quick tags for what was seen in the pen (raw material for the weekly review)
export const OBSERVATION_TAGS = [
  { value: "coughing", label: "Coughing" },
  { value: "green_stool", label: "Green stool" },
  { value: "lethargy", label: "Lethargy" },
  { value: "panting", label: "Panting" },
  { value: "wet_litter", label: "Wet litter" },
  { value: "poor_appetite", label: "Poor appetite" },
] as const;

export type ObservationTag = (typeof OBSERVATION_TAGS)[number]["value"];

export const TAG_VALUES = OBSERVATION_TAGS.map((t) => t.value) as [ObservationTag, ...ObservationTag[]];

export const tagLabel = (value: string) => OBSERVATION_TAGS.find((t) => t.value === value)?.label ?? value;
