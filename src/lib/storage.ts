/**
 * Всё, что пользователь меняет в приложении, хранится в localStorage браузера —
 * баллы, «Иду», открытые коды и так далее. Здесь — чтение/запись этих данных
 * и действия над ними (например, "отметить Иду" или "начислить баллы").
 *
 * Любое обращение к localStorage обёрнуто в try/catch: в приватном режиме
 * браузера или с отключённым localStorage доступ может быть запрещён —
 * тогда демо просто продолжает работать в памяти текущей вкладки.
 */

import type { CisEvent } from "@/types";

const STORAGE_KEY = "cis-konnekt:state:v1";

export interface BonusEntry {
  id: string;
  amount: number;
  reason: string;
  at: string; // ISO-дата
}

export interface Promoter {
  id: string;
  eventId: string;
  organizerId: string;
  name: string;
  code: string;
}

export interface AppState {
  attendingEventIds: string[]; // события, на которые пользователь нажал «Иду»
  openedEventIds: string[]; // закрытые события, открытые по коду
  clickedTicketEventIds: string[]; // события, по которым уже засчитан бонус за клик «Купить билет»
  ticketClickCounts: Record<string, number>; // eventId -> сколько раз всего нажали «Купить билет»
  viewCounts: Record<string, number>; // просмотры страницы события
  bonusHistory: BonusEntry[]; // новые записи — в начале списка
  referralUsed: boolean; // бонус за «Пригласить друга» даётся один раз
  promoByEvent: Record<string, string>; // eventId -> промокод, с которым открыли страницу
  promoClickCounts: Record<string, number>; // промокод -> сколько кликов «Купить билет» пришло по нему
  selectedOrganizerId: string | null; // какой организатор выбран в кабинете на этом устройстве
  localEvents: Record<string, CisEvent>; // события, созданные или отредактированные в кабинете
  deletedEventIds: string[]; // события (из seed или свои), удалённые в кабинете
  promoters: Promoter[]; // промоутеры, добавленные организаторами
}

const DEFAULT_STATE: AppState = {
  attendingEventIds: [],
  openedEventIds: [],
  clickedTicketEventIds: [],
  ticketClickCounts: {},
  viewCounts: {},
  bonusHistory: [],
  referralUsed: false,
  promoByEvent: {},
  promoClickCounts: {},
  selectedOrganizerId: null,
  localEvents: {},
  deletedEventIds: [],
  promoters: [],
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function cloneDefault(): AppState {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

export function loadState(): AppState {
  if (!isBrowser()) return cloneDefault();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    const parsed = JSON.parse(raw);
    // Объединяем с значениями по умолчанию — если в будущем добавим новое поле,
    // у старых пользователей оно не будет сломано, а просто получит значение по умолчанию.
    return { ...cloneDefault(), ...parsed };
  } catch {
    return cloneDefault();
  }
}

export function saveState(state: AppState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage недоступен — молча продолжаем без сохранения
  }
}

export function resetState(): AppState {
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // игнорируем — хуже уже не будет
    }
  }
  return cloneDefault();
}

function makeBonusEntry(amount: number, reason: string): BonusEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    amount,
    reason,
    at: new Date().toISOString(),
  };
}

export function addBonus(state: AppState, amount: number, reason: string): AppState {
  return { ...state, bonusHistory: [makeBonusEntry(amount, reason), ...state.bonusHistory] };
}

export function bonusBalance(state: AppState, startingBonus: number): number {
  return startingBonus + state.bonusHistory.reduce((sum, entry) => sum + entry.amount, 0);
}

export function toggleAttending(state: AppState, eventId: string): AppState {
  const isAttending = state.attendingEventIds.includes(eventId);
  return {
    ...state,
    attendingEventIds: isAttending
      ? state.attendingEventIds.filter((id) => id !== eventId)
      : [...state.attendingEventIds, eventId],
  };
}

/**
 * Засчитывает клик «Купить билет»: увеличивает общий счётчик кликов (для
 * статистики организатора), счётчик по промокоду, если пришли по промо-ссылке,
 * и один раз начисляет +50 баллов за событие — при повторных кликах баллы
 * больше не дублируются, но клики по-прежнему считаются.
 */
export function recordTicketClick(state: AppState, eventId: string): AppState {
  let next: AppState = {
    ...state,
    ticketClickCounts: {
      ...state.ticketClickCounts,
      [eventId]: (state.ticketClickCounts[eventId] ?? 0) + 1,
    },
  };

  const promoCode = state.promoByEvent[eventId];
  if (promoCode) {
    next = {
      ...next,
      promoClickCounts: {
        ...next.promoClickCounts,
        [promoCode]: (next.promoClickCounts[promoCode] ?? 0) + 1,
      },
    };
  }

  if (state.clickedTicketEventIds.includes(eventId)) return next;
  next = { ...next, clickedTicketEventIds: [...next.clickedTicketEventIds, eventId] };
  return addBonus(next, 50, "Клик на билет");
}

export function incrementViewCount(state: AppState, eventId: string): AppState {
  return {
    ...state,
    viewCounts: { ...state.viewCounts, [eventId]: (state.viewCounts[eventId] ?? 0) + 1 },
  };
}

/** Запоминаем промокод, с которым открыли страницу (для статистики промоутера). */
export function savePromoForEvent(state: AppState, eventId: string, promo: string): AppState {
  if (state.promoByEvent[eventId]) return state; // код уже сохранён — не перезаписываем
  return { ...state, promoByEvent: { ...state.promoByEvent, [eventId]: promo } };
}

export type UnlockResult = "ok" | "already" | "invalid";

export function unlockEventByCode(
  state: AppState,
  code: string,
  allEvents: CisEvent[]
): { state: AppState; result: UnlockResult; eventId?: string } {
  const normalized = code.trim().toUpperCase();
  const match = allEvents.find((e) => e.isPrivate && e.accessCode?.toUpperCase() === normalized);

  if (!match) return { state, result: "invalid" };
  if (state.openedEventIds.includes(match.id)) return { state, result: "already", eventId: match.id };

  return {
    state: { ...state, openedEventIds: [...state.openedEventIds, match.id] },
    result: "ok",
    eventId: match.id,
  };
}

export function applyReferralBonus(state: AppState): AppState {
  if (state.referralUsed) return state;
  return addBonus({ ...state, referralUsed: true }, 100, "Приглашённый друг (демо)");
}

export function selectOrganizer(state: AppState, organizerId: string | null): AppState {
  return { ...state, selectedOrganizerId: organizerId };
}

/** Сохраняет новое или отредактированное событие (перекрывает seed, если id совпадает). */
export function upsertLocalEvent(state: AppState, event: CisEvent): AppState {
  return { ...state, localEvents: { ...state.localEvents, [event.id]: event } };
}

/** Удаляет событие — и из seed, и из своих: работает по id в обоих случаях. */
export function deleteLocalEvent(state: AppState, eventId: string): AppState {
  const nextLocalEvents = { ...state.localEvents };
  delete nextLocalEvents[eventId];
  const alreadyDeleted = state.deletedEventIds.includes(eventId);
  return {
    ...state,
    localEvents: nextLocalEvents,
    deletedEventIds: alreadyDeleted ? state.deletedEventIds : [...state.deletedEventIds, eventId],
  };
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function generatePromoCode(name: string): string {
  const translit = name
    .toLowerCase()
    .split("")
    .map((ch) => CYRILLIC_TO_LATIN[ch] ?? ch)
    .join("")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const base = translit.slice(0, 5) || "PROMO";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `${base}${suffix}`;
}

export function addPromoter(
  state: AppState,
  organizerId: string,
  eventId: string,
  name: string
): { state: AppState; promoter: Promoter } {
  const promoter: Promoter = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    eventId,
    organizerId,
    name: name.trim(),
    code: generatePromoCode(name),
  };
  return { state: { ...state, promoters: [...state.promoters, promoter] }, promoter };
}
