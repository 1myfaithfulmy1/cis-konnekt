import type { Genre } from "@/types";

/**
 * Описание каждого жанра: подпись для интерфейса и то, как он выглядит
 * на обложке события. Цвет — только основной (accent) или второй (accent2)
 * акцент бренда, по правилу «используем акценты дозированно».
 */
export const GENRE_META: Record<
  Genre,
  {
    label: string;
    color: "accent" | "accent2";
    shape: "line-bottom" | "line-top" | "square-tr" | "square-tl" | "circle-tr" | "diagonal";
  }
> = {
  "hip-hop": { label: "Хип-хоп", color: "accent2", shape: "line-bottom" },
  "rap-party": { label: "Рэп-вечеринка", color: "accent", shape: "line-bottom" },
  techno: { label: "Техно", color: "accent2", shape: "square-tr" },
  house: { label: "Хаус", color: "accent", shape: "circle-tr" },
  "student-party": { label: "Студенческая вечеринка", color: "accent", shape: "line-top" },
  "battle-jam": { label: "Баттл/джем", color: "accent2", shape: "diagonal" },
  "day-rooftop": { label: "Дневной руфтоп", color: "accent", shape: "square-tl" },
};

export const GENRE_OPTIONS: { value: Genre; label: string }[] = (
  Object.entries(GENRE_META) as [Genre, (typeof GENRE_META)[Genre]][]
).map(([value, meta]) => ({ value, label: meta.label }));
