import { randomUUID } from "node:crypto";
import { WebSocket, WebSocketServer, type WebSocket as WebSocketConnection } from "ws";

type Character = "olee1" | "olee2";
type Peer = {
  id: string;
  socket: WebSocketConnection;
  username: string;
  character: Character;
  partnerId?: string;
  removed?: boolean;
};

type IceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

const port = Number(process.env.PORT ?? process.env.REALTIME_PORT ?? 3001);
const waiting: Peer[] = [];
const peers = new Map<string, Peer>();
const server = new WebSocketServer({ port });
let cachedIceServers: IceServer[] | undefined;
let iceServersExpireAt = 0;

async function getIceServers(): Promise<IceServer[]> {
  const baseUrl = process.env.XIRSYS_PATH;
  const ident = process.env.XIRSYS_IDENT;
  const secret = process.env.XIRSYS_SECRET;
  const channel = process.env.XIRSYS_CHANNEL;

  if (!baseUrl || !ident || !secret || !channel) {
    return [{ urls: "stun:stun.l.google.com:19302" }];
  }

  if (cachedIceServers && Date.now() < iceServersExpireAt) return cachedIceServers;

  const auth = Buffer.from(`${ident}:${secret}`).toString("base64");
  const response = await fetch(`${baseUrl}/_turn/${encodeURIComponent(channel)}?webrtc=1&expire=3600`, {
    method: "PUT",
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = (await response.json()) as { s?: string; v?: { iceServers?: IceServer[] } };

  if (!response.ok || data.s !== "ok" || !data.v?.iceServers?.length) {
    throw new Error(`Xirsys TURN request failed with status ${response.status}`);
  }

  cachedIceServers = data.v.iceServers;
  iceServersExpireAt = Date.now() + 50 * 60 * 1000;
  return cachedIceServers;
}

function enqueue(peer: Peer) {
  if (!peers.has(peer.id) || peer.partnerId || waiting.includes(peer)) return;
  waiting.push(peer);
}

function send(peer: Peer, message: object) {
  if (peer.socket.readyState === WebSocket.OPEN) peer.socket.send(JSON.stringify(message));
}

function remove(peer: Peer) {
  if (peer.removed) return;
  peer.removed = true;

  const index = waiting.indexOf(peer);
  if (index >= 0) waiting.splice(index, 1);

  if (peer.partnerId) {
    const partner = peers.get(peer.partnerId);
    if (partner) {
      partner.partnerId = undefined;
      send(partner, { type: "ended" });
      enqueue(partner);
    }
  }

  peers.delete(peer.id);
}

async function match(peer: Peer) {
  const candidateIndex = waiting.findIndex((candidate) => candidate.id !== peer.id);
  if (candidateIndex < 0) {
    enqueue(peer);
    return;
  }

  const candidate = waiting.splice(candidateIndex, 1)[0];
  peer.partnerId = candidate.id;
  candidate.partnerId = peer.id;
  let iceServers: IceServer[];

  try {
    iceServers = await getIceServers();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Unable to load TURN credentials");
    iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
  }

  send(peer, {
    type: "matched",
    peerId: candidate.id,
    initiator: true,
    profile: { username: candidate.username, character: candidate.character },
    iceServers,
  });
  send(candidate, {
    type: "matched",
    peerId: peer.id,
    initiator: false,
    profile: { username: peer.username, character: peer.character },
    iceServers,
  });
}

function rematch(peer: Peer) {
  const partner = peer.partnerId ? peers.get(peer.partnerId) : undefined;

  if (partner) {
    partner.partnerId = undefined;
    send(partner, { type: "ended" });
    enqueue(partner);
  }

  peer.partnerId = undefined;
  enqueue(peer);
  void match(peer);
}

server.on("connection", (socket, request) => {
  const query = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`).searchParams;
  const username = query.get("username")?.trim();
  const character = query.get("character");

  if (!username || (character !== "olee1" && character !== "olee2")) {
    socket.close(1008, "A valid username and character are required");
    return;
  }

  const peer: Peer = { id: randomUUID(), socket, username, character };
  peers.set(peer.id, peer);
  void match(peer);

  socket.on("message", (raw) => {
    const partner = peer.partnerId ? peers.get(peer.partnerId) : undefined;
    if (!partner) return;

    try {
      const message = JSON.parse(raw.toString()) as { type?: string };
      if (message.type === "next") {
        rematch(peer);
        return;
      }
      if (["offer", "answer", "ice-candidate"].includes(message.type ?? "")) send(partner, message);
    } catch {
      send(peer, { type: "error", message: "Invalid signaling message" });
    }
  });

  socket.on("close", () => remove(peer));
  socket.on("error", () => remove(peer));
});

console.log(`Olees realtime server listening on ws://localhost:${port}`);
