import { createClient } from "@/lib/supabase/client";
import { mapPublicProfileRow } from "@/lib/supabase/mappers";
import type { PublicProfile } from "@/types";

/** true, если никнейм свободен (с учётом исключения своего же текущего, если он не меняется). */
export async function isNicknameAvailable(nickname: string, excludeUserId?: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .ilike("nickname", nickname.trim())
    .maybeSingle();
  if (!data) return true;
  return data.id === excludeUserId;
}

/** Ищет пользователя по точному никнейму (без учёта регистра) — для поиска собеседника. */
export async function findProfileByNickname(nickname: string): Promise<PublicProfile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, name, nickname, avatar_url")
    .ilike("nickname", nickname.trim())
    .maybeSingle();
  return data ? mapPublicProfileRow(data) : null;
}
