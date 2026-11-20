import { organizers } from "@/data/seed";
import { ru } from "@/content/ru";

export function OrganizerPicker({ onSelect }: { onSelect: (organizerId: string) => void }) {
  return (
    <div className="px-4 pt-6 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
      <h1 className="font-display text-xl text-foreground">{ru.cabinet.pickerTitle}</h1>
      <p className="mt-1 text-sm text-muted">{ru.cabinet.pickerHint}</p>

      <div className="mt-6 space-y-2">
        {organizers.map((org) => (
          <button
            key={org.id}
            onClick={() => onSelect(org.id)}
            className="min-h-[52px] w-full rounded-xl border border-border bg-surface px-4 text-left text-sm font-medium text-foreground transition-colors duration-150 hover:border-accent"
          >
            {org.name}
          </button>
        ))}
      </div>
    </div>
  );
}
