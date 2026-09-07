"use client";

import { useEffect, useRef, useState } from "react";

// Tune these based on testing in your target environment.
const START_THRESHOLD = 4;    // RMS level to begin "talking"
const STOP_THRESHOLD = 2.5;   // RMS level to end "talking" (lower = hysteresis, avoids flicker)
const SILENCE_DELAY = 400;    // ms of sustained quiet before flipping back to false
const SMOOTHING = 0.7;        // manual exponential smoothing factor (0-1, higher = smoother/slower)
const FFT_SIZE = 2048;

export type MicError = 'denied' | 'not-found' | 'unknown' | null;

interface UseMicrophoneActivityResult {
  isTalking: boolean;
  micError: MicError;
}

export function useMicrophoneActivity(): UseMicrophoneActivityResult {
  const [isTalking, setIsTalking] = useState(false);
  const [micError, setMicError] = useState<MicError>(null);

  const lastInputAt = useRef(0);
  const talking = useRef(false);
  const smoothedLevel = useRef(0);

  useEffect(() => {
    let frame = 0;
    let context: AudioContext | undefined;
    let stream: MediaStream | undefined;
    let cancelled = false;

    async function monitor() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        stream = mediaStream;
        context = new AudioContext();
        const analyser = context.createAnalyser();
        analyser.fftSize = FFT_SIZE;

        const source = context.createMediaStreamSource(stream);
        const samples = new Uint8Array(analyser.fftSize);
        source.connect(analyser);

        const check = () => {
          if (cancelled) return;

          analyser.getByteTimeDomainData(samples);

          const rms = Math.sqrt(
            samples.reduce((sum, sample) => sum + (sample - 128) ** 2, 0) / samples.length
          );

          // analyser.smoothingTimeConstant does NOT affect getByteTimeDomainData,
          // so we smooth manually to avoid frame-to-frame jitter/flicker.
          smoothedLevel.current = smoothedLevel.current * SMOOTHING + rms * (1 - SMOOTHING);

          const now = performance.now();

          if (smoothedLevel.current >= START_THRESHOLD) {
            lastInputAt.current = now;
            if (!talking.current) {
              talking.current = true;
              setIsTalking(true);
            }
          } else if (
            talking.current &&
            smoothedLevel.current < STOP_THRESHOLD &&
            now - lastInputAt.current >= SILENCE_DELAY
          ) {
            talking.current = false;
            setIsTalking(false);
          }

          frame = window.requestAnimationFrame(check);
        };

        check();
      } catch (err) {
        if (cancelled) return;

        setIsTalking(false);

        const name = (err as DOMException)?.name;
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setMicError('denied');
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          setMicError('not-found');
        } else {
          setMicError('unknown');
        }
      }
    }

    monitor();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      void context?.close();
    };
  }, []);

  return { isTalking, micError };
}
