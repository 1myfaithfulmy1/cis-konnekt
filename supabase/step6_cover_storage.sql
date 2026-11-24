-- CIS konnekt — Шаг 6: фото обложки переезжают в Supabase Storage
--
-- Как применить: как и остальные файлы — весь файл целиком в SQL Editor → Run.
--
-- Что делает: создаёт публичный bucket "event-covers" (фото обложек видны
-- всем, как и сами события) и права на запись — загрузить/заменить/удалить
-- фото может только хозяин того организатора, которому принадлежит папка
-- в пути файла (путь всегда вида "{id организатора}/{id события}.jpg").
--
-- До этого шага обложки хранились как длинные base64-строки прямо в
-- колонке events.cover_image_url — теперь там просто короткая ссылка на
-- файл в Storage. Старые base64-обложки (если есть) продолжат работать
-- как обычные <img src>, просто новые фото будут загружаться иначе.

insert into storage.buckets (id, name, public)
values ('event-covers', 'event-covers', true)
on conflict (id) do nothing;

create policy "event_covers_select_all" on storage.objects
  for select using (bucket_id = 'event-covers');

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
