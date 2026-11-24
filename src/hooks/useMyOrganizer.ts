"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapOrganizerRow } from "@/lib/supabase/mappers";
import type { Organizer } from "@/types";

/**
 * Организатор, которым владеет текущий аккаунт (ровно один на аккаунт).
 * userId: undefined — сессия ещё не определилась (подожди, не делай выводов);
 * null — точно не вошёл; строка — вошёл, вот его id.
 */
export function useMyOrganizer(userId: string | null | undefined) {
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (userId === undefined) return; // сессия ещё не определилась — ждём, не трогаем loading

    if (!userId) {
      setOrganizer(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("organizers").select("*").eq("owner_id", userId).maybeSingle();
    setOrganizer(data ? mapOrganizerRow(data) : null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    // reload() сама решает, писать ли в состояние синхронно (аккаунт вышел) или
    // после запроса к Supabase — оба случая ожидаемы.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  async function createOrganizer(name: string) {
    if (!userId) return;
    const supabase = createClient();
    const id = `org-${crypto.randomUUID()}`;
    await supabase.from("organizers").insert({ id, name: name.trim(), owner_id: userId });
    await reload();
  }

  return { organizer, loading, createOrganizer };
}
