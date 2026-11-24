-- CIS konnekt — исправление политик Storage из step6_cover_storage.sql
--
-- Баг: в подзапросе "from public.organizers o where o.id = (storage.foldername(name))[1]"
-- Postgres брал "name" из таблицы organizers (у неё тоже есть колонка name —
-- название организатора), а не из storage.objects (путь к файлу) — поэтому
-- сравнение никогда не совпадало, и загрузка фото падала с ошибкой RLS.
-- Исправление — явно указать storage.objects.name.

drop policy "event_covers_insert_own" on storage.objects;
drop policy "event_covers_update_own" on storage.objects;
drop policy "event_covers_delete_own" on storage.objects;

create policy "event_covers_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'event-covers'
    and exists (
      select 1 from public.organizers o
      where o.id = (storage.foldername(storage.objects.name))[1]
        and o.owner_id = auth.uid()
    )
  );

create policy "event_covers_update_own" on storage.objects
  for update using (
    bucket_id = 'event-covers'
    and exists (
      select 1 from public.organizers o
      where o.id = (storage.foldername(storage.objects.name))[1]
        and o.owner_id = auth.uid()
    )
  );

create policy "event_covers_delete_own" on storage.objects
  for delete using (
    bucket_id = 'event-covers'
    and exists (
      select 1 from public.organizers o
      where o.id = (storage.foldername(storage.objects.name))[1]
        and o.owner_id = auth.uid()
    )
  );
