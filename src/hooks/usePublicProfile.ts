"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapPublicProfileRow } from "@/lib/supabase/mappers";
import type { PublicProfile } from "@/types";

/** Публичные данные чужого профиля (имя, никнейм, фото) — для шапки переписки. */
export function usePublicProfile(userId: string | null) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (): Promise<PublicProfile | null> => {
    if (!userId) return null;
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, name, nickname, avatar_url")
      .eq("id", userId)
      .maybeSingle();
    return data ? mapPublicProfileRow(data) : null;
  }, [userId]);

  useEffect(() => {
    fetchProfile().then(setProfile).finally(() => setLoading(false));
  }, [fetchProfile]);

  return { profile, loading };
}
