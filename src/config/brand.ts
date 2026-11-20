/**
 * Бренд-конфиг — единственное место, где задаются название и цвета приложения.
 * Хочешь поменять название или фирменные цвета — меняй только здесь,
 * остальной код сам подхватит новые значения (через CSS-переменные в layout.tsx).
 */

export const brand = {
  name: "CIS konnekt",
  tagline: "Тусовки Петербурга в одном месте",

  // Тёмная тема — единственная в приложении, переключателя светлой нет.
  colors: {
    background: "#14111C", // фон приложения
    surface: "#211D2B", // карточки, поверхности
    border: "#2E2939", // тонкие границы

    foreground: "#F4F1EA", // основной текст
    muted: "#BDB8CC", // второстепенный текст

    accent: "#C6FF3D", // главный акцент — кислотный лайм
    accentInk: "#14111C", // текст поверх лаймового фона
    accent2: "#5B3DF5", // второй акцент — фиолетовый
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
    "--border-color": brand.colors.border,
    "--foreground": brand.colors.foreground,
    "--muted": brand.colors.muted,
    "--accent": brand.colors.accent,
    "--accent-ink": brand.colors.accentInk,
    "--accent2": brand.colors.accent2,
  };
}
