"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CisEvent } from "@/types";

export interface BonusEntry {
  id: string;
  amount: number;
  reason: string;
  eventId: string | null;
  at: string; // ISO-дата
}

interface PersonalState {
  attendingEventIds: string[];
  openedEventIds: string[];
  bonusHistory: BonusEntry[];
}

const EMPTY: PersonalState = { attendingEventIds: [], openedEventIds: [], bonusHistory: [] };

const TICKET_CLICK_REASON = "Клик на билет";

export type UnlockResult = "ok" | "already" | "invalid";

/**
 * Персональные данные вошедшего пользователя — живут в Supabase, не в
 * localStorage (см. supabase/step4_personal_data.sql и схему Шага 2).
 * userId: undefined — сессия ещё не определилась (подожди, не делай выводов);
 * null — точно не вошёл, тогда всё пусто и мутации ничего не делают.
 */
export function usePersonalData(userId: string | null | undefined) {
  const [data, setData] = useState<PersonalState>(EMPTY);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (userId === undefined) return; // сессия ещё не определилась — ждём, не трогаем loading

    if (!userId) {
      setData(EMPTY);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const [attendances, unlocked, bonuses] = await Promise.all([
      supabase.from("attendances").select("event_id").eq("user_id", userId),
      supabase.from("unlocked_events").select("event_id").eq("user_id", userId),
      supabase
        .from("bonus_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    setData({
      attendingEventIds: (attendances.data ?? []).map((r) => r.event_id),
      openedEventIds: (unlocked.data ?? []).map((r) => r.event_id),
      bonusHistory: (bonuses.data ?? []).map((r) => ({
        id: r.id,
        amount: r.amount,
        reason: r.reason,
        eventId: r.event_id,
        at: r.created_at,
      })),
    });
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    // reload() сама решает, писать ли в состояние синхронно (аккаунт вышел) или
    // после запроса к Supabase — оба случая ожидаемы.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  async function grantBonus(amount: number, reason: string, eventId: string | null = null) {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("bonus_history").insert({ user_id: userId, amount, reason, event_id: eventId });
    await reload();
  }

  async function toggleAttending(eventId: string) {
    if (!userId) return;
    const supabase = createClient();
    if (data.attendingEventIds.includes(eventId)) {
      await supabase.from("attendances").delete().eq("user_id", userId).eq("event_id", eventId);
    } else {
      await supabase.from("attendances").insert({ user_id: userId, event_id: eventId });
    }
    await reload();
  }

  async function unlockByCode(
    code: string,
    allEvents: CisEvent[]
  ): Promise<{ result: UnlockResult; eventId?: string }> {
    const normalized = code.trim().toUpperCase();
    const match = allEvents.find((e) => e.isPrivate && e.accessCode?.toUpperCase() === normalized);
    if (!match) return { result: "invalid" };
    if (!userId) return { result: "invalid" };
    if (data.openedEventIds.includes(match.id)) return { result: "already", eventId: match.id };

    const supabase = createClient();
    await supabase.from("unlocked_events").insert({ user_id: userId, event_id: match.id });
    await reload();
    return { result: "ok", eventId: match.id };
  }

  /** Начисляет +50 за клик «Купить билет» один раз на событие. Возвращает true, если бонус начислен именно сейчас. */
  async function recordTicketClick(eventId: string): Promise<boolean> {
    if (!userId) return false;
    const alreadyRewarded = data.bonusHistory.some(
      (b) => b.eventId === eventId && b.reason === TICKET_CLICK_REASON
    );
    if (alreadyRewarded) return false;
    await grantBonus(50, TICKET_CLICK_REASON, eventId);
    return true;
  }

  /** Стирает все личные данные аккаунта в базе — для кнопки «Сбросить демо-данные». */
  async function resetAll() {
    if (!userId) return;
    const supabase = createClient();
    await Promise.all([
      supabase.from("attendances").delete().eq("user_id", userId),
      supabase.from("unlocked_events").delete().eq("user_id", userId),
      supabase.from("bonus_history").delete().eq("user_id", userId),
    ]);
    await reload();
  }

  return { ...data, loading, grantBonus, toggleAttending, unlockByCode, recordTicketClick, resetAll };
}
