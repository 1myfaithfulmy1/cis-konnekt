import type { CisEvent } from "@/types";

/** Полночь сегодняшнего дня — точка отсчёта для всех "через сколько дней" расчётов. */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Настоящая дата-время начала события, посчитанная от сегодняшнего дня. */
export function eventDateTime(event: Pick<CisEvent, "dayOffset" | "startTime">): Date {
  const [hours, minutes] = event.startTime.split(":").map(Number);
  const d = addDays(startOfToday(), event.dayOffset);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Ближайшие суббота и воскресенье. Если сегодня уже суббота или воскресенье —
 * возвращает текущие выходные (чтобы сегодняшние события тоже туда попадали).
 */
export function getWeekendDates(): { saturday: Date; sunday: Date } {
  const today = startOfToday();
  const dayOfWeek = today.getDay(); // 0 = воскресенье, 6 = суббота

  let daysUntilSaturday: number;
  if (dayOfWeek === 6) daysUntilSaturday = 0;
  else if (dayOfWeek === 0) daysUntilSaturday = -1;
  else daysUntilSaturday = 6 - dayOfWeek;

  const saturday = addDays(today, daysUntilSaturday);
  const sunday = addDays(saturday, 1);
  return { saturday, sunday };
}

/** "Сегодня" / "Завтра" / "15 ноября" — без времени. */
export function formatEventDateLabel(event: Pick<CisEvent, "dayOffset">): string {
  const dt = addDays(startOfToday(), event.dayOffset);
  const today = startOfToday();
  const tomorrow = addDays(today, 1);

  if (isSameCalendarDay(dt, today)) return "Сегодня";
  if (isSameCalendarDay(dt, tomorrow)) return "Завтра";

  return dt.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

/** "Сегодня, 22:00" / "Завтра, 20:00" / "15 ноября, 23:00" — для карточки в ленте. */
export function formatEventWhen(event: Pick<CisEvent, "dayOffset" | "startTime">): string {
  return `${formatEventDateLabel(event)}, ${event.startTime}`;
}

/** "Сегодня, 22:00–03:00" — с окончанием, для страницы события. */
export function formatEventWhenRange(
  event: Pick<CisEvent, "dayOffset" | "startTime" | "endTime">
): string {
  return `${formatEventDateLabel(event)}, ${event.startTime}–${event.endTime}`;
}
