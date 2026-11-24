import { createClient } from "@/lib/supabase/client";

const BUCKET = "event-covers";

function coverPath(organizerId: string, eventId: string): string {
  return `${organizerId}/${eventId}.jpg`;
}

/** Загружает обложку события в Supabase Storage и возвращает её публичный URL. */
export async function uploadEventCover(organizerId: string, eventId: string, file: Blob): Promise<string> {
  const supabase = createClient();
  const path = coverPath(organizerId, eventId);

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: "image/jpeg",
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Добавляем метку времени, чтобы браузер не показывал старую обложку из кеша после замены фото.
  return `${data.publicUrl}?t=${Date.now()}`;
}

/** Удаляет обложку события из Storage — молча игнорирует ошибку, если файла уже нет. */
export async function deleteEventCover(organizerId: string, eventId: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove([coverPath(organizerId, eventId)]);
}
