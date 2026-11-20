import type { CisEvent, Genre } from "@/types";
import { addDays, eventDateTime, getWeekendDates, isSameCalendarDay, startOfToday } from "@/lib/dates";

export type DateTab = "today" | "tomorrow" | "weekend" | "all";
export type PriceFilter = "all" | "free" | "under500" | "under1000";

export interface EventFilters {
  tab: DateTab;
  genre: Genre | "all";
  district: string | "all";
  price: PriceFilter;
}

export const DEFAULT_FILTERS: EventFilters = {
  tab: "today",
  genre: "all",
  district: "all",
  price: "all",
};

export function filterEvents(allEvents: CisEvent[], filters: EventFilters): CisEvent[] {
  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  const { saturday, sunday } = getWeekendDates();

  return allEvents
    .filter((event) => {
      const dt = eventDateTime(event);

      if (filters.tab === "today" && !isSameCalendarDay(dt, today)) return false;
      if (filters.tab === "tomorrow" && !isSameCalendarDay(dt, tomorrow)) return false;
      if (
        filters.tab === "weekend" &&
        !(isSameCalendarDay(dt, saturday) || isSameCalendarDay(dt, sunday))
      ) {
        return false;
      }

      if (filters.genre !== "all" && event.genre !== filters.genre) return false;
      if (filters.district !== "all" && event.district !== filters.district) return false;

      if (filters.price === "free" && event.price !== 0) return false;
      if (filters.price === "under500" && !(event.price > 0 && event.price <= 500)) return false;
      if (filters.price === "under1000" && !(event.price > 0 && event.price <= 1000)) return false;

      return true;
    })
    .sort((a, b) => eventDateTime(a).getTime() - eventDateTime(b).getTime());
}
