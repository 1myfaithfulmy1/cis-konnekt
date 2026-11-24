import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Клиент Supabase для использования на сервере (Server Components,
 * Server Actions, Route Handlers). Создавай заново на каждый запрос —
 * не сохраняй в переменную модуля.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Вызвано из Server Component, где нельзя менять cookie —
            // это ожидаемо, если сессия уже обновляется в src/proxy.ts.
          }
        },
      },
    }
  );
}
