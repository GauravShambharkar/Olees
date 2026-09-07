import type { StateCreator } from "zustand";

export type Character = "olee1" | "olee2";

export interface ProfileSlice {
  profile: { username: string; character: Character } | null;
  setProfile: (profile: { username: string; character: Character }) => void;
  clearProfile: () => void;
}

export const createProfileSlice: StateCreator<ProfileSlice> = (set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
});
