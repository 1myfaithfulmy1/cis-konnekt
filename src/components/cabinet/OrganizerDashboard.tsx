"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { organizers } from "@/data/seed";
import { getAllEvents } from "@/lib/events";
import { formatPrice } from "@/lib/format";
import { formatEventWhen } from "@/lib/dates";
import { deleteLocalEvent, type AppState } from "@/lib/storage";
import { ru } from "@/content/ru";
import { PromotersPanel } from "./PromotersPanel";

export function OrganizerDashboard({
  organizerId,
  state,
  update,
  onSwitch,
}: {
  organizerId: string;
  state: AppState;
  update: (updater: (prev: AppState) => AppState) => void;
  onSwitch: () => void;
}) {
  const organizer = organizers.find((o) => o.id === organizerId);
  const myEvents = useMemo(
    () => getAllEvents(state).filter((e) => e.organizerId === organizerId),
    [state, organizerId]
  );

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function handleDelete(eventId: string) {
    update((prev) => deleteLocalEvent(prev, eventId));
    setPendingDeleteId(null);
  }

  return (
    <div className="space-y-6 px-4 pb-10 pt-4 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg text-foreground">{organizer?.name}</h1>
        <button
          onClick={onSwitch}
          className="flex min-h-[44px] items-center text-sm text-muted underline"
        >
          {ru.cabinet.switchOrganizer}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-3 text-sm text-muted">
        {ru.cabinet.hintBanner}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{ru.cabinet.myEventsTitle}</p>
          <Link
            href="/cabinet/event/new"
            className="min-h-[36px] rounded-xl bg-accent px-3 py-1.5 text-xs font-medium text-accent-ink"
          >
            {ru.cabinet.createEvent}
          </Link>
        </div>

        {myEvents.length === 0 ? (
          <p className="text-sm text-muted">{ru.cabinet.noOwnEvents}</p>
        ) : (
          <div className="space-y-3">
            {myEvents.map((event) => {
              const views = state.viewCounts[event.id] ?? 0;
              const clicks = state.ticketClickCounts[event.id] ?? 0;
              const going =
                event.friendsGoingIds.length + (state.attendingEventIds.includes(event.id) ? 1 : 0);

              return (
                <div key={event.id} className="rounded-2xl border border-border bg-surface p-4">
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatEventWhen(event)} · {formatPrice(event.price)}
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-background py-2">
                      <p className="text-base font-semibold text-foreground">{views}</p>
                      <p className="text-[11px] text-muted">{ru.cabinet.statsViews}</p>
                    </div>
                    <div className="rounded-lg bg-background py-2">
                      <p className="text-base font-semibold text-foreground">{clicks}</p>
                      <p className="text-[11px] text-muted">{ru.cabinet.statsClicks}</p>
                    </div>
                    <div className="rounded-lg bg-background py-2">
                      <p className="text-base font-semibold text-foreground">{going}</p>
                      <p className="text-[11px] text-muted">{ru.cabinet.statsGoing}</p>
                    </div>
                  </div>

                  {pendingDeleteId === event.id ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-foreground">{ru.cabinet.confirmDeleteQuestion}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPendingDeleteId(null)}
                          className="min-h-[40px] flex-1 rounded-xl border border-border text-sm text-muted"
                        >
                          {ru.cabinet.confirmDeleteNo}
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="min-h-[40px] flex-1 rounded-xl bg-red-500/90 text-sm font-medium text-white"
                        >
                          {ru.cabinet.confirmDeleteYes}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/cabinet/event/${event.id}/edit`}
                        className="min-h-[40px] flex-1 rounded-xl border border-border text-center text-sm leading-[40px] text-foreground"
                      >
                        {ru.cabinet.editButton}
                      </Link>
                      <button
                        onClick={() => setPendingDeleteId(event.id)}
                        className="min-h-[40px] flex-1 rounded-xl border border-border text-sm text-muted"
                      >
                        {ru.cabinet.deleteButton}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PromotersPanel organizerId={organizerId} myEvents={myEvents} state={state} update={update} />
    </div>
  );
}
