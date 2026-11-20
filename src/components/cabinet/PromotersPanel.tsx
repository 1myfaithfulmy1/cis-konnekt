"use client";

import { useState } from "react";
import { ru } from "@/content/ru";
import { addPromoter, type AppState } from "@/lib/storage";
import type { CisEvent } from "@/types";

export function PromotersPanel({
  organizerId,
  myEvents,
  state,
  update,
}: {
  organizerId: string;
  myEvents: CisEvent[];
  state: AppState;
  update: (updater: (prev: AppState) => AppState) => void;
}) {
  const [name, setName] = useState("");
  const [eventId, setEventId] = useState(myEvents[0]?.id ?? "");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const myPromoters = state.promoters.filter((p) => p.organizerId === organizerId);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !eventId) return;
    update((prev) => addPromoter(prev, organizerId, eventId, name).state);
    setName("");
  }

  async function handleCopy(promoterId: string, targetEventId: string, code: string) {
    const link = `${window.location.origin}/event/${targetEventId}?promo=${code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(promoterId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // буфер обмена недоступен — молча пропускаем, ссылку всё равно можно собрать вручную
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{ru.cabinet.promotersTitle}</p>

      {myEvents.length === 0 ? (
        <p className="text-sm text-muted">{ru.cabinet.promoterNoEvents}</p>
      ) : (
        <>
          <form onSubmit={handleAdd} className="space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={ru.cabinet.promoterNamePlaceholder}
              className="min-h-[44px] w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <div className="flex gap-2">
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="min-h-[44px] flex-1 rounded-xl border border-border bg-surface px-3 text-sm text-foreground"
              >
                {myEvents.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="min-h-[44px] rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink"
              >
                {ru.cabinet.promoterAdd}
              </button>
            </div>
          </form>

          <div className="mt-4 space-y-2">
            {myPromoters.length === 0 ? (
              <p className="text-sm text-muted">{ru.cabinet.promoterTableEmpty}</p>
            ) : (
              myPromoters.map((promoter) => {
                const event = myEvents.find((e) => e.id === promoter.eventId);
                const clicks = state.promoClickCounts[promoter.code] ?? 0;
                return (
                  <div
                    key={promoter.id}
                    className="rounded-xl border border-border bg-surface p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{promoter.name}</span>
                      <span className="text-xs text-muted">
                        {ru.cabinet.promoterClicks}: {clicks}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted">{event?.title ?? "—"}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <code className="rounded bg-background px-2 py-1 text-xs text-foreground">
                        {promoter.code}
                      </code>
                      <button
                        onClick={() => handleCopy(promoter.id, promoter.eventId, promoter.code)}
                        className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-xs text-foreground"
                      >
                        {copiedId === promoter.id
                          ? ru.cabinet.promoterLinkCopied
                          : ru.cabinet.promoterCopyLink}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
