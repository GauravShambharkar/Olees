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
        <h1 className="text-center font-[Georgia,serif] text-4xl text-[#ff4343] sm:text-5xl">
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
              placeholder="Name"
              className="w-full rounded-full border-[6px] border-[#cfe9ff] bg-[#8abcff] px-5 py-2 text-center font-[Georgia,serif] text-2xl text-white outline-none placeholder:text-white focus:border-[#ffb4b4]"
            />
          </label>
          {username.trim().length > 2 && (
            <button
              type="button"
              onClick={submitProfile}
              disabled={isSubmitting}
              aria-label="Continue with this name"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ff4343] text-2xl font-bold text-white shadow-md transition-transform hover:scale-105 disabled:opacity-70"
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
