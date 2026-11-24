"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapProfileRow } from "@/lib/supabase/mappers";
import type { Profile } from "@/types";

/** Профиль текущего вошедшего пользователя (см. supabase/auth_trigger.sql — заводится сам при регистрации). */
export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data && !error ? mapProfileRow(data) : null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    // reload() сама решает, писать ли в состояние синхронно (аккаунт вышел) или
    // после запроса к Supabase — оба случая ожидаемы.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  /** Отмечает реферальный бонус использованным — вызывается один раз, при «Пригласить друга». */
  async function markReferralUsed() {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("profiles").update({ referral_used: true }).eq("id", userId);
    await reload();
  }

  /** Сбрасывает реферальный флаг — для кнопки «Сбросить демо-данные». */
  async function resetReferral() {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("profiles").update({ referral_used: false }).eq("id", userId);
    await reload();
  }

  return { profile, loading, markReferralUsed, resetReferral };
}
