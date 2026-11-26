"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ru } from "@/content/ru";
import { ClientOnly } from "@/components/ClientOnly";
import { MessagesSkeleton } from "@/components/MessagesSkeleton";
import { AuthForm } from "@/components/AuthForm";
import { UserAvatar } from "@/components/UserAvatar";
import { useSession } from "@/hooks/useSession";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useMessages } from "@/hooks/useMessages";

export function MessageThreadClient({ otherId }: { otherId: string }) {
  return (
    <ClientOnly fallback={<MessagesSkeleton />}>
      <ThreadContent otherId={otherId} />
    </ClientOnly>
  );
}

function ThreadContent({ otherId }: { otherId: string }) {
  const { user, loading: sessionLoading } = useSession();

  if (sessionLoading) return <MessagesSkeleton />;
  if (!user) {
    return (
      <div className="px-4 pt-6 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
        <AuthForm />
      </div>
    );
  }

  return <Thread userId={user.id} otherId={otherId} />;
}

function Thread({ userId, otherId }: { userId: string; otherId: string }) {
  const { profile: partner, loading: partnerLoading } = usePublicProfile(otherId);
  const { messages, loading: messagesLoading, sendMessage } = useMessages(userId, otherId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  if (partnerLoading || messagesLoading) return <MessagesSkeleton />;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await sendMessage(text);
    setText("");
    setSending(false);
  }

  return (
    <div className="flex h-full flex-col md:mx-auto md:max-w-2xl">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:px-0">
        <Link href="/messages" className="flex min-h-[44px] items-center px-1 text-muted">
          <ChevronLeft size={20} />
        </Link>
        {partner ? (
          <>
            <UserAvatar name={partner.name} avatarUrl={partner.avatarUrl} size={36} />
            <p className="font-display text-base text-foreground">
              {partner.nickname ? `${partner.name} (${partner.nickname})` : partner.name}
            </p>
          </>
        ) : null}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4 md:px-0">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted">{ru.messages.threadEmpty}</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === userId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-accent text-accent-ink" : "border border-border bg-surface text-foreground"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-4 md:px-0">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={ru.messages.messagePlaceholder}
          className="min-h-[44px] flex-1 rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="min-h-[44px] rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink disabled:opacity-60"
        >
          {ru.messages.send}
        </button>
      </form>
    </div>
  );
}
