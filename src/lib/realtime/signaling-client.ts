export type Character = "olee1" | "olee2";

export type SignalMessage =
  | { type: "matched"; peerId: string; initiator: boolean; profile: { username: string; character: Character } }
  | { type: "offer"; offer: RTCSessionDescriptionInit }
  | { type: "answer"; answer: RTCSessionDescriptionInit }
  | { type: "ice-candidate"; candidate: RTCIceCandidateInit }
  | { type: "ended" };

export class SignalingClient {
  private socket: WebSocket | null = null;
  private pendingMessages: SignalMessage[] = [];

  connect(url: string, sessionId: string, onMessage: (message: SignalMessage) => void) {
    const socketUrl = new URL(url);
    socketUrl.searchParams.set("sessionId", sessionId);
    this.socket = new WebSocket(socketUrl.toString());
    this.socket.addEventListener("open", () => {
      for (const message of this.pendingMessages.splice(0)) {
        this.socket?.send(JSON.stringify(message));
      }
    });
    this.socket.addEventListener("message", (event) => onMessage(JSON.parse(event.data) as SignalMessage));
    return this.socket;
  }

  send(message: SignalMessage) {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) return;
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      return;
    }
    this.pendingMessages.push(message);
  }

  close() {
    this.socket?.close();
    this.socket = null;
    this.pendingMessages = [];
  }
}
