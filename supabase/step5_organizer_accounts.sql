-- CIS konnekt — Шаг 5: организаторы привязаны к реальным аккаунтам
--
-- Как применить: как и остальные файлы — весь файл целиком в SQL Editor → Run.
--
-- Что делает:
-- 1. Добавляет events.view_count + функцию для его атомарного увеличения
--    (нужно, чтобы счётчик просмотров в Кабинете был общим, а не только
--    для того браузера, где его считали).
-- 2. Убирает временные «открытые всем» политики на organizers/events/promoters
--    (они были нужны, пока Кабинет работал без входа в аккаунт) и заменяет
--    их на политики по владельцу: писать может только хозяин организатора.
-- 3. Отзывает права на запись у анонимной роли — теперь писать может
--    только вошедший в аккаунт пользователь, и только своё.

-- ───────────────────────── Просмотры событий ─────────────────────────

alter table public.events add column view_count int not null default 0;

create or replace function public.increment_event_view(p_event_id text)
returns void
language sql
security definer set search_path = public
as $$
  update public.events set view_count = view_count + 1 where id = p_event_id;
$$;

grant execute on function public.increment_event_view(text) to anon, authenticated;

-- ───────────────────────── Организаторы: только свои ─────────────────────────

drop policy "organizers_write_all_temp" on public.organizers;

create policy "organizers_insert_own" on public.organizers
  for insert with check (auth.uid() = owner_id);

create policy "organizers_update_own" on public.organizers
  for update using (auth.uid() = owner_id);

create policy "organizers_delete_own" on public.organizers
  for delete using (auth.uid() = owner_id);

revoke insert, update, delete on public.organizers from anon;

-- ───────────────────────── События: только своего организатора ─────────────────────────

drop policy "events_write_all_temp" on public.events;

create policy "events_insert_own" on public.events
  for insert with check (
    exists (select 1 from public.organizers o where o.id = organizer_id and o.owner_id = auth.uid())
  );

create policy "events_update_own" on public.events
  for update using (
    exists (select 1 from public.organizers o where o.id = organizer_id and o.owner_id = auth.uid())
  );

create policy "events_delete_own" on public.events
  for delete using (
    exists (select 1 from public.organizers o where o.id = organizer_id and o.owner_id = auth.uid())
  );

revoke insert, update, delete on public.events from anon;

-- ───────────────────────── Промоутеры: видит и меняет только хозяин организатора ─────────────────────────

drop policy "promoters_select_all" on public.promoters;
drop policy "promoters_write_all_temp" on public.promoters;

create policy "promoters_select_own" on public.promoters
  for select using (
    exists (select 1 from public.organizers o where o.id = organizer_id and o.owner_id = auth.uid())
  );

create policy "promoters_insert_own" on public.promoters
  for insert with check (
    exists (select 1 from public.organizers o where o.id = organizer_id and o.owner_id = auth.uid())
  );

create policy "promoters_update_own" on public.promoters
  for update using (
    exists (select 1 from public.organizers o where o.id = organizer_id and o.owner_id = auth.uid())
  );

create policy "promoters_delete_own" on public.promoters
  for delete using (
    exists (select 1 from public.organizers o where o.id = organizer_id and o.owner_id = auth.uid())
  );

revoke select, insert, update, delete on public.promoters from anon;
