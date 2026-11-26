-- CIS konnekt — Шаг 7: никнейм и фото профиля
--
-- Как применить: как и остальные файлы — весь файл целиком в SQL Editor → Run.
--
-- Что делает:
-- 1. Добавляет profiles.nickname и profiles.avatar_url.
-- 2. Создаёт публичный bucket "avatars" (фото профиля видно всем, как и имя)
--    с правом загружать/менять/удалять только своё фото — путь к файлу
--    всегда вида "{id пользователя}/avatar.jpg".

alter table public.profiles add column nickname text;
alter table public.profiles add column avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_select_all" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(storage.objects.name))[1] = auth.uid()::text
  );

create policy "avatars_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(storage.objects.name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(storage.objects.name))[1] = auth.uid()::text
  );
