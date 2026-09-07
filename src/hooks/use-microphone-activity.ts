"use client";

import { useEffect, useRef, useState } from "react";

// Tune these based on testing in your target environment.
const START_THRESHOLD = 0.02;
const STOP_THRESHOLD = 0.01;
const SILENCE_DELAY = 400;    // ms of sustained quiet before flipping back to false
const SMOOTHING = 0.7;        // manual exponential smoothing factor (0-1, higher = smoother/slower)
const FFT_SIZE = 2048;

export type MicError = 'denied' | 'not-found' | 'unknown' | null;

interface UseMicrophoneActivityResult {
  isTalking: boolean;
  micError: MicError;
}

export function useMicrophoneActivity(stream: MediaStream | null): UseMicrophoneActivityResult {
  const [isTalking, setIsTalking] = useState(false);
  const [micError, setMicError] = useState<MicError>(null);

  const lastInputAt = useRef(0);
  const talking = useRef(false);
  const smoothedLevel = useRef(0);

  useEffect(() => {
    let frame = 0;
    let context: AudioContext | undefined;
    let cancelled = false;

    async function monitor() {
      try {
        if (!stream) return;
        context = new AudioContext();
        await context.resume();
        const analyser = context.createAnalyser();
        analyser.fftSize = FFT_SIZE;

        const source = context.createMediaStreamSource(stream);
        const silentOutput = context.createGain();
        silentOutput.gain.value = 0;
        const samples = new Float32Array(analyser.fftSize);
        source.connect(analyser);
        analyser.connect(silentOutput);
        silentOutput.connect(context.destination);

        const check = () => {
          if (cancelled) return;

          analyser.getFloatTimeDomainData(samples);

          const rms = Math.sqrt(
            samples.reduce((sum, sample) => sum + sample ** 2, 0) / samples.length,
          );

          // Smooth the RMS level so brief pauses do not flicker the indicator.
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

    if (stream) monitor();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      void context?.close();
    };
  }, [stream]);

  return { isTalking, micError };
}
