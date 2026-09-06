import "server-only";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../config/env";

const globalForDb = globalThis as unknown as {
  sql: ReturnType<typeof postgres> | undefined;
};

const sql = globalForDb.sql ?? postgres(env.DATABASE_URL, {
  prepare: false,
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}

export const db = drizzle(sql);
