import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const characterEnum = pgEnum("character", ["olee1", "olee2"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull(),
  character: characterEnum("character").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
