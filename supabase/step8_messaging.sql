-- CIS konnekt — Шаг 8: никнейм обязателен + личные сообщения
--
-- Как применить: как и остальные файлы — весь файл целиком в SQL Editor → Run.
--
-- Что делает:
-- 1. Никнейм становится уникальным (без учёта регистра) — по нему теперь
--    ищут пользователей, как @username в Telegram. Регистрация без
--    никнейма проверяется на стороне приложения; эта проверка в базе —
--    подстраховка на случай, если два человека одновременно займут
--    одинаковый никнейм.
-- 2. Профили (имя, никнейм, фото) теперь видны вообще всем на чтение —
--    нужно и для поиска собеседника, и для проверки "свободен ли никнейм"
--    прямо на экране регистрации (где пользователь ещё не вошёл в аккаунт).
--    Раньше каждый видел только свой профиль.
-- 3. Таблица messages — личные сообщения между двумя пользователями,
--    видимые только отправителю и получателю, с включённым realtime
--    (новые сообщения приходят сразу, без обновления страницы).

create unique index profiles_nickname_unique_idx on public.profiles (lower(nickname));

create policy "profiles_select_all" on public.profiles
  for select using (true);

grant select on public.profiles to anon;

-- Регистрация теперь требует никнейм — обновляем функцию-триггер,
-- чтобы она сохраняла его из data.nickname (см. supabase/auth_trigger.sql).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, nickname, starting_bonus, referral_used)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'Новый пользователь'),
    new.raw_user_meta_data ->> 'nickname',
    150,
    false
  );
  return new;
end;
$$;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "messages_select_own" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "messages_insert_own" on public.messages
  for insert with check (auth.uid() = sender_id);

grant select, insert on public.messages to authenticated;

alter publication supabase_realtime add table public.messages;
