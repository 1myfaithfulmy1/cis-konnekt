"use client";

import { useMemo, useState } from "react";
import { GENRE_OPTIONS } from "@/data/genres";
import { DISTRICTS } from "@/data/districts";
import { ru } from "@/content/ru";
import { brand } from "@/config/brand";
import { ClientOnly } from "@/components/ClientOnly";
import { FeedSkeleton } from "@/components/FeedSkeleton";
import { EventCard } from "@/components/EventCard";
import { LockedEventCard } from "@/components/LockedEventCard";
import { EmptyState } from "@/components/EmptyState";
import { SelectField } from "@/components/SelectField";
import { DEFAULT_FILTERS, filterEvents, type DateTab, type PriceFilter } from "@/lib/filterEvents";
import { useRemoteData } from "@/hooks/useRemoteData";
import { useSession } from "@/hooks/useSession";
import { usePersonalData } from "@/hooks/usePersonalData";
import type { Genre } from "@/types";

const TABS: { value: DateTab; label: string }[] = [
  { value: "today", label: ru.feed.tabs.today },
  { value: "tomorrow", label: ru.feed.tabs.tomorrow },
  { value: "weekend", label: ru.feed.tabs.weekend },
  { value: "all", label: ru.feed.tabs.all },
];

export default function FeedPage() {
  return (
    <ClientOnly fallback={<FeedSkeleton />}>
      <FeedContent />
    </ClientOnly>
  );
}

function FeedContent() {
  const { events, friends, loading, error } = useRemoteData();
  const { user, loading: sessionLoading } = useSession();
  const { openedEventIds, loading: personalLoading } = usePersonalData(
    sessionLoading ? undefined : (user?.id ?? null)
  );
  const [tab, setTab] = useState<DateTab>(DEFAULT_FILTERS.tab);
  const [genre, setGenre] = useState<Genre | "all">(DEFAULT_FILTERS.genre);
  const [district, setDistrict] = useState<string>(DEFAULT_FILTERS.district);
  const [price, setPrice] = useState<PriceFilter>(DEFAULT_FILTERS.price);

  const visibleEvents = useMemo(
    () => filterEvents(events, { tab, genre, district, price }),
    [events, tab, genre, district, price]
  );

  if (loading || sessionLoading || personalLoading) return <FeedSkeleton />;
  if (error) {
    return (
      <div className="px-4 pt-6 md:mx-auto md:max-w-7xl md:px-6">
        <EmptyState title="Не удалось загрузить ленту" hint="Проверь соединение и обнови страницу" />
      </div>
    );
  }

  const genreOptions = [{ value: "all", label: ru.feed.filters.genreAll }, ...GENRE_OPTIONS];
  const districtOptions = [
    { value: "all", label: ru.feed.filters.districtAll },
    ...DISTRICTS.map((d) => ({ value: d, label: d })),
  ];
  const priceOptions = [
    { value: "all", label: ru.feed.filters.priceAll },
    { value: "free", label: ru.feed.filters.priceFree },
    { value: "under500", label: ru.feed.filters.priceUnder500 },
    { value: "under1000", label: ru.feed.filters.priceUnder1000 },
  ];

  return (
    <div className="px-4 pb-4 pt-4 md:mx-auto md:max-w-7xl md:px-6 md:py-6">
      <p className="mb-3 font-display text-sm text-muted md:hidden">{brand.name}</p>

      <div className="md:max-w-xl">
        <div className="flex gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`min-h-[40px] flex-1 rounded-xl text-xs font-medium transition-colors duration-150 ${
                tab === t.value ? "bg-accent text-accent-ink" : "bg-surface text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          <SelectField
            ariaLabel={ru.feed.filters.genreAll}
            value={genre}
            onChange={(v) => setGenre(v as Genre | "all")}
            options={genreOptions}
          />
          <SelectField
            ariaLabel={ru.feed.filters.districtAll}
            value={district}
            onChange={setDistrict}
            options={districtOptions}
          />
          <SelectField
            ariaLabel={ru.feed.filters.priceAll}
            value={price}
            onChange={(v) => setPrice(v as PriceFilter)}
            options={priceOptions}
          />
        </div>
      </div>

      {visibleEvents.length === 0 ? (
        <div className="mt-4">
          <EmptyState title={ru.feed.empty.title} hint={ru.feed.empty.hint} />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {visibleEvents.map((event) =>
            event.isPrivate && !openedEventIds.includes(event.id) ? (
              <LockedEventCard key={event.id} />
            ) : (
              <EventCard key={event.id} event={event} friends={friends} />
            )
          )}
        </div>
      )}
    </div>
  );
}
