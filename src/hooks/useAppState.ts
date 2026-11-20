"use client";

import { useCallback, useState } from "react";
import { loadState, saveState, type AppState } from "@/lib/storage";

/**
 * Даёт доступ к данным пользователя (баллы, «Иду», открытые коды) и способ
 * их менять — любое изменение сразу сохраняется в localStorage.
 *
 * Важно: используй этот хук только внутри <ClientOnly> (см. компонент
 * ClientOnly). Чтение localStorage при самом первом рендере безопасно
 * только тогда, когда мы точно уже в браузере, а не на сервере.
 */
export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState());

  const update = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const reset = useCallback((nextState: AppState) => {
    setState(nextState);
  }, []);

  return { state, update, reset };
}
