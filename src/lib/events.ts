import { events as seedEvents } from "@/data/seed";
import type { AppState } from "@/lib/storage";
import type { CisEvent } from "@/types";

/**
 * Полный список событий с учётом того, что сделал организатор в кабинете:
 * отредактированные события заменяют исходные из seed.ts, новые добавляются,
 * удалённые — пропадают. Используй эту функцию везде, где показываешь события
 * (лента, профиль, страница события, кабинет), а не seed.ts напрямую —
 * иначе изменения из кабинета нигде не появятся.
 */
export function getAllEvents(state: AppState): CisEvent[] {
  const deleted = new Set(state.deletedEventIds);

  const fromSeed = seedEvents
    .filter((e) => !deleted.has(e.id))
    .map((e) => state.localEvents[e.id] ?? e);

  const localOnly = Object.values(state.localEvents).filter(
    (e) => !seedEvents.some((s) => s.id === e.id) && !deleted.has(e.id)
  );

  return [...fromSeed, ...localOnly];
}
