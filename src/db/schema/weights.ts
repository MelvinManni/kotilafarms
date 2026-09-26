// Weight samples: each bird's weight in grams; average, CV and uniformity are computed
import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { commonColumns } from "@/db/schema/_common";
import { farmDay } from "@/db/schema/_columns";
import { sets } from "@/db/schema/sets";

export const weightSamples = pgTable(
  "weight_samples",
  {
    ...commonColumns("weight_samples"),
    setId: uuid()
      .notNull()
      .references(() => sets.id),
    date: farmDay().notNull(),
    ageDays: integer().notNull(),
    weightsGrams: integer().array().notNull(),
    // Set when another device saved what looks like the same sample
    possibleDuplicateOf: uuid(),
  },
  (t) => [
    index("weight_samples_set_date").on(t.setId, t.date),
    check("weight_samples_has_weights", sql`cardinality(${t.weightsGrams}) >= 1`),
    check("weight_samples_age_not_negative", sql`${t.ageDays} >= 0`),
  ],
);
