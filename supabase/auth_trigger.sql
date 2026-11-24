-- CIS konnekt — автосоздание профиля при регистрации (Шаг 3)
--
-- Как применить: так же, как остальные файлы в этой папке — весь файл
-- целиком в SQL Editor → Run. Нужно выполнить один раз.
--
-- Что делает: как только кто-то регистрируется (email+пароль), Supabase
-- сам создаёт запись в служебной таблице auth.users — эта функция-триггер
-- сразу после этого создаёт для него запись в public.profiles (имя,
-- стартовые баллы, флаг реферального бонуса). Имя берётся из поля
-- options.data.name при вызове supabase.auth.signUp(...) на клиенте.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, starting_bonus, referral_used)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'Новый пользователь'),
    150,
    false
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
