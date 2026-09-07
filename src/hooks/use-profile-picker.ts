"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProfileStore } from "../store/profile-store";
import type { Character } from "../store/slices/profile-slice";

export function useProfilePicker() {
  const router = useRouter();
  const setProfile = useProfileStore((state) => state.setProfile);
  const [username, setUsername] = useState("");
  const [character, setCharacter] = useState<Character>("olee1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submitProfile() {
    if (username.trim().length < 3 || isSubmitting) {
      setError("Your name needs at least 3 characters.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), character }),
    });

    if (!response.ok) {
      setError("Please choose a valid name.");
      setIsSubmitting(false);
      return;
    }

    setProfile({ username: username.trim(), character });
    router.push("/chat");
  }

  return {
    username,
    setUsername,
    character,
    setCharacter,
    isSubmitting,
    error,
    submitProfile,
  };
}
