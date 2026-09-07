"use client";

import { useEffect, useState } from "react";
import { AudioPeer } from "../lib/realtime/audio-peer";
import { SignalingClient, type SignalMessage } from "../lib/realtime/signaling-client";
import type { Character } from "../store/slices/profile-slice";
import { requestMicrophone } from "../lib/realtime/microphone";

export type MatchedProfile = { username: string; character: Character };

export function useRandomMatch(profile: MatchedProfile | null) {
  const [partner, setPartner] = useState<MatchedProfile | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const username = profile?.username;
  const character = profile?.character;

  useEffect(() => {
    if (!username || !character) return;
    const currentProfile = { username, character };

    const signaling = new SignalingClient();
    let peer: AudioPeer | undefined;
    let microphone: MediaStream | undefined;
    let cancelled = false;
    const pendingSignals: SignalMessage[] = [];
    const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL ?? "ws://localhost:3001";
    requestMicrophone()
      .then((stream) => {
        if (cancelled) return;
        microphone = stream;
        setLocalStream(stream);
      })
      .catch(() => setLocalStream(null));

    signaling.connect(
        `${realtimeUrl}?username=${encodeURIComponent(currentProfile.username)}&character=${currentProfile.character}`,
        "profile",
        async (message: SignalMessage) => {
          if (cancelled) return;
          if (message.type === "matched") {
            peer?.close();
            setPartner(message.profile);
            if (!microphone) {
              microphone = await requestMicrophone().catch(() => undefined);
            }
            setLocalStream(microphone ?? null);
            peer = new AudioPeer((signal) => signaling.send(signal as SignalMessage));
            peer.onRemoteStream = setRemoteStream;
            if (microphone) await peer.addMicrophone(microphone);
            for (const pendingSignal of pendingSignals.splice(0)) {
              if (pendingSignal.type === "offer") await peer.acceptOffer(pendingSignal.offer);
              if (pendingSignal.type === "answer") await peer.addAnswer(pendingSignal.answer);
              if (pendingSignal.type === "ice-candidate") await peer.addCandidate(pendingSignal.candidate);
            }
            if (message.initiator) await peer.createOffer();
          } else if (message.type === "offer") {
            if (peer) await peer.acceptOffer(message.offer);
            else pendingSignals.push(message);
          } else if (message.type === "answer") {
            if (peer) await peer.addAnswer(message.answer);
            else pendingSignals.push(message);
          } else if (message.type === "ice-candidate") {
            if (peer) await peer.addCandidate(message.candidate);
            else pendingSignals.push(message);
          }
          else if (message.type === "ended") {
            peer?.close();
            peer = undefined;
            pendingSignals.length = 0;
            setPartner(null);
            setRemoteStream(null);
          }
        },
      );
    return () => {
      cancelled = true;
      peer?.close();
      signaling.close();
    };
  }, [username, character]);

  return { partner, localStream, remoteStream, isMatching: partner === null };
}
