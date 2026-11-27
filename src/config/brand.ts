/**
 * Бренд-конфиг — единственное место, где задаются название и цвета приложения.
 * Хочешь поменять название или фирменные цвета — меняй только здесь,
 * остальной код сам подхватит новые значения (через CSS-переменные в layout.tsx).
 *
 * Дизайн: «неоновая ночная жизнь» — тёмная база, неон только на акцентах
 * (кнопки, активные состояния, бейджи), а не на тексте целиком.
 */

export const brand = {
  name: "CIS konnekt",
  tagline: "Тусовки Петербурга в одном месте",

  // Тёмная тема — единственная в приложении, переключателя светлой нет.
  colors: {
    background: "#07060B", // фон приложения — почти чёрный с фиолетовым оттенком
    surface: "#120F1C", // карточки, поверхности
    surface2: "#1A1528", // поля ввода, наведённые/нажатые карточки
    border: "#2A2140", // тонкие границы

    foreground: "#F5F0FF", // основной текст
    muted: "#A79BC4", // второстепенный текст

    // accent/accent2 — исторические имена (их уже использует весь код:
    // bg-accent, text-accent-ink и т.д.), но теперь это неоновые цвета.
    accent: "#FF2E97", // главный акцент — неон-розовый
    accentInk: "#0D0A14", // тёмный текст поверх ярких неоновых поверхностей (не белый — иначе не проходит контраст)
    accent2: "#D946C8", // второй акцент — фиолетовый, сдвинутый ближе к розовому/маджента

    cyan: "#22D3EE", // холодный тон для разнообразия — используется очень редко (один жанр обложек)
  },

  // Градиент для главной кнопки (CTA) и ключевых чисел — используем как
  // background-image через arbitrary value: bg-[image:var(--gradient-sunset)]
  gradients: {
    sunset: "linear-gradient(135deg, #FF2E97 0%, #D946C8 100%)",
  },
} as const;

/**
 * Превращает цвета из brand.colors в CSS-переменные для тега <html>.
 * Благодаря этому globals.css и Tailwind ссылаются на переменные,
 * а реальные значения цветов живут только здесь, в одном файле.
 */
export function brandCssVars(): Record<string, string> {
  return {
    "--background": brand.colors.background,
    "--surface": brand.colors.surface,
    "--surface-2": brand.colors.surface2,
    "--border-color": brand.colors.border,

    "--foreground": brand.colors.foreground,
    "--muted": brand.colors.muted,

    "--accent": brand.colors.accent,
    "--accent-ink": brand.colors.accentInk,
    "--accent2": brand.colors.accent2,
    "--cyan": brand.colors.cyan,

    "--gradient-sunset": brand.gradients.sunset,
  };
}
