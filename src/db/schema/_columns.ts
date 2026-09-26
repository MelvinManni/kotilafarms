// Column helpers: money in whole naira, farm days, event times
import { bigint, date, timestamp } from "drizzle-orm/pg-core";

// Money is integer naira; JS numbers are exact up to ₦9 quadrillion
export const money = () => bigint({ mode: "number" });

// A farm day (YYYY-MM-DD), no time zone
export const farmDay = () => date({ mode: "string" });

// A moment in time, stored with time zone
export const eventTime = () => timestamp({ withTimezone: true, mode: "date" });

export const timestamps = () => ({
  createdAt: eventTime().notNull().defaultNow(),
  updatedAt: eventTime()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
