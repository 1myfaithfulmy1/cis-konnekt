-- CIS konnekt — Шаг 4: персональные данные переезжают в базу
--
-- Как применить: как и остальные файлы — весь файл целиком в SQL Editor → Run.
--
-- Что делает:
-- 1. Добавляет bonus_history.event_id — чтобы можно было проверить,
--    получил ли этот пользователь уже бонус за клик «Купить билет» по
--    конкретному событию (раньше это флаг clickedTicketEventIds в localStorage).
-- 2. Добавляет политики и права на удаление своих же строк в
--    unlocked_events и bonus_history — это нужно кнопке
--    «Сбросить демо-данные» в профиле.

alter table public.bonus_history
  add column event_id text references public.events(id) on delete set null;

create policy "unlocked_events_delete_own" on public.unlocked_events
  for delete using (auth.uid() = user_id);

grant delete on public.unlocked_events to authenticated;

create policy "bonus_history_delete_own" on public.bonus_history
  for delete using (auth.uid() = user_id);

grant delete on public.bonus_history to authenticated;
