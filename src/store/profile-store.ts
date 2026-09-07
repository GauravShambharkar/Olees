import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createProfileSlice, type ProfileSlice } from "./slices/profile-slice";

export const useProfileStore = create<ProfileSlice>()(
  persist(createProfileSlice, {
    name: "profile-storage",
    storage: createJSONStorage(() => localStorage),
    onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
  }),
);
