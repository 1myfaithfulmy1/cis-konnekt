import { createClient } from "@/lib/supabase/client";

const BUCKET = "avatars";

function avatarPath(userId: string): string {
  return `${userId}/avatar.jpg`;
}

/** Загружает фото профиля в Supabase Storage и возвращает его публичный URL. */
export async function uploadAvatar(userId: string, file: Blob): Promise<string> {
  const supabase = createClient();
  const path = avatarPath(userId);

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: "image/jpeg",
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Метка времени — чтобы браузер не показывал старое фото из кеша после замены.
  return `${data.publicUrl}?t=${Date.now()}`;
}

/** Удаляет фото профиля из Storage — молча игнорирует ошибку, если файла уже нет. */
export async function deleteAvatar(userId: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove([avatarPath(userId)]);
}
