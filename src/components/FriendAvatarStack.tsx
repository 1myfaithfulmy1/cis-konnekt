import type { Friend } from "@/types";

/** Кружки с инициалами друзей внахлёст, как в соцсетях. Без фото — только инициалы. */
export function FriendAvatarStack({ friends, max = 4 }: { friends: Friend[]; max?: number }) {
  const shown = friends.slice(0, max);

  return (
    <div className="flex -space-x-2">
      {shown.map((friend) => (
        <div
          key={friend.id}
          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-border text-[10px] font-medium text-foreground"
          title={friend.name}
        >
          {friend.initials}
        </div>
      ))}
    </div>
  );
}
