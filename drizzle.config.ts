import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

const envFile = process.env.NODE_ENV === "development" ? ".env.local" : ".env";
dotenv.config({ path: envFile });

if (!process.env.DATABASE_URL) {
  throw new Error(`DATABASE_URL is missing from ${envFile}`);
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
