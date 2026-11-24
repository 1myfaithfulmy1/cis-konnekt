"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapEventRow, mapFriendRow, mapOrganizerRow } from "@/lib/supabase/mappers";
import type { CisEvent, Friend, Organizer } from "@/types";

interface RemoteData {
  events: CisEvent[];
  organizers: Organizer[];
  friends: Friend[];
}

const EMPTY: RemoteData = { events: [], organizers: [], friends: [] };

/**
 * Общие данные (события, организаторы, друзья) живут в Supabase — используй
 * этот хук везде, где они нужны. Личные данные пользователя (баллы, «Иду»
 * и т.д.) — см. usePersonalData; события своего организатора в Кабинете —
 * см. useOrganizerEvents.
 */
export function useRemoteData() {
  const [data, setData] = useState<RemoteData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const [eventsRes, organizersRes, friendsRes] = await Promise.all([
        supabase.from("events").select("*"),
        supabase.from("organizers").select("*"),
        supabase.from("friends").select("*"),
      ]);

      if (cancelled) return;

      if (eventsRes.error || organizersRes.error || friendsRes.error) {
        setError(true);
        setLoading(false);
        return;
      }

      setData({
        events: (eventsRes.data ?? []).map(mapEventRow),
        organizers: (organizersRes.data ?? []).map(mapOrganizerRow),
        friends: (friendsRes.data ?? []).map(mapFriendRow),
      });
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...data, loading, error };
}
