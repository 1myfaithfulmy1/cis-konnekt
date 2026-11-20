import { Lock } from "lucide-react";

/** Закрытое событие в ленте — без подробностей, только подсказка про код. */
export function LockedEventCard() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background">
        <Lock size={18} className="text-muted" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Закрытый ивент — нужен код</p>
        <p className="text-xs text-muted">Введи код в профиле, чтобы открыть</p>
      </div>
    </div>
  );
}
