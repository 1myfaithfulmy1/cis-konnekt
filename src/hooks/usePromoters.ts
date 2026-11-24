"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapPromoterRow } from "@/lib/supabase/mappers";
import { generatePromoCode } from "@/lib/promoCode";
import type { Promoter } from "@/types";

interface ClickStats {
  byEvent: Record<string, number>; // eventId -> сколько всего кликов «Купить билет»
  byPromoCode: Record<string, number>; // промокод -> сколько кликов пришло по нему
}

const EMPTY_STATS: ClickStats = { byEvent: {}, byPromoCode: {} };

/** Промоутеры организатора и статистика кликов по их ссылкам (таблицы promoters + ticket_clicks). */
export function usePromoters(organizerId: string | null, eventIds: string[]) {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [stats, setStats] = useState<ClickStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const eventIdsKey = eventIds.join(",");

  const reload = useCallback(async () => {
    if (!organizerId) {
      setPromoters([]);
      setStats(EMPTY_STATS);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const ids = eventIdsKey ? eventIdsKey.split(",") : [];

    const [promotersRes, clicksRes] = await Promise.all([
      supabase.from("promoters").select("*").eq("organizer_id", organizerId),
      ids.length > 0
        ? supabase.from("ticket_clicks").select("event_id, promo_code").in("event_id", ids)
        : Promise.resolve({ data: [] as { event_id: string; promo_code: string | null }[] }),
    ]);

    const byEvent: Record<string, number> = {};
    const byPromoCode: Record<string, number> = {};
    for (const row of clicksRes.data ?? []) {
      byEvent[row.event_id] = (byEvent[row.event_id] ?? 0) + 1;
      if (row.promo_code) byPromoCode[row.promo_code] = (byPromoCode[row.promo_code] ?? 0) + 1;
    }

    setPromoters((promotersRes.data ?? []).map(mapPromoterRow));
    setStats({ byEvent, byPromoCode });
    setLoading(false);
    // eventIdsKey — стабильная строка вместо массива, чтобы не перезапускать эффект на каждый рендер
  }, [organizerId, eventIdsKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  async function addPromoter(name: string, eventId: string) {
    if (!organizerId) return;
    const supabase = createClient();
    await supabase.from("promoters").insert({
      id: crypto.randomUUID(),
      organizer_id: organizerId,
      event_id: eventId,
      name: name.trim(),
      code: generatePromoCode(name),
    });
    await reload();
  }

  return { promoters, stats, loading, addPromoter };
}
