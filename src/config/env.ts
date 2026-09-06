import "server-only";

import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL: z.string().url().startsWith("postgres"),
});

const parsedEnvironment = environmentSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
});

if (!parsedEnvironment.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnvironment.error.message}`);
}

export const env = parsedEnvironment.data;
