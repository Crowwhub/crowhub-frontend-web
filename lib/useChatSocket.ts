"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { BASE_URL, getToken, type ChatMessage } from "@/lib/api";

/**
 * Single socket.io connection to the chat gateway.
 *
 * Backend contract (backend-crow chat.gateway.ts):
 *   - client emits `joinRoom`    { matchId }
 *   - client emits `sendMessage` { matchId, senderId, message }
 *   - server emits `newMessage`  -> the saved ChatMessage, to everyone in the room
 *
 * We join a room per match so live messages arrive for every open conversation
 * (drives unread badges), not just the selected one.
 */
export function useChatSocket(opts: {
  roomIds: string[];
  onMessage: (msg: ChatMessage) => void;
}) {
  const { roomIds, onMessage } = opts;

  const socketRef = useRef<Socket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const joinedRef = useRef<Set<string>>(new Set());

  const [connected, setConnected] = useState(false);

  // Connect once on mount.
  useEffect(() => {
    const socket = io(BASE_URL, {
      transports: ["websocket"],
      auth: { token: getToken() ?? undefined },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      // (Re)join every known room after a connect/reconnect.
      for (const id of joinedRef.current) {
        socket.emit("joinRoom", { matchId: id });
      }
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("newMessage", (msg: ChatMessage) => onMessageRef.current(msg));

    return () => {
      socket.off("newMessage");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Join any newly-discovered rooms. Idempotent via joinedRef.
  useEffect(() => {
    const socket = socketRef.current;
    for (const id of roomIds) {
      if (joinedRef.current.has(id)) continue;
      joinedRef.current.add(id);
      if (socket?.connected) socket.emit("joinRoom", { matchId: id });
    }
  }, [roomIds]);

  const sendMessage = useCallback(
    (matchId: string, senderId: string, message: string) => {
      // socket.io buffers outgoing events until connected, so early sends are safe.
      socketRef.current?.emit("sendMessage", { matchId, senderId, message });
    },
    []
  );

  return { connected, sendMessage };
}
