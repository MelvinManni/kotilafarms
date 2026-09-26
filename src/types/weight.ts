// Weight samples with their worked-out stats, and the Set's breed standard
export type WeightSampleRow = {
  id: string;
  date: string;
  ageDays: number;
  count: number;
  averageGrams: number;
  uniformity: number;
  cv: number;
  standardGrams: number | null;
  gap: number | null;
  dailyGainGrams: number | null;
  weightsGrams: number[];
  by: string;
  possibleDuplicateOf: string | null;
};

export type SetWeights = { standard: { day: number; grams: number }[]; samples: WeightSampleRow[] };
