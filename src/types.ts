/**
 * Общие типы данных приложения.
 * Если добавляешь новое поле в событие — сначала добавь его сюда.
 */

export type Genre =
  | "hip-hop"
  | "rap-party"
  | "techno"
  | "house"
  | "student-party"
  | "battle-jam"
  | "day-rooftop";

export interface Organizer {
  id: string;
  name: string;
}

export interface Friend {
  id: string;
  name: string; // "Имя Фамилия"
  initials: string; // для аватара-кружка, напр. "МО"
}

export interface CisEvent {
  id: string;
  title: string;
  organizerId: string;
  venue: string; // вымышленная площадка
  address: string;
  metro: string;
  district: string;
  dayOffset: number; // через сколько дней от сегодня (0 = сегодня)
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM" (может быть раньше startTime — значит заканчивается на следующий день)
  genre: Genre;
  lineup: string[];
  description: string;
  vibe: string[]; // 2–3 тега настроения
  faceControl: boolean;
  dressCode: string;
  age18Plus: boolean;
  price: number; // 0 = бесплатно
  ticketUrl: string;
  isPrivate: boolean;
  accessCode?: string; // только для закрытых событий
  friendsGoingIds: string[]; // id друзей, которые идут (стартовые данные)
  coverImageUrl?: string; // своя фотография обложки (data-URL из localStorage); нет — обложка текстовая
}

export interface DemoUser {
  name: string;
  startingBonus: number;
}
