"use client";

import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";
import { useProfilePicker } from "../../hooks/use-profile-picker";
import { useMicrophonePermission } from "../../hooks/use-microphone-permission";

export function ProfilePicker() {
  const { username, setUsername, character, setCharacter, isSubmitting, error, submitProfile } = useProfilePicker();
  const { error: microphoneError } = useMicrophonePermission();

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden  px-5 py-10">
      <div className="absolute inset-0 " />
      <section className="relative z-10 w-full max-w-[740px]  px-6 py-10   sm:px-12">
        <h1 className="text-center font-caprasimo text-4xl tracking-tight text-[#ff4343] sm:text-5xl">
          Select your olee
        </h1>

        <div className="mt-12 flex justify-center gap-5 sm:gap-12">
          {(["olee1", "olee2"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={character === option}
              onClick={() => setCharacter(option)}
              className={`flex h-36 w-36 items-center justify-center rounded-[2.3rem] bg-white p-2 shadow-[0_4px_9px_rgba(0,0,0,0.12)] transition-transform hover:scale-105 sm:h-48 sm:w-48 ${character === option ? "border-[6px] border-[#d0eaff]" : "border-[6px] border-transparent"}`}
            >
              <Image
                src={`/${option}.png`}
                alt={`${option} mascot`}
                width={195}
                height={195}
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>

        <div className="mx-auto mt-12 flex max-w-[245px] items-center gap-3">
          <label className="block flex-1" htmlFor="profile-name">
            <span className="sr-only">Name</span>
            <input
              id="profile-name"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={40}
              placeholder="Olee Name"
              className="h-14 w-full rounded-full border-4 border-[#c33a3a] bg-gradient-to-r from-[#ff1010] to-[#e20000] px-5 text-center font-caprasimo text-xl tracking-wide text-white shadow-[0_6px_12px_rgba(0,0,0,0.2),inset_-4px_-5px_0_rgba(255,255,255,0.19)] outline-none transition-all placeholder:text-white/90 focus:border-[#ff7777] focus:shadow-[0_6px_15px_rgba(255,16,16,0.3),inset_-4px_-5px_0_rgba(255,255,255,0.22)] sm:text-2xl"
            />
          </label>
          {username.trim().length > 2 && (
            <button
              type="button"
              onClick={submitProfile}
              disabled={isSubmitting}
              aria-label="Continue with this name"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-[#c33a3a] bg-gradient-to-r from-[#ff1010] to-[#e20000] font-sans text-2xl font-bold text-white shadow-[0_6px_12px_rgba(0,0,0,0.2),inset_-3px_-4px_0_rgba(255,255,255,0.19)] transition-transform hover:scale-105 disabled:opacity-70"
            >
              <FiArrowRight aria-hidden="true" />
            </button>
          )}
        </div>
        {error && (
          <p className="mt-3 text-center text-sm font-semibold text-[#c33a3a]">
            {error}
          </p>
        )}
        {microphoneError && (
          <p className="mt-3 text-center text-sm font-semibold text-[#c33a3a]">
            {microphoneError}
          </p>
        )}
      </section>
    </main>
  );
}
