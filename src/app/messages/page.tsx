"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ru } from "@/content/ru";
import { ClientOnly } from "@/components/ClientOnly";
import { MessagesSkeleton } from "@/components/MessagesSkeleton";
import { AuthForm } from "@/components/AuthForm";
import { UserAvatar } from "@/components/UserAvatar";
import { useSession } from "@/hooks/useSession";
import { useConversations } from "@/hooks/useConversations";
import { findProfileByNickname } from "@/lib/supabase/nickname";

export default function MessagesPage() {
  return (
    <ClientOnly fallback={<MessagesSkeleton />}>
      <MessagesContent />
    </ClientOnly>
  );
}

function MessagesContent() {
  const { user, loading: sessionLoading } = useSession();

  if (sessionLoading) return <MessagesSkeleton />;
  if (!user) {
    return (
      <div className="px-4 pt-6 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
        <AuthForm />
      </div>
    );
  }

  return <MessagesList userId={user.id} />;
}

function MessagesList({ userId }: { userId: string }) {
  const router = useRouter();
  const { conversations, loading } = useConversations(userId);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setNotFound(false);
    const found = await findProfileByNickname(query);
    setSearching(false);
    if (!found) {
      setNotFound(true);
      return;
    }
    router.push(`/messages/${found.id}`);
  }

  return (
    <div className="space-y-6 px-4 pb-6 pt-4 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
      <h1 className="font-display text-xl text-foreground">{ru.messages.title}</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setNotFound(false);
          }}
          placeholder={ru.messages.searchPlaceholder}
          className="min-h-[44px] flex-1 rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={searching}
          className="min-h-[44px] rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink disabled:opacity-60"
        >
          {ru.messages.searchSubmit}
        </button>
      </form>
      {notFound ? <p className="text-sm text-red-400">{ru.messages.searchNotFound}</p> : null}

      {loading ? (
        <MessagesSkeleton />
      ) : conversations.length === 0 ? (
        <p className="text-sm text-muted">{ru.messages.conversationsEmpty}</p>
      ) : (
        <div className="space-y-2">
          {conversations.map(({ partner, lastMessage }) => (
            <Link
              key={partner.id}
              href={`/messages/${partner.id}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors duration-150 active:scale-[0.99]"
            >
              <UserAvatar name={partner.name} avatarUrl={partner.avatarUrl} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {partner.nickname ? `${partner.name} (${partner.nickname})` : partner.name}
                </p>
                <p className="truncate text-xs text-muted">
                  {lastMessage.senderId === userId ? "Ты: " : ""}
                  {lastMessage.body}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
