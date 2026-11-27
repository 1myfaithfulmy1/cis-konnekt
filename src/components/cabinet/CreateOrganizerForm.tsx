"use client";

import { useState } from "react";
import { ru } from "@/content/ru";

export function CreateOrganizerForm({ onCreate }: { onCreate: (name: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onCreate(name);
    setSubmitting(false);
  }

  return (
    <div className="px-4 pt-6 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
      <h1 className="font-display text-xl text-foreground">{ru.cabinet.createOrgTitle}</h1>
      <p className="mt-1 text-sm text-muted">{ru.cabinet.createOrgHint}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={ru.cabinet.createOrgNamePlaceholder}
          required
          className="min-h-[44px] w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-foreground placeholder:text-muted transition-colors duration-150 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={submitting}
          className="min-h-[48px] w-full rounded-xl bg-accent text-sm font-medium text-accent-ink transition-[opacity,transform] duration-150 active:scale-[0.98] disabled:opacity-60"
        >
          {ru.cabinet.createOrgSubmit}
        </button>
      </form>
    </div>
  );
}
