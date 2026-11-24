"use client";

import { useState } from "react";
import { ru } from "@/content/ru";
import { ClientOnly } from "@/components/ClientOnly";
import { ProfileSkeleton } from "@/components/ProfileSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { EventCard } from "@/components/EventCard";
import { BonusHistoryList } from "@/components/BonusHistoryList";
import { CodeUnlockForm } from "@/components/CodeUnlockForm";
import { AuthForm } from "@/components/AuthForm";
import { useRemoteData } from "@/hooks/useRemoteData";
import { useSession } from "@/hooks/useSession";
import { useProfile } from "@/hooks/useProfile";
import { usePersonalData } from "@/hooks/usePersonalData";
import { createClient } from "@/lib/supabase/client";
import { computeBalance } from "@/lib/bonus";

export default function ProfilePage() {
  return (
    <ClientOnly fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </ClientOnly>
  );
}

function ProfileContent() {
  const { user, loading: sessionLoading } = useSession();

  if (sessionLoading) return <ProfileSkeleton />;
  if (!user) {
    return (
      <div className="px-4 pt-6 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
        <AuthForm />
      </div>
    );
  }

  return <LoggedInProfile userId={user.id} />;
}

function LoggedInProfile({ userId }: { userId: string }) {
  const { events, friends, loading, error } = useRemoteData();
  const { profile, loading: profileLoading, markReferralUsed, resetReferral } = useProfile(userId);
  const personal = usePersonalData(userId);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const balance = computeBalance(profile?.startingBonus ?? 0, personal.bonusHistory);
  const myEvents = events.filter((e) => personal.attendingEventIds.includes(e.id));

  async function handleLogout() {
    await createClient().auth.signOut();
  }

  async function handleInvite() {
    const link = `${window.location.origin}/?ref=demo`;
    try {
      await navigator.clipboard.writeText(link);
      setInviteMessage(ru.profile.inviteCopied);
      setTimeout(() => setInviteMessage(null), 2000);
    } catch {
      // Буфер обмена недоступен — бонус всё равно начислим, ссылку покажем в сообщении ниже.
    }
    if (!profile?.referralUsed) {
      await markReferralUsed();
      await personal.grantBonus(100, "Приглашённый друг (демо)");
    }
  }

  async function handleReset() {
    await Promise.all([personal.resetAll(), resetReferral()]);
    setResetMessage(ru.profile.resetDone);
    setTimeout(() => setResetMessage(null), 2000);
  }

  if (loading || profileLoading || personal.loading) return <ProfileSkeleton />;
  if (error || !profile) {
    return (
      <div className="px-4 pt-6 md:mx-auto md:max-w-2xl md:px-6">
        <EmptyState title="Не удалось загрузить профиль" hint="Проверь соединение и обнови страницу" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 pb-6 pt-4 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-foreground">{profile.name}</p>
          <button onClick={handleLogout} className="min-h-[36px] text-sm text-muted underline">
            {ru.auth.logout}
          </button>
        </div>
        <p className="mt-1 text-2xl font-semibold text-accent">
          {balance} <span className="text-sm font-normal text-muted">{ru.profile.balanceLabel}</span>
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{ru.profile.historyTitle}</p>
        <BonusHistoryList history={personal.bonusHistory} />
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
          {profile.referralUsed ? ru.profile.inviteRewardUsed : ru.profile.inviteRewardAvailable}
        </p>
        {inviteMessage ? <p className="mt-1 text-center text-xs text-accent">{inviteMessage}</p> : null}
      </div>

      <CodeUnlockForm events={events} onSubmitCode={personal.unlockByCode} />

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{ru.profile.myEventsTitle}</p>
        {myEvents.length === 0 ? (
          <p className="text-sm text-muted">{ru.profile.myEventsEmpty}</p>
        ) : (
          <div className="space-y-3">
            {myEvents.map((event) => (
              <EventCard key={event.id} event={event} friends={friends} />
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
