"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";

/**
 * Persistent likes for a single profile being viewed.
 *
 * - Hydrates from `/profile-likes?userId=X` when `userId` is set.
 * - `toggle(key)` flips the state optimistically and POSTs to the server.
 * - On failure, reverts the local change.
 */
export function useProfileLikes(userId: string | null | undefined) {
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const inflightRef = useRef<Map<string, Promise<unknown>>>(new Map());

  useEffect(() => {
    if (!userId) {
      setLiked(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const keys = await api.profileLikes.listFor(userId);
        if (!cancelled) setLiked(new Set(keys));
      } catch (err) {
        console.error("[useProfileLikes] hydrate failed:", err);
        if (!cancelled) setLiked(new Set());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isLiked = useCallback(
    (key: string) => liked.has(key),
    [liked],
  );

  const toggle = useCallback(
    async (key: string) => {
      if (!userId) return;
      // Coalesce duplicate clicks on the same key while a request is in flight.
      if (inflightRef.current.has(key)) return;

      const wasLiked = liked.has(key);
      const nextLiked = !wasLiked;

      // Optimistic update.
      setLiked((prev) => {
        const next = new Set(prev);
        if (nextLiked) next.add(key);
        else next.delete(key);
        return next;
      });

      const promise = api.profileLikes
        .toggle({ likedUserId: userId, itemKey: key, liked: nextLiked })
        .catch((err) => {
          console.error("[useProfileLikes] toggle failed:", err);
          // Revert on failure.
          setLiked((prev) => {
            const next = new Set(prev);
            if (wasLiked) next.add(key);
            else next.delete(key);
            return next;
          });
        })
        .finally(() => {
          inflightRef.current.delete(key);
        });
      inflightRef.current.set(key, promise);
      return promise;
    },
    [liked, userId],
  );

  return { isLiked, toggle };
}
