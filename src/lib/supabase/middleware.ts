import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Обновляет истекающий токен сессии Supabase в cookie при каждом запросе.
 * Используется из src/proxy.ts (в Next.js 16 то, что раньше называлось
 * middleware, теперь называется proxy — поведение то же самое).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Сам вызов ничего не возвращает нам полезного — он нужен, чтобы Supabase
  // обновил cookie, если токен сессии вот-вот истечёт.
  await supabase.auth.getUser();

  return supabaseResponse;
}
