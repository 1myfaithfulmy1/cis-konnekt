"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/config/brand";
import { ru } from "@/content/ru";

const LINKS = [
  { href: "/", label: ru.nav.feed },
  { href: "/profile", label: ru.nav.profile },
  { href: "/messages", label: ru.nav.messages },
  { href: "/cabinet", label: ru.nav.cabinet },
] as const;

/** Верхнее меню — показывается только на широких экранах (на телефоне навигация внизу). */
export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 hidden border-b border-border bg-surface md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <span className="font-display text-lg text-foreground">{brand.name}</span>
        <nav className="flex items-center gap-6">
          {LINKS.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-150 ${
                  isActive ? "text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
