import type { BonusEntry } from "@/lib/storage";
import { ru } from "@/content/ru";

function formatEntryDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function BonusHistoryList({ history }: { history: BonusEntry[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-muted">{ru.profile.historyEmpty}</p>;
  }

  return (
    <ul className="space-y-1.5">
      {history.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between text-sm">
          <span className="text-muted">
            {entry.reason} · {formatEntryDate(entry.at)}
          </span>
          <span className="font-medium text-accent">+{entry.amount}</span>
        </li>
      ))}
    </ul>
  );
}
