"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapEventRow, toEventRow } from "@/lib/supabase/mappers";
import { deleteEventCover } from "@/lib/supabase/eventCover";
import type { CisEvent } from "@/types";

/**
 * События организатора — для Кабинета (создание/редактирование/удаление пишет прямо в Supabase).
 * organizerId: undefined — организатор ещё не определился (подожди); null — его точно нет.
 */
export function useOrganizerEvents(organizerId: string | null | undefined) {
  const [events, setEvents] = useState<CisEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async (): Promise<CisEvent[]> => {
    if (!organizerId) return [];
    const supabase = createClient();
    const { data } = await supabase.from("events").select("*").eq("organizer_id", organizerId);
    return (data ?? []).map(mapEventRow);
  }, [organizerId]);

  useEffect(() => {
    if (organizerId === undefined) return; // организатор ещё не определился — ждём

    // Начальная загрузка — тут уместно показать загрузку (loading=true по умолчанию).
    fetchEvents().then(setEvents).finally(() => setLoading(false));
  }, [organizerId, fetchEvents]);

  /** Тихо перечитывает события после изменения — без мигания "загрузка" на весь экран. */
  async function refetch() {
    setEvents(await fetchEvents());
  }

  async function saveEvent(event: CisEvent) {
    const supabase = createClient();
    await supabase.from("events").upsert(toEventRow(event));
    await refetch();
  }

  async function deleteEvent(eventId: string) {
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", eventId);
    if (organizerId) await deleteEventCover(organizerId, eventId).catch(() => {});
    await refetch();
  }

  return { events, loading, saveEvent, deleteEvent, refetch };
}
