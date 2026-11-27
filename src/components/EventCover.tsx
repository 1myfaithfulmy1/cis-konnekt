import Image from "next/image";
import { GENRE_META } from "@/data/genres";
import type { Genre } from "@/types";

const TEXT_COLOR_CLASS = {
  accent: "text-accent",
  accent2: "text-accent2",
  cyan: "text-cyan",
} as const;

const GLOW_BG_CLASS = {
  accent: "bg-accent",
  accent2: "bg-accent2",
  cyan: "bg-cyan",
} as const;

/**
 * Абстрактный неоновый узор по жанру — тонкие линии/круги/точки, без фото.
 * Один узор на жанр, всегда одним из неоновых цветов бренда (см. genres.ts).
 */
function GenrePattern({ genre }: { genre: Genre }) {
  const meta = GENRE_META[genre];

  const shape = (() => {
    switch (meta.pattern) {
      case "grid":
        return (
          <g stroke="currentColor" strokeWidth="0.6">
            <line x1="0" y1="30" x2="100" y2="20" />
            <line x1="0" y1="55" x2="100" y2="45" />
            <line x1="0" y1="80" x2="100" y2="70" />
            <line x1="20" y1="0" x2="10" y2="100" />
            <line x1="50" y1="0" x2="45" y2="100" />
            <line x1="80" y1="0" x2="80" y2="100" />
          </g>
        );
      case "stripes":
        return (
          <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="45" y1="0" x2="100" y2="55" />
            <line x1="60" y1="0" x2="100" y2="40" />
            <line x1="75" y1="0" x2="100" y2="25" />
            <line x1="90" y1="0" x2="100" y2="10" />
          </g>
        );
      case "rings":
        return (
          <g stroke="currentColor" fill="none" strokeWidth="1">
            <circle cx="85" cy="85" r="10" />
            <circle cx="85" cy="85" r="22" />
            <circle cx="85" cy="85" r="34" />
            <circle cx="85" cy="85" r="46" />
          </g>
        );
      case "waves":
        return (
          <g stroke="currentColor" fill="none" strokeWidth="1.2">
            <path d="M-10,70 Q5,60 20,70 T50,70 T80,70 T110,70" />
            <path d="M-10,85 Q5,75 20,85 T50,85 T80,85 T110,85" />
          </g>
        );
      case "dots":
        return (
          <g fill="currentColor">
            <circle cx="10" cy="15" r="1.4" />
            <circle cx="25" cy="8" r="1.1" />
            <circle cx="40" cy="20" r="1.6" />
            <circle cx="60" cy="10" r="1.2" />
            <circle cx="75" cy="18" r="1.4" />
            <circle cx="90" cy="8" r="1.1" />
            <circle cx="15" cy="30" r="1.1" />
            <circle cx="50" cy="28" r="1.3" />
            <circle cx="85" cy="30" r="1.2" />
          </g>
        );
      case "cross":
        return (
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="55" y1="8" x2="97" y2="50" />
            <line x1="97" y1="8" x2="55" y2="50" />
          </g>
        );
      case "rays":
        return (
          <g stroke="currentColor" strokeWidth="1">
            <line x1="100" y1="0" x2="50" y2="20" />
            <line x1="100" y1="0" x2="65" y2="35" />
            <line x1="100" y1="0" x2="82" y2="45" />
            <line x1="100" y1="0" x2="100" y2="48" />
          </g>
        );
    }
  })();

  return (
    <>
      {/* Размытое цветовое пятно позади узора — атмосфера, а не текст. */}
      <div
        className={`absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-3xl ${GLOW_BG_CLASS[meta.color]}`}
      />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className={`absolute inset-0 h-full w-full opacity-60 ${TEXT_COLOR_CLASS[meta.color]}`}
      >
        {shape}
      </svg>
    </>
  );
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
          {/* unoptimized — фото уже сжато при загрузке и лежит в Supabase Storage;
              через сервер оптимизации картинок Next.js (ограниченный список доменов) его не пропустить. */}
          <Image src={coverImageUrl} alt="" fill unoptimized className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
        </>
      ) : (
        <GenrePattern genre={genre} />
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
