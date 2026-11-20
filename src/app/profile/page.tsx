"use client";

import { useMemo, useState } from "react";
import { friends, demoUser } from "@/data/seed";
import { getAllEvents } from "@/lib/events";
import { ru } from "@/content/ru";
import { ClientOnly } from "@/components/ClientOnly";
import { ProfileSkeleton } from "@/components/ProfileSkeleton";
import { EventCard } from "@/components/EventCard";
import { BonusHistoryList } from "@/components/BonusHistoryList";
import { CodeUnlockForm } from "@/components/CodeUnlockForm";
import { useAppState } from "@/hooks/useAppState";
import { applyReferralBonus, bonusBalance, resetState } from "@/lib/storage";

export default function ProfilePage() {
  return (
    <ClientOnly fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </ClientOnly>
  );
}

function ProfileContent() {
  const { state, update, reset } = useAppState();
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const balance = bonusBalance(state, demoUser.startingBonus);
  const allEvents = useMemo(() => getAllEvents(state), [state]);
  const myEvents = allEvents.filter((e) => state.attendingEventIds.includes(e.id));

  async function handleInvite() {
    const link = `${window.location.origin}/?ref=demo`;
    try {
      await navigator.clipboard.writeText(link);
      setInviteMessage(ru.profile.inviteCopied);
      setTimeout(() => setInviteMessage(null), 2000);
    } catch {
      // Буфер обмена недоступен — бонус всё равно начислим, ссылку покажем в сообщении ниже.
    }
    update(applyReferralBonus);
  }

  function handleReset() {
    const fresh = resetState();
    reset(fresh);
    setResetMessage(ru.profile.resetDone);
    setTimeout(() => setResetMessage(null), 2000);
  }

  return (
    <div className="space-y-6 px-4 pb-6 pt-4 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="font-display text-lg text-foreground">{demoUser.name}</p>
        <p className="mt-1 text-2xl font-semibold text-accent">
          {balance} <span className="text-sm font-normal text-muted">{ru.profile.balanceLabel}</span>
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{ru.profile.historyTitle}</p>
        <BonusHistoryList history={state.bonusHistory} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <button
          onClick={handleInvite}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-medium text-accent-ink"
        >
          {ru.profile.inviteButton}
          <span className="rounded-full bg-accent-ink/10 px-2 py-0.5 text-xs">{ru.profile.inviteDemoBadge}</span>
        </button>
        <p className="mt-2 text-center text-xs text-muted">
          {state.referralUsed ? ru.profile.inviteRewardUsed : ru.profile.inviteRewardAvailable}
        </p>
        {inviteMessage ? <p className="mt-1 text-center text-xs text-accent">{inviteMessage}</p> : null}
      </div>

      <CodeUnlockForm events={allEvents} update={update} />

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{ru.profile.myEventsTitle}</p>
        {myEvents.length === 0 ? (
          <p className="text-sm text-muted">{ru.profile.myEventsEmpty}</p>
        ) : (
          <div className="space-y-3">
            {myEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{ru.profile.friendsTitle}</p>
        <div className="grid grid-cols-2 gap-2">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-border text-[10px] font-medium text-foreground">
                {friend.initials}
              </div>
              <span className="truncate text-sm text-muted">{friend.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <button
          onClick={handleReset}
          className="min-h-[44px] w-full rounded-xl border border-border text-sm text-muted"
        >
          {ru.profile.resetButton}
        </button>
        {resetMessage ? <p className="text-center text-xs text-accent">{resetMessage}</p> : null}
        <p className="text-center text-xs text-muted">{ru.profile.disclaimer}</p>
      </div>
    </div>
  );
}
