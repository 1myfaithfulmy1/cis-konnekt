import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * В Next.js 16 это то, что раньше называлось Middleware (файл называется
 * иначе, но срабатывает так же — на каждый подходящий запрос до рендера страницы).
 * Здесь только обновление сессии Supabase, своей логики пока нет.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
