"use client";

import { useState } from "react";
import type { Character } from "../store/slices/profile-slice";

export type MatchedProfile = { username: string; character: Character };

export function useRandomMatch() {
  const [partner] = useState<MatchedProfile | null>(null);

  return { partner, isMatching: partner === null };
}
