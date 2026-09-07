let microphoneStream: MediaStream | null = null;

export async function requestMicrophone() {
  if (microphoneStream?.active) return microphoneStream;

  microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return microphoneStream;
}

export function getMicrophoneStream() {
  return microphoneStream?.active ? microphoneStream : null;
}

export function stopMicrophone() {
  microphoneStream?.getTracks().forEach((track) => track.stop());
  microphoneStream = null;
}
