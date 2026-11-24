"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Share2 } from "lucide-react";
import { GENRE_META } from "@/data/genres";
import { EventCover } from "@/components/EventCover";
import { ClientOnly } from "@/components/ClientOnly";
import { EventDetailSkeleton } from "@/components/EventDetailSkeleton";
import { LockedEventNotice } from "./LockedEventNotice";
import { EventNotFoundNotice } from "./EventNotFoundNotice";
import { ru } from "@/content/ru";
import { brand } from "@/config/brand";
import { formatEventWhenRange } from "@/lib/dates";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { useRemoteData } from "@/hooks/useRemoteData";
import { useSession } from "@/hooks/useSession";
import { usePersonalData } from "@/hooks/usePersonalData";
import type { CisEvent, Friend, Organizer } from "@/types";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border py-2.5 text-sm last:border-b-0">
      <span className="text-muted">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}

export function EventDetailClient({ id }: { id: string }) {
  return (
    <ClientOnly fallback={<EventDetailSkeleton />}>
      <EventDetailContent id={id} />
    </ClientOnly>
  );
}

function EventDetailContent({ id }: { id: string }) {
  const { events, organizers, friends, loading, error } = useRemoteData();
  const { user, loading: sessionLoading } = useSession();
  const personal = usePersonalData(sessionLoading ? undefined : (user?.id ?? null));
  const event = events.find((e) => e.id === id);

  if (loading || sessionLoading || personal.loading) return <EventDetailSkeleton />;
  if (error) return <EventNotFoundNotice />;
  if (!event) return <EventNotFoundNotice />;

  const isLocked = event.isPrivate && !personal.openedEventIds.includes(event.id);
  if (isLocked) return <LockedEventNotice />;

  return (
    <EventDetailView
      event={event}
      organizers={organizers}
      friends={friends}
      userId={user?.id ?? null}
      personal={personal}
    />
  );
}

function EventDetailView({
  event,
  organizers,
  friends,
  userId,
  personal,
}: {
  event: CisEvent;
  organizers: Organizer[];
  friends: Friend[];
  userId: string | null;
  personal: ReturnType<typeof usePersonalData>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [ticketMessage, setTicketMessage] = useState<string | null>(null);

  const viewCountedRef = useRef(false);

  // Счётчик просмотров — увеличиваем один раз при открытии страницы.
  useEffect(() => {
    if (viewCountedRef.current) return;
    viewCountedRef.current = true;
    createClient().rpc("increment_event_view", { p_event_id: event.id });
  }, [event.id]);

  const organizer = organizers.find((o) => o.id === event.organizerId);
  const goingFriends = friends.filter((f) => event.friendsGoingIds.includes(f.id));
  const youGoing = personal.attendingEventIds.includes(event.id);

  const mapsUrl = `https://yandex.ru/maps/?text=${encodeURIComponent(
    `${event.address}, Санкт-Петербург`
  )}`;

  async function handleBuyTicket() {
    // Статистика кликов для организатора считается всегда, независимо от входа в аккаунт.
    await createClient()
      .from("ticket_clicks")
      .insert({ event_id: event.id, user_id: userId, promo_code: searchParams.get("promo") });
    if (userId) {
      const rewarded = await personal.recordTicketClick(event.id);
      if (rewarded) {
        setTicketMessage(ru.event.ticketBonusEarned);
        setTimeout(() => setTicketMessage(null), 2500);
      }
    }
    // Открываем в новой вкладке — пользователь не теряет ленту на телефоне.
    window.open(event.ticketUrl, "_blank", "noopener,noreferrer");
  }

  function handleToggleAttend() {
    if (!userId) {
      router.push("/profile");
      return;
    }
    personal.toggleAttending(event.id);
  }

  async function handleShare() {
    const url = window.location.href;
    const shareData = { title: event.title, text: `${event.title} — ${brand.name}`, url };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareMessage("Ссылка скопирована");
      setTimeout(() => setShareMessage(null), 2000);
    } catch {
      // Пользователь закрыл системное окно «поделиться» — это нормально, ничего не делаем.
    }
  }

  return (
    <div className="pb-6 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
      <div className="flex items-center justify-between px-2 py-2">
        <button
          onClick={() => router.back()}
          className="flex min-h-[44px] items-center gap-1 px-2 text-sm text-muted"
        >
          <ChevronLeft size={20} />
          Назад
        </button>
        <button
          onClick={handleShare}
          className="flex min-h-[44px] items-center gap-1.5 px-2 text-sm text-muted"
        >
          <Share2 size={16} />
          Поделиться
        </button>
      </div>

      {shareMessage ? <p className="px-4 text-xs text-accent">{shareMessage}</p> : null}

      <EventCover
        genre={event.genre}
        title={event.title}
        coverImageUrl={event.coverImageUrl}
        size="detail"
      />

      <div className="space-y-5 px-4 pt-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-sm text-foreground">{formatEventWhenRange(event)}</span>
            <span className="text-sm text-muted"> · {GENRE_META[event.genre].label}</span>
          </div>
          {event.age18Plus ? (
            <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted">
              {ru.event.age18Plus}
            </span>
          ) : null}
        </div>

        <div>
          <p className="text-sm text-foreground">{event.venue}</p>
          <p className="text-sm text-muted">
            {event.district} · {event.metro}
          </p>
          <p className="text-sm text-muted">{event.address}</p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block min-h-[44px] rounded-xl border border-border px-4 py-2.5 text-sm text-foreground"
          >
            {ru.event.openInMaps}
          </a>
        </div>

        {organizer ? (
          <p className="text-sm text-muted">
            {ru.event.organizer}: <span className="text-foreground">{organizer.name}</span>
          </p>
        ) : null}

        <div>
          <p className="font-display text-xl text-foreground">{formatPrice(event.price)}</p>

          <button
            onClick={handleBuyTicket}
            className="mt-3 min-h-[52px] w-full rounded-xl bg-accent text-sm font-medium text-accent-ink transition-transform duration-150 active:scale-[0.98]"
          >
            {event.price === 0 ? ru.event.signUpFree : ru.event.buyTicket}
          </button>
          {ticketMessage ? <p className="mt-2 text-xs text-accent">{ticketMessage}</p> : null}

          <button
            onClick={handleToggleAttend}
            className={`mt-2 min-h-[48px] w-full rounded-xl border text-sm font-medium transition-colors duration-150 ${
              youGoing
                ? "border-accent2 bg-accent2 text-foreground"
                : "border-border text-foreground"
            }`}
          >
            {youGoing ? ru.event.attending : ru.event.attend}
          </button>
        </div>

        {event.vibe.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {event.vibe.map((tag) => (
              <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {event.lineup.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">{ru.event.lineup}</p>
            <p className="text-sm text-muted">{event.lineup.join(", ")}</p>
          </div>
        ) : null}

        {event.description ? (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">{ru.event.about}</p>
            <p className="text-sm leading-relaxed text-muted">{event.description}</p>
          </div>
        ) : null}

        <div>
          <InfoRow
            label={ru.event.faceControl}
            value={event.faceControl ? ru.event.faceControlYes : ru.event.faceControlNo}
          />
          <InfoRow label={ru.event.dressCode} value={event.dressCode} />
          <InfoRow label={ru.event.age} value={event.age18Plus ? ru.event.age18Plus : "Без ограничений"} />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">{ru.event.going}</p>
          {goingFriends.length === 0 && !youGoing ? (
            <p className="text-sm text-muted">{ru.event.noFriendsGoing}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {youGoing ? (
                <div className="flex items-center gap-1.5 rounded-full border border-accent2 bg-accent2/10 px-2 py-1">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent2 text-[9px] font-medium text-foreground">
                    {ru.event.you[0]}
                  </div>
                  <span className="text-xs text-foreground">{ru.event.you}</span>
                </div>
              ) : null}
              {goingFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-1"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-border text-[9px] font-medium text-foreground">
                    {friend.initials}
                  </div>
                  <span className="text-xs text-muted">{friend.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
