"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FiArrowRight, FiHeart } from "react-icons/fi";
import { BsSoundwave } from "react-icons/bs";

import { useMicrophoneActivity } from "../../hooks/use-microphone-activity";
import { useRemoteAudio } from "../../hooks/use-remote-audio";
import { useRandomMatch } from "../../hooks/use-random-match";
import { useProfileStore } from "../../store/profile-store";

export function ChatPage() {
  const profile = useProfileStore((state) => state.profile);
  const hasHydrated = useProfileStore((state) => state.hasHydrated);
  const { partner, localStream, remoteStream, isMatching } = useRandomMatch(profile);
  const { isTalking } = useMicrophoneActivity(localStream);
  const { isTalking: isPartnerTalking } = useMicrophoneActivity(remoteStream);
  const remoteAudioRef = useRemoteAudio(remoteStream);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!mounted || !hasHydrated) {
    return <main className="min-h-screen bg-[#ffffe6]" aria-busy="true" />;
  }

  const character = profile?.character ?? "olee1";
  const username = profile?.username ?? "You";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#ffffe6] px-3 py-4 sm:px-8 lg:px-[6.3vw] lg:py-7">
      <audio ref={remoteAudioRef} autoPlay aria-label="Matched partner audio" />
      {/* <header className="text-center">
        <h1 className="font-[Georgia,serif] text-2xl font-bold tracking-[-0.06em] text-[#ff1010] sm:text-[2rem]">
          Olees
        </h1>
      </header> */}

      <section className="mx-auto mt-6 grid w-full max-w-[1260px] grid-cols-1 items-center justify-items-center gap-5 lg:mt-12 lg:grid-cols-2 lg:gap-[7vw]">
        <ProfileCard
          profile={{ username, character }}
          variant="you"
          isTalking={isTalking}
          order="user"
        />
        <ProfileCard
          profile={partner}
          variant="anonymous"
          isTalking={isPartnerTalking}
          isMatching={isMatching}
          order="partner"
        />
      </section>
    </main>
  );
}

function ProfileCard({
  profile,
  variant,
  isTalking,
  isMatching = false,
  order,
}: {
  profile: { username: string; character: "olee1" | "olee2" } | null;
  variant: "you" | "anonymous";
  isTalking: boolean;
  isMatching?: boolean;
  order: "user" | "partner";
}) {
  const isAnonymous = variant === "anonymous";
  const label = profile?.username ?? "";
  const character = profile?.character ?? "olee2";
  const isOleeOne = character === "olee1";
  const cardColors = isOleeOne
    ? "border-[#ffc4ad] bg-gradient-to-b from-[#fff9f7] via-[#ffb79c] to-[#f04c08]"
    : "border-[#aad6ff] bg-gradient-to-b from-[#f5faff] via-[#9bcfff] to-[#3a9cf2]";
  const accentColors = isOleeOne ? "text-[#ff4d4d]" : "text-[#3e9df2]";
  const radiusColors = isOleeOne ? "border-[#ffc4ad] bg-[#F15218]" : "border-[#aad6ff] bg-[#43A0F3]";

  return (
    <article
      className={`relative flex h-[323px] min-h-0 w-[323px] max-w-[323px] flex-col items-center overflow-visible rounded-[3.5rem] border-[5px] p-4 sm:h-[628px] sm:min-h-0 sm:w-full sm:max-w-[560px] sm:rounded-[5rem] sm:p-5 lg:h-[565px] ${order === "partner" ? "order-first lg:order-none" : "order-last lg:order-none"} ${cardColors}`}
    >
      <h2
        className={`relative z-10 font-[Georgia,serif] text-[1.6rem] sm:text-[2.1rem] ${accentColors}`}
      >
        {isMatching ? "" : label}
      </h2>
      <Image
        src={isMatching ? "/oleesLoading.gif" : `/${character}.png`}
        alt={`${label}'s mascot`}
        width={430}
        height={430}
        priority
        className={` h-[151px] w-[127px] object-contain sm:mt-14 sm:h-[298px] sm:w-[298px] ${isMatching ? "h-[151px] w-[127px] sm:h-[400px] sm:w-[400px]" : ""}`}
      />
      {isTalking && !isMatching && (
        <BsSoundwave
          className={`mb-10 max-[700px]:mt-2 border h-10 w-10 shrink-0 rounded-full bg-white/80 p-2 text-white shadow-sm transition-all duration-300 ease-in-out sm:h-14 sm:w-14 sm:p-2.5 ${character === "olee1" ? "bg-linear-to-tr from-[#ff5720] to-[#FFEEE8]" : "bg-linear-to-tr from-[#d0eaff] to-[#2197ff]"}`}
          aria-label="Audio activity"
        />
      )}
      {isAnonymous && !isMatching && (
        // inverted radius component
        <div className={`absolute -bottom-1.5 z-999 left-1/2 flex max-[700px]:h-[50px] h-[72px] w-fit -translate-x-1/2 items-start justify-between gap-6 rounded-t-[30px] border-[5px] border-b-[5px] border-b-[#FFFFE6] bg-[#FFFFE6] px-3 max-[700px]:px-1 pb-0 pt-1 ${radiusColors}`}>
          <div className="absolute  -left-7 -bottom-1.5 h-7 w-7   border-[#FFFFE6] bg-[#FFFFE6]">
            <div className={`h-[25px] w-7 rounded-br-full border-[5px] border-b-5 border-l-0 border-t-0 ${radiusColors}`} />
          </div>
          <div className="absolute -bottom-1.5 -right-7 h-7 w-7 border-[#FFFFE6] bg-[#FFFFE6]">
            <div className={`h-[25px] w-7 rounded-bl-full border-[5px] border-b-5 border-r-0 border-t-0 ${radiusColors}`} />
          </div>
          <button
            type="button"
            aria-label="Like this user"
            className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#555] to-[#111] text-white shadow-lg transition-transform hover:scale-105 sm:h-[54px] sm:w-[54px]"
          >
            <FiHeart className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            type="button"
            aria-label="Next user"
            className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#555] to-[#111] text-white shadow-lg transition-transform hover:scale-105 sm:h-[54px] sm:w-[54px]"
          >
            <FiArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      )}
    </article>
  );
}
