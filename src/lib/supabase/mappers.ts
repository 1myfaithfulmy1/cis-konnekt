/**
 * Supabase хранит поля в snake_case (как принято в Postgres), а приложение
 * всюду использует camelCase (см. src/types.ts) — здесь преобразование
 * строк из базы в типы приложения.
 */

import type { CisEvent, Organizer, Friend, Profile, Promoter } from "@/types";

export interface EventRow {
  id: string;
  title: string;
  organizer_id: string;
  venue: string;
  address: string;
  metro: string;
  district: string;
  day_offset: number;
  start_time: string;
  end_time: string;
  genre: CisEvent["genre"];
  lineup: string[];
  description: string;
  vibe: string[];
  face_control: boolean;
  dress_code: string;
  age_18_plus: boolean;
  price: number;
  ticket_url: string;
  is_private: boolean;
  access_code: string | null;
  friends_going_ids: string[];
  cover_image_url: string | null;
  view_count: number;
}

export function mapEventRow(row: EventRow): CisEvent {
  return {
    id: row.id,
    title: row.title,
    organizerId: row.organizer_id,
    venue: row.venue,
    address: row.address,
    metro: row.metro,
    district: row.district,
    dayOffset: row.day_offset,
    startTime: row.start_time,
    endTime: row.end_time,
    genre: row.genre,
    lineup: row.lineup,
    description: row.description,
    vibe: row.vibe,
    faceControl: row.face_control,
    dressCode: row.dress_code,
    age18Plus: row.age_18_plus,
    price: row.price,
    ticketUrl: row.ticket_url,
    isPrivate: row.is_private,
    accessCode: row.access_code ?? undefined,
    friendsGoingIds: row.friends_going_ids,
    coverImageUrl: row.cover_image_url ?? undefined,
    viewCount: row.view_count,
  };
}

/** Обратное преобразование — событие из Кабинета в строку для insert/upsert в Supabase. */
export function toEventRow(event: CisEvent): Omit<EventRow, "view_count"> {
  return {
    id: event.id,
    title: event.title,
    organizer_id: event.organizerId,
    venue: event.venue,
    address: event.address,
    metro: event.metro,
    district: event.district,
    day_offset: event.dayOffset,
    start_time: event.startTime,
    end_time: event.endTime,
    genre: event.genre,
    lineup: event.lineup,
    description: event.description,
    vibe: event.vibe,
    face_control: event.faceControl,
    dress_code: event.dressCode,
    age_18_plus: event.age18Plus,
    price: event.price,
    ticket_url: event.ticketUrl,
    is_private: event.isPrivate,
    access_code: event.accessCode ?? null,
    friends_going_ids: event.friendsGoingIds,
    cover_image_url: event.coverImageUrl ?? null,
  };
}

export interface OrganizerRow {
  id: string;
  name: string;
  owner_id: string | null;
}

export function mapOrganizerRow(row: OrganizerRow): Organizer {
  return { id: row.id, name: row.name, ownerId: row.owner_id ?? undefined };
}

export interface FriendRow {
  id: string;
  name: string;
  initials: string;
}

export function mapFriendRow(row: FriendRow): Friend {
  return { id: row.id, name: row.name, initials: row.initials };
}

export interface ProfileRow {
  id: string;
  name: string;
  nickname: string | null;
  avatar_url: string | null;
  starting_bonus: number;
  referral_used: boolean;
}

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    startingBonus: row.starting_bonus,
    referralUsed: row.referral_used,
  };
}

export interface PromoterRow {
  id: string;
  organizer_id: string;
  event_id: string;
  name: string;
  code: string;
}

export function mapPromoterRow(row: PromoterRow): Promoter {
  return { id: row.id, organizerId: row.organizer_id, eventId: row.event_id, name: row.name, code: row.code };
}
