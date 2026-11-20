import Link from "next/link";
import { Lock } from "lucide-react";

export function LockedEventNotice() {
  return (
    <div className="px-4 pt-10 text-center md:mx-auto md:max-w-2xl md:px-6 md:py-10">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
        <Lock size={22} className="text-muted" />
      </div>
      <p className="font-display text-lg text-foreground">Закрытый ивент — нужен код</p>
      <p className="mt-2 text-sm text-muted">
        Код для входа выдаёт организатор. Введи его в профиле, чтобы увидеть подробности.
      </p>
      <Link
        href="/profile"
        className="mt-6 inline-block min-h-[44px] rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-ink"
      >
        Перейти в профиль
      </Link>
    </div>
  );
}
