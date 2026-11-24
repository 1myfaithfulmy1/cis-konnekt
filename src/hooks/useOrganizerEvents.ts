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

  const reload = useCallback(async () => {
    if (organizerId === undefined) return; // организатор ещё не определился — ждём

    if (!organizerId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("events").select("*").eq("organizer_id", organizerId);
    setEvents((data ?? []).map(mapEventRow));
    setLoading(false);
  }, [organizerId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  async function saveEvent(event: CisEvent) {
    const supabase = createClient();
    await supabase.from("events").upsert(toEventRow(event));
    await reload();
  }

  async function deleteEvent(eventId: string) {
    const supabase = createClient();
    await supabase.from("events").delete().eq("id", eventId);
    if (organizerId) await deleteEventCover(organizerId, eventId).catch(() => {});
    await reload();
  }

  return { events, loading, saveEvent, deleteEvent, reload };
}
