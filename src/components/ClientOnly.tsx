"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Показывает children только после того, как страница загрузилась в браузере.
 *
 * Зачем это нужно: "сегодня/завтра" и данные из localStorage существуют
 * только в браузере пользователя, а не на сервере. Если считать их сразу,
 * React может один раз показать неправильный вариант и тут же его заменить —
 * это видно как мигание и выдаёт предупреждение в консоли. Пока идёт проверка,
 * показываем fallback (например, скелетоны), а настоящий контент — сразу после.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Специально простой эффект "я в браузере, можно показывать контент" —
    // это стандартный приём, а не ошибка в логике.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
