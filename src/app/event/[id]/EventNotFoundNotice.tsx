import Link from "next/link";
import { ru } from "@/content/ru";

export function EventNotFoundNotice() {
  return (
    <div className="px-4 pt-10 text-center md:mx-auto md:max-w-2xl md:px-6 md:py-10">
      <p className="font-display text-lg text-foreground">{ru.event.notFoundTitle}</p>
      <p className="mt-2 text-sm text-muted">{ru.event.notFoundHint}</p>
      <Link
        href="/"
        className="mt-6 inline-block min-h-[44px] rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-ink"
      >
        В ленту
      </Link>
    </div>
  );
}
