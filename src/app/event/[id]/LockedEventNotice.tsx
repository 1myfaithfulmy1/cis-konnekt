import Link from "next/link";
import { Lock } from "lucide-react";
import { EventCover } from "@/components/EventCover";
import type { Genre } from "@/types";

/** Закрытое событие на отдельной странице — размытый «тизер» обложки и неоновый замок. */
export function LockedEventNotice({ genre }: { genre: Genre }) {
  return (
    <div className="pb-6 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
      <div className="relative overflow-hidden md:rounded-2xl">
        <div className="pointer-events-none opacity-60 blur-md">
          <EventCover genre={genre} title="" size="detail" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-[1px]">
          <div className="glow-accent2 flex h-14 w-14 items-center justify-center rounded-full border border-accent2/40 bg-surface">
            <Lock size={26} className="text-accent2 drop-shadow-[0_0_6px_var(--accent2)]" />
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 text-center">
        <p className="font-display text-lg text-foreground">Закрытый ивент — нужен код</p>
        <p className="mt-2 text-sm text-muted">
          Код для входа выдаёт организатор. Введи его в профиле, чтобы увидеть подробности.
        </p>
        <Link
          href="/profile"
          className="glow-accent mt-6 inline-block min-h-[44px] rounded-xl bg-[image:var(--gradient-sunset)] px-5 py-3 text-sm font-medium text-accent-ink"
        >
          Перейти в профиль
        </Link>
      </div>
    </div>
  );
}
