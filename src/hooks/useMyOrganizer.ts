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

  const fetchOrganizer = useCallback(async (): Promise<Organizer | null> => {
    if (!userId) return null;
    const supabase = createClient();
    const { data } = await supabase.from("organizers").select("*").eq("owner_id", userId).maybeSingle();
    return data ? mapOrganizerRow(data) : null;
  }, [userId]);

  useEffect(() => {
    if (userId === undefined) return; // сессия ещё не определилась — ждём, не трогаем loading
    // Начальная загрузка — тут уместно показать загрузку (loading=true по умолчанию).
    fetchOrganizer().then(setOrganizer).finally(() => setLoading(false));
  }, [userId, fetchOrganizer]);

  async function createOrganizer(name: string) {
    if (!userId) return;
    const supabase = createClient();
    const id = `org-${crypto.randomUUID()}`;
    await supabase.from("organizers").insert({ id, name: name.trim(), owner_id: userId });
    setOrganizer(await fetchOrganizer());
  }

  return { organizer, loading, createOrganizer };
}
