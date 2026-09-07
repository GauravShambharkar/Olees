export class AudioPeer {
  private connection: RTCPeerConnection;

  constructor(private readonly onSignal: (message: { type: "offer" | "answer" | "ice-candidate"; [key: string]: unknown }) => void) {
    this.connection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    this.connection.addEventListener("icecandidate", (event) => {
      if (event.candidate) this.onSignal({ type: "ice-candidate", candidate: event.candidate.toJSON() });
    });
  }

  async addMicrophone(stream: MediaStream) {
    stream.getTracks().forEach((track) => this.connection.addTrack(track, stream));
  }

  async createOffer() {
    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);
    this.onSignal({ type: "offer", offer });
  }

  async acceptOffer(offer: RTCSessionDescriptionInit) {
    await this.connection.setRemoteDescription(offer);
    const answer = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answer);
    this.onSignal({ type: "answer", answer });
  }

  addAnswer(answer: RTCSessionDescriptionInit) {
    return this.connection.setRemoteDescription(answer);
  }

  addCandidate(candidate: RTCIceCandidateInit) {
    return this.connection.addIceCandidate(candidate);
  }

  close() {
    this.connection.close();
  }
}
