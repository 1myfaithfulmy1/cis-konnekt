import Image from "next/image";

export function UserAvatar({
  name,
  avatarUrl,
  size = 56,
}: {
  name: string;
  avatarUrl?: string;
  size?: number;
}) {
  const initial = name.trim()[0]?.toUpperCase() ?? "?";
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border border-border bg-surface"
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt="" fill unoptimized className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-display text-lg text-muted">
          {initial}
        </div>
      )}
    </div>
  );
}
