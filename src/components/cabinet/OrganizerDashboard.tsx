"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import { formatEventWhen } from "@/lib/dates";
import { useSession } from "@/hooks/useSession";
import { usePersonalData } from "@/hooks/usePersonalData";
import { useOrganizerEvents } from "@/hooks/useOrganizerEvents";
import { usePromoters } from "@/hooks/usePromoters";
import { ru } from "@/content/ru";
import type { Organizer } from "@/types";
import { PromotersPanel } from "./PromotersPanel";

export function OrganizerDashboard({ organizer }: { organizer: Organizer }) {
  const { events: myEvents, loading, deleteEvent } = useOrganizerEvents(organizer.id);
  const { user, loading: sessionLoading } = useSession();
  const { attendingEventIds } = usePersonalData(sessionLoading ? undefined : (user?.id ?? null));
  const eventIds = myEvents.map((e) => e.id);
  const { promoters, stats, addPromoter } = usePromoters(organizer.id, eventIds);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function handleDelete(eventId: string) {
    await deleteEvent(eventId);
    setPendingDeleteId(null);
  }

  async function handleLogout() {
    await createClient().auth.signOut();
  }

  return (
    <div className="space-y-6 px-4 pb-10 pt-4 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg text-foreground">{organizer.name}</h1>
        <button onClick={handleLogout} className="flex min-h-[44px] items-center text-sm text-muted underline">
          {ru.auth.logout}
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
            className="min-h-[36px] rounded-xl bg-accent px-3 py-1.5 text-xs font-medium text-accent-ink transition-transform duration-150 active:scale-[0.98]"
          >
            {ru.cabinet.createEvent}
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted">{ru.auth.loading}</p>
        ) : myEvents.length === 0 ? (
          <p className="text-sm text-muted">{ru.cabinet.noOwnEvents}</p>
        ) : (
          <div className="space-y-3">
            {myEvents.map((event) => {
              const views = event.viewCount;
              const clicks = stats.byEvent[event.id] ?? 0;
              const going = event.friendsGoingIds.length + (attendingEventIds.includes(event.id) ? 1 : 0);

              return (
                <div key={event.id} className="rounded-2xl border border-border bg-surface p-4">
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatEventWhen(event)} · {formatPrice(event.price)}
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-surface-2 py-2">
                      <p className="text-base font-semibold text-foreground">{views}</p>
                      <p className="text-[11px] text-muted">{ru.cabinet.statsViews}</p>
                    </div>
                    <div className="rounded-lg bg-surface-2 py-2">
                      <p className="text-base font-semibold text-foreground">{clicks}</p>
                      <p className="text-[11px] text-muted">{ru.cabinet.statsClicks}</p>
                    </div>
                    <div className="rounded-lg bg-surface-2 py-2">
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

      <PromotersPanel myEvents={myEvents} promoters={promoters} clicksByPromoCode={stats.byPromoCode} onAdd={addPromoter} />
    </div>
  );
}
