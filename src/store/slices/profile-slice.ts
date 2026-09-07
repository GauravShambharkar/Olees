import type { StateCreator } from "zustand";

export type Character = "olee1" | "olee2";

export interface ProfileSlice {
  profile: { username: string; character: Character } | null;
  hasHydrated: boolean;
  setProfile: (profile: { username: string; character: Character }) => void;
  clearProfile: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const createProfileSlice: StateCreator<ProfileSlice> = (set) => ({
  profile: null,
  hasHydrated: false,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
  setHasHydrated: (hasHydrated) => set({ hasHydrated }),
});
