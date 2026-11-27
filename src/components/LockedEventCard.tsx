import { Lock } from "lucide-react";
import { EventCover } from "@/components/EventCover";
import type { Genre } from "@/types";

/** Закрытое событие в ленте — размытый «тизер» обложки и неоновый замок, без подробностей. */
export function LockedEventCard({ genre }: { genre?: Genre }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
      {genre ? (
        <div className="pointer-events-none opacity-60 blur-md">
          <EventCover genre={genre} title="" size="card" />
        </div>
      ) : (
        <div className="aspect-[16/11] bg-surface-2" />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/55 p-4 text-center backdrop-blur-[1px]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent2/40 bg-surface">
          <Lock size={18} className="text-accent2 drop-shadow-[0_0_6px_var(--accent2)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Закрытый ивент — нужен код</p>
          <p className="text-xs text-muted">Введи код в профиле, чтобы открыть</p>
        </div>
      </div>
    </div>
  );
}
