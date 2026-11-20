import type { Friend } from "@/types";

export function formatPrice(price: number): string {
  if (price === 0) return "Бесплатно";
  return `${price.toLocaleString("ru-RU")} ₽`;
}

/**
 * "Идут Маша, Лёша и ещё 2" / "Идут Маша и Лёша" / "Идёт Маша".
 * Берём только имя (первое слово), без фамилии — так компактнее.
 */
export function formatGoingLabel(goingFriends: Friend[]): string {
  if (goingFriends.length === 0) return "";

  const firstNames = goingFriends.map((f) => f.name.split(" ")[0]);

  if (firstNames.length === 1) return `Идёт ${firstNames[0]}`;
  if (firstNames.length === 2) return `Идут ${firstNames[0]} и ${firstNames[1]}`;

  const restCount = firstNames.length - 2;
  return `Идут ${firstNames[0]}, ${firstNames[1]} и ещё ${restCount}`;
}
