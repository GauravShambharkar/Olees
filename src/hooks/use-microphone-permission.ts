"use client";

import { useEffect, useState } from "react";
import { requestMicrophone } from "../lib/realtime/microphone";

export function useMicrophonePermission() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    requestMicrophone()
      .then(() => setIsReady(true))
      .catch(() => setError("Microphone access is required to join an audio chat."));
  }, []);

  return { isReady, error };
}
