-- CIS konnekt — права доступа для ролей anon/authenticated
--
-- Таблицы, созданные через SQL Editor (а не через Table Editor), не получают
-- автоматически права на SELECT/INSERT/... для ролей anon и authenticated —
-- RLS-политики сами по себе не дают доступ, если роли не разрешено вообще
-- обращаться к таблице на уровне Postgres. Эта команда выдаёт нужные права.
--
-- Как применить: так же, как schema.sql — весь файл целиком в SQL Editor → Run.
-- Нужно выполнить один раз, сразу после schema.sql.

grant usage on schema public to anon, authenticated;

-- Общие данные (события, организаторы, друзья, промоутеры, клики) —
-- читают и анонимные посетители, и будущие залогиненные пользователи.
grant select, insert, update, delete on public.organizers to anon, authenticated;
grant select on public.friends to anon, authenticated;
grant select, insert, update, delete on public.events to anon, authenticated;
grant select, insert, update, delete on public.promoters to anon, authenticated;
grant select, insert on public.ticket_clicks to anon, authenticated;

-- Персональные таблицы — ими начнём пользоваться с шага 3-4, но права
-- выдаём сразу, чтобы не возвращаться к этому файлу позже.
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.attendances to authenticated;
grant select, insert on public.unlocked_events to authenticated;
grant select, insert on public.bonus_history to authenticated;
