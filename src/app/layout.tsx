import type { Metadata, Viewport } from "next";
import { Unbounded, Inter } from "next/font/google";
import "./globals.css";
import { brand, brandCssVars } from "@/config/brand";
import { BottomTabBar } from "@/components/BottomTabBar";
import { TopNav } from "@/components/TopNav";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["cyrillic", "latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["cyrillic", "latin"],
});

export const metadata: Metadata = {
  title: brand.name,
  description: brand.tagline,
};

export const viewport: Viewport = {
  themeColor: brand.colors.background,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${unbounded.variable} ${inter.variable}`}
      style={brandCssVars()}
    >
      <body className="bg-background font-sans antialiased">
        {/*
          На телефоне — колонка высотой в экран, листается только main, вкладки внизу.
          От md и шире — обычная страница: меню прилипает сверху, тело страницы
          скроллится целиком, а максимальную ширину содержимого каждая страница
          задаёт сама (лента — широкая сетка, остальные — узкая читаемая колонка).
        */}
        <div className="flex h-dvh flex-col md:h-auto md:min-h-dvh">
          <TopNav />
          <main className="flex-1 overflow-y-auto md:flex-none md:overflow-visible">
            <div className="mx-auto w-full max-w-[480px] md:max-w-none">{children}</div>
          </main>
          <BottomTabBar />
        </div>
      </body>
    </html>
  );
}
