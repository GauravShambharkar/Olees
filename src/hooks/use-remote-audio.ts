"use client";

import { useEffect, useRef } from "react";

export function useRemoteAudio(stream: MediaStream | null) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.srcObject = stream;
    if (stream) void audioRef.current.play().catch(() => undefined);
  }, [stream]);

  return audioRef;
}
