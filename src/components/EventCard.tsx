import Link from "next/link";
import { GENRE_META } from "@/data/genres";
import { EventCover } from "@/components/EventCover";
import { FriendAvatarStack } from "@/components/FriendAvatarStack";
import { LiveDot } from "@/components/LiveDot";
import { formatEventWhen } from "@/lib/dates";
import { formatGoingLabel, formatPrice } from "@/lib/format";
import type { CisEvent, Friend } from "@/types";

export function EventCard({ event, friends }: { event: CisEvent; friends: Friend[] }) {
  const goingFriends = friends.filter((f) => event.friendsGoingIds.includes(f.id));

  return (
    <Link
      href={`/event/${event.id}`}
      className="block overflow-hidden rounded-2xl border border-border bg-surface transition-[transform,box-shadow,border-color] duration-200 active:scale-[0.98] active:border-accent active:shadow-[0_0_20px_-6px_var(--accent)]"
    >
      <EventCover
        genre={event.genre}
        title={event.title}
        coverImageUrl={event.coverImageUrl}
        size="card"
      />

      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm text-muted">
            {event.dayOffset === 0 ? <LiveDot /> : null}
            {formatEventWhen(event)}
          </span>
          {event.age18Plus ? (
            <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted">
              18+
            </span>
          ) : null}
        </div>

        <p className="text-sm text-muted">
          {event.venue} · {event.metro}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{GENRE_META[event.genre].label}</span>
          <span className="text-sm font-medium text-foreground">{formatPrice(event.price)}</span>
        </div>

        {goingFriends.length > 0 ? (
          <div className="flex items-center gap-2 pt-1">
            <FriendAvatarStack friends={goingFriends} />
            <span className="text-xs text-muted">{formatGoingLabel(goingFriends)}</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
