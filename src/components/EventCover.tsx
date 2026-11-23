import Image from "next/image";
import { GENRE_META } from "@/data/genres";
import type { Genre } from "@/types";

const COLOR_CLASS = {
  accent: "bg-accent",
  accent2: "bg-accent2",
} as const;

/** Тонкий цветной элемент по жанру — линия или небольшая фигура. */
function GenreShape({ genre }: { genre: Genre }) {
  const meta = GENRE_META[genre];
  const colorClass = COLOR_CLASS[meta.color];

  switch (meta.shape) {
    case "line-bottom":
      return <div className={`absolute inset-x-0 bottom-0 h-[3px] ${colorClass}`} />;
    case "line-top":
      return <div className={`absolute inset-x-0 top-0 h-[3px] ${colorClass}`} />;
    case "square-tr":
      return <div className={`absolute right-3 top-3 h-3 w-3 rounded-sm ${colorClass}`} />;
    case "square-tl":
      return <div className={`absolute left-3 top-3 h-3 w-3 rounded-sm ${colorClass}`} />;
    case "circle-tr":
      return <div className={`absolute right-3 top-3 h-3 w-3 rounded-full ${colorClass}`} />;
    case "diagonal":
      return (
        <div
          className={`absolute right-0 top-[35%] h-[2px] w-1/2 origin-right -rotate-[8deg] ${colorClass}`}
        />
      );
  }
}

export function EventCover({
  genre,
  title,
  coverImageUrl,
  size = "card",
}: {
  genre: Genre;
  title: string;
  coverImageUrl?: string;
  size?: "card" | "detail";
}) {
  return (
    <div
      className={`relative flex items-end overflow-hidden bg-surface ${
        size === "detail" ? "aspect-[4/3]" : "aspect-[16/11]"
      }`}
    >
      {coverImageUrl ? (
        <>
          {/* unoptimized — фото уже своё, сжатое и лежит прямо в localStorage (data-URL),
              через обычный сервер оптимизации картинок Next.js его не пропустить. */}
          <Image src={coverImageUrl} alt="" fill unoptimized className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </>
      ) : (
        <GenreShape genre={genre} />
      )}
      <h2
        className={`relative p-4 font-display font-bold leading-snug ${
          coverImageUrl ? "text-white" : "text-foreground"
        } ${size === "detail" ? "text-2xl" : "line-clamp-2 text-lg"}`}
      >
        {title}
      </h2>
    </div>
  );
}
