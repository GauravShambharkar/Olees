export type Character = "olee1" | "olee2";

export type SignalMessage =
  | { type: "matched"; peerId: string; initiator: boolean; profile: { username: string; character: Character } }
  | { type: "offer"; offer: RTCSessionDescriptionInit }
  | { type: "answer"; answer: RTCSessionDescriptionInit }
  | { type: "ice-candidate"; candidate: RTCIceCandidateInit }
  | { type: "ended" };

export class SignalingClient {
  private socket: WebSocket | null = null;

  connect(url: string, sessionId: string, onMessage: (message: SignalMessage) => void) {
    const socketUrl = new URL(url);
    socketUrl.searchParams.set("sessionId", sessionId);
    this.socket = new WebSocket(socketUrl.toString());
    this.socket.addEventListener("message", (event) => onMessage(JSON.parse(event.data) as SignalMessage));
    return this.socket;
  }

  send(message: SignalMessage) {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message));
  }

  close() {
    this.socket?.close();
    this.socket = null;
  }
}
