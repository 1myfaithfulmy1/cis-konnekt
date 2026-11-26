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

interface PromoterState {
  promoters: Promoter[];
  stats: ClickStats;
}

const EMPTY: PromoterState = { promoters: [], stats: EMPTY_STATS };

/** Промоутеры организатора и статистика кликов по их ссылкам (таблицы promoters + ticket_clicks). */
export function usePromoters(organizerId: string | null, eventIds: string[]) {
  const [state, setState] = useState<PromoterState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const eventIdsKey = eventIds.join(",");

  const fetchData = useCallback(async (): Promise<PromoterState> => {
    if (!organizerId) return EMPTY;

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

    return { promoters: (promotersRes.data ?? []).map(mapPromoterRow), stats: { byEvent, byPromoCode } };
    // eventIdsKey — стабильная строка вместо массива, чтобы не перезапускать эффект на каждый рендер
  }, [organizerId, eventIdsKey]);

  useEffect(() => {
    // Начальная загрузка — тут уместно показать загрузку (loading=true по умолчанию).
    fetchData().then(setState).finally(() => setLoading(false));
  }, [fetchData]);

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
    setState(await fetchData());
  }

  return { promoters: state.promoters, stats: state.stats, loading, addPromoter };
}
