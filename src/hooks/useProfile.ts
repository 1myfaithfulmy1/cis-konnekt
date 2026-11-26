"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapProfileRow } from "@/lib/supabase/mappers";
import { uploadAvatar, deleteAvatar } from "@/lib/supabase/avatar";
import { isNicknameAvailable } from "@/lib/supabase/nickname";
import { ru } from "@/content/ru";
import type { Profile } from "@/types";

/** Профиль текущего вошедшего пользователя (см. supabase/auth_trigger.sql — заводится сам при регистрации). */
export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (): Promise<Profile | null> => {
    if (!userId) return null;
    const supabase = createClient();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    return data && !error ? mapProfileRow(data) : null;
  }, [userId]);

  useEffect(() => {
    // Начальная загрузка — тут уместно показать загрузку (loading=true по умолчанию).
    fetchProfile().then(setProfile).finally(() => setLoading(false));
  }, [fetchProfile]);

  /** Тихо перечитывает профиль после изменения — без мигания "загрузка" на весь экран. */
  async function refetch() {
    setProfile(await fetchProfile());
  }

  /** Отмечает реферальный бонус использованным — вызывается один раз, при «Пригласить друга». */
  async function markReferralUsed() {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("profiles").update({ referral_used: true }).eq("id", userId);
    await refetch();
  }

  /** Сбрасывает реферальный флаг — для кнопки «Сбросить демо-данные». */
  async function resetReferral() {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("profiles").update({ referral_used: false }).eq("id", userId);
    await refetch();
  }

  /** Обновляет имя и никнейм. Никнейм обязателен и должен быть свободен. */
  async function updateProfile(name: string, nickname: string): Promise<{ ok: boolean; error?: string }> {
    if (!userId) return { ok: false };

    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) return { ok: false, error: ru.profile.nicknameRequired };

    const available = await isNicknameAvailable(trimmedNickname, userId);
    if (!available) return { ok: false, error: ru.profile.nicknameTaken };

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), nickname: trimmedNickname })
      .eq("id", userId);

    if (error) return { ok: false, error: ru.profile.nicknameTaken };

    await refetch();
    return { ok: true };
  }

  async function updateAvatar(file: Blob) {
    if (!userId) return;
    const url = await uploadAvatar(userId, file);
    const supabase = createClient();
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
    await refetch();
  }

  async function removeAvatar() {
    if (!userId) return;
    await deleteAvatar(userId);
    const supabase = createClient();
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
    await refetch();
  }

  return { profile, loading, markReferralUsed, resetReferral, updateProfile, updateAvatar, removeAvatar };
}
