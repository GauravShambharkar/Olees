import { getIceServers } from "./ice-servers";

export class AudioPeer {
  onRemoteStream?: (stream: MediaStream) => void;
  private connection: RTCPeerConnection;
  private pendingCandidates: RTCIceCandidateInit[] = [];

  constructor(
    private readonly onSignal: (message: { type: "offer" | "answer" | "ice-candidate"; [key: string]: unknown }) => void,
    iceServers?: RTCIceServer[],
  ) {
    this.connection = new RTCPeerConnection({
      iceServers: iceServers ?? getIceServers(),
    });
    this.connection.addEventListener("icecandidate", (event) => {
      if (event.candidate) this.onSignal({ type: "ice-candidate", candidate: event.candidate.toJSON() });
    });
    this.connection.addEventListener("track", (event) => this.onRemoteStream?.(event.streams[0]));
  }

  async addMicrophone(stream: MediaStream) {
    stream.getTracks().forEach((track) => this.connection.addTrack(track, stream));
  }

  receiveAudioOnly() {
    this.connection.addTransceiver("audio", { direction: "recvonly" });
  }

  async createOffer() {
    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);
    this.onSignal({ type: "offer", offer });
  }

  async acceptOffer(offer: RTCSessionDescriptionInit) {
    await this.connection.setRemoteDescription(offer);
    await this.flushCandidates();
    const answer = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answer);
    this.onSignal({ type: "answer", answer });
  }

  addAnswer(answer: RTCSessionDescriptionInit) {
    return this.connection.setRemoteDescription(answer).then(() => this.flushCandidates());
  }

  async addCandidate(candidate: RTCIceCandidateInit) {
    if (!this.connection.remoteDescription) {
      this.pendingCandidates.push(candidate);
      return;
    }

    await this.connection.addIceCandidate(candidate);
  }

  private async flushCandidates() {
    const candidates = this.pendingCandidates.splice(0);
    for (const candidate of candidates) {
      await this.connection.addIceCandidate(candidate);
    }
  }

  close() {
    this.connection.close();
  }
}
