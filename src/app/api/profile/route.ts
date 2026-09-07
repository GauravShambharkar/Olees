import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  username: z.string().trim().min(1).max(40),
  character: z.enum(["olee1", "olee2"]),
});

export async function POST(request: Request) {
  const result = profileSchema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json({ error: "Choose a valid name and mascot." }, { status: 400 });
  }

  return NextResponse.json({
    profile: result.data,
    sessionId: randomUUID(),
  });
}
