import type { Genre } from "@/types";

/**
 * Описание каждого жанра: подпись для интерфейса и то, как он выглядит
 * на обложке события. Цвет — почти всегда один из двух неоновых акцентов
 * (фиолетовый/розовый), холодный циан — только у одного жанра («дневной
 * руфтоп» — дневное небо, а не ночной неон), по правилу «акценты дозированно».
 */
export const GENRE_META: Record<
  Genre,
  {
    label: string;
    color: "accent" | "accent2" | "cyan";
    pattern: "grid" | "stripes" | "rings" | "waves" | "dots" | "cross" | "rays";
  }
> = {
  "hip-hop": { label: "Хип-хоп", color: "accent", pattern: "grid" },
  "rap-party": { label: "Рэп-вечеринка", color: "accent2", pattern: "stripes" },
  techno: { label: "Техно", color: "accent", pattern: "rings" },
  house: { label: "Хаус", color: "accent2", pattern: "waves" },
  "student-party": { label: "Студенческая вечеринка", color: "accent", pattern: "dots" },
  "battle-jam": { label: "Баттл/джем", color: "accent2", pattern: "cross" },
  "day-rooftop": { label: "Дневной руфтоп", color: "cyan", pattern: "rays" },
};

export const GENRE_OPTIONS: { value: Genre; label: string }[] = (
  Object.entries(GENRE_META) as [Genre, (typeof GENRE_META)[Genre]][]
).map(([value, meta]) => ({ value, label: meta.label }));
