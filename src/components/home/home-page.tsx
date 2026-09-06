"use client";

import Image from "next/image";
import { useState } from "react";

function SoundMark() {
  return (
    <span aria-hidden="true" className="flex items-center gap-1">
      <span className="h-2 w-1 rounded-full bg-white" />
      <span className="h-4 w-1 rounded-full bg-white" />
      <span className="h-7 w-1 rounded-full bg-white" />
      <span className="h-4 w-1 rounded-full bg-white" />
      <span className="h-2 w-1 rounded-full bg-white" />
    </span>
  );
}

export function HomePage() {
  const [isStarting, setIsStarting] = useState(false);

  function handleStart() {
    if (isStarting) return;
    setIsStarting(true);
    window.setTimeout(() => setIsStarting(false), 1500);
  }

  return (
    <main className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#ffffe6] px-6 py-12">
      <div className="pointer-events-none absolute left-1/2 top-[16%] -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-[#ffdb72]/25 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-12 pb-8 sm:gap-14">
        <div className="text-center">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.42em] text-[#b94528]">
            confidential audio chat
          </p>
          <h1 className="mt-2 font-[Georgia,serif] text-7xl leading-none tracking-[0.04em] text-[#ff1010] sm:text-8xl">
            Olees
          </h1>
        </div>

        <button
          type="button"
          onClick={handleStart}
          disabled={isStarting}
          className="group flex min-h-20 cursor-pointer items-center gap-5 rounded-[2.7rem] border-4 border-[#c33a3a] bg-gradient-to-r from-[#ff1010] to-[#e20000] px-8 text-white shadow-[0_7px_15px_rgba(0,0,0,0.22),inset_-4px_-5px_0_rgba(255,255,255,0.19)] transition-transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-[#ff1010]/25 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 sm:px-9"
        >
          {isStarting ? (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/35 border-t-white" />
          ) : (
            <span className="text-[2rem] font-normal leading-none tracking-[-0.04em] [font-family:Georgia,serif] sm:text-[2.35rem]">
              Start Session
            </span>
          )}
          {!isStarting && <SoundMark />}
          <span className="sr-only">{isStarting ? "Starting session" : "Start session"}</span>
        </button>
      </div>

      <Image
        src="/olee1.png"
        alt="Olee mascot holding a tiny plant"
        width={949}
        height={949}
        priority
        className="pointer-events-none absolute -bottom-24 left-1/2 w-[min(82vw,40rem)] max-w-[320px] -translate-x-1/2 object-contain sm:-bottom-40 sm:left-[8%] sm:w-[min(62vw,40rem)] sm:translate-x-0 lg:left-[14%]"
      />
    </main>
  );
}
