// Postgres enums shared across tables
import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["owner", "manager", "recorder"]);
export const setStatusEnum = pgEnum("set_status", ["brooding", "growing", "selling", "closed"]);
export const deathCauseEnum = pgEnum("death_cause", ["unknown", "disease", "heat", "culled", "predator", "crush"]);
export const feedUnitEnum = pgEnum("feed_unit", ["bags", "kg"]);
export const waterLevelEnum = pgEnum("water_level", ["low", "normal", "high"]);
export const feedKindEnum = pgEnum("feed_kind", ["starter", "grower", "finisher"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "transfer", "pos"]);
export const otherSaleKindEnum = pgEnum("other_sale_kind", ["manure"]);
export const conflictResolutionEnum = pgEnum("conflict_resolution", ["kept_existing", "kept_incoming"]);
export const syncStatusEnum = pgEnum("sync_status", ["applied", "conflict", "rejected"]);
export const auditActionEnum = pgEnum("audit_action", ["create", "update", "delete", "resolve"]);
