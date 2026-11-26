"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rows3, User, Briefcase, MessageCircle } from "lucide-react";
import { ru } from "@/content/ru";

const TABS = [
  { href: "/", label: ru.nav.feed, icon: Rows3 },
  { href: "/profile", label: ru.nav.profile, icon: User },
  { href: "/messages", label: ru.nav.messages, icon: MessageCircle },
  { href: "/cabinet", label: ru.nav.cabinet, icon: Briefcase },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 border-t border-border bg-surface md:hidden">
      {TABS.map((tab) => {
        // "Лента" активна только на самой главной, остальные — по началу пути
        const isActive =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150"
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.25 : 1.75}
              className={isActive ? "text-accent" : "text-muted"}
            />
            <span
              className={`text-xs ${isActive ? "text-accent" : "text-muted"}`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
