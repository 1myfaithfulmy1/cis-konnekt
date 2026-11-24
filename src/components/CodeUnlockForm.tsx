"use client";

import { useState } from "react";
import Link from "next/link";
import { ru } from "@/content/ru";
import type { UnlockResult } from "@/hooks/usePersonalData";
import type { CisEvent } from "@/types";

export function CodeUnlockForm({
  events,
  onSubmitCode,
}: {
  events: CisEvent[];
  onSubmitCode: (code: string, events: CisEvent[]) => Promise<{ result: UnlockResult; eventId?: string }>;
}) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string; eventId?: string } | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    const { result, eventId } = await onSubmitCode(code, events);
    if (result === "ok") {
      setMessage({ kind: "success", text: ru.profile.codeSuccess, eventId });
    } else if (result === "already") {
      setMessage({ kind: "success", text: ru.profile.codeAlready, eventId });
    } else {
      setMessage({ kind: "error", text: ru.profile.codeInvalid });
    }
    setCode("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-sm font-medium text-foreground">{ru.profile.codeTitle}</p>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={ru.profile.codePlaceholder}
          className="min-h-[44px] flex-1 rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          className="min-h-[44px] rounded-xl bg-accent px-4 text-sm font-medium text-accent-ink"
        >
          {ru.profile.codeSubmit}
        </button>
      </div>
      {message ? (
        <p className={`text-sm ${message.kind === "success" ? "text-accent" : "text-red-400"}`}>
          {message.text}
          {message.kind === "success" && message.eventId ? (
            <>
              {" "}
              <Link href={`/event/${message.eventId}`} className="underline">
                Смотреть
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}
