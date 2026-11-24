-- CIS konnekt — схема базы данных (Шаг 2)
--
-- Как применить:
-- 1. Открой свой проект на supabase.com → раздел "SQL Editor".
-- 2. Создай новый запрос, вставь содержимое этого файла целиком.
-- 3. Нажми "Run".
--
-- Таблицы organizers/events/friends уже наполняются стартовыми демо-данными
-- (ровно тем, что сейчас лежит в src/data/seed.ts) — после выполнения этого
-- файла в базе будет полный рабочий набор данных для ленты.
--
-- Персональные таблицы (profiles/attendances/unlocked_events/bonus_history)
-- защищены по-настоящему (только свой user_id) — ими начнём пользоваться
-- на шаге 3-4, когда появится вход по аккаунту. Таблицы organizers/events/
-- promoters пока открыты на запись всем (RLS включён, но политика «true») —
-- это нужно, чтобы Кабинет продолжал работать без логина; ужесточим на
-- шаге 5, когда организаторов привяжем к реальным аккаунтам.

-- ───────────────────────── ОРГАНИЗАТОРЫ ─────────────────────────

create table public.organizers (
  id text primary key,
  name text not null,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.organizers enable row level security;

create policy "organizers_select_all" on public.organizers
  for select using (true);

create policy "organizers_write_all_temp" on public.organizers
  for all using (true) with check (true);

-- ───────────────────────── ДРУЗЬЯ (демо) ─────────────────────────

create table public.friends (
  id text primary key,
  name text not null,
  initials text not null
);

alter table public.friends enable row level security;

create policy "friends_select_all" on public.friends
  for select using (true);

-- ───────────────────────── СОБЫТИЯ ─────────────────────────

create table public.events (
  id text primary key,
  title text not null,
  organizer_id text not null references public.organizers(id) on delete cascade,
  venue text not null,
  address text not null,
  metro text not null,
  district text not null,
  day_offset int not null,
  start_time text not null,
  end_time text not null,
  genre text not null,
  lineup text[] not null default '{}',
  description text not null,
  vibe text[] not null default '{}',
  face_control boolean not null default false,
  dress_code text not null default '',
  age_18_plus boolean not null default true,
  price int not null default 0,
  ticket_url text not null default '',
  is_private boolean not null default false,
  access_code text,
  friends_going_ids text[] not null default '{}',
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "events_select_all" on public.events
  for select using (true);

create policy "events_write_all_temp" on public.events
  for all using (true) with check (true);

-- ───────────────────────── ПРОМОУТЕРЫ ─────────────────────────

create table public.promoters (
  id uuid primary key default gen_random_uuid(),
  organizer_id text not null references public.organizers(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);

alter table public.promoters enable row level security;

create policy "promoters_select_all" on public.promoters
  for select using (true);

create policy "promoters_write_all_temp" on public.promoters
  for all using (true) with check (true);

-- ───────────────────────── КЛИКИ «КУПИТЬ БИЛЕТ» ─────────────────────────

create table public.ticket_clicks (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  promo_code text,
  created_at timestamptz not null default now()
);

alter table public.ticket_clicks enable row level security;

create policy "ticket_clicks_select_all" on public.ticket_clicks
  for select using (true);

create policy "ticket_clicks_insert_all" on public.ticket_clicks
  for insert with check (true);

-- ───────────────────────── ПРОФИЛИ (с шага 3) ─────────────────────────

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  starting_bonus int not null default 0,
  referral_used boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ───────────────────────── «ИДУ» (с шага 4) ─────────────────────────

create table public.attendances (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table public.attendances enable row level security;

create policy "attendances_select_own" on public.attendances
  for select using (auth.uid() = user_id);

create policy "attendances_insert_own" on public.attendances
  for insert with check (auth.uid() = user_id);

create policy "attendances_delete_own" on public.attendances
  for delete using (auth.uid() = user_id);

-- ───────────────────────── ОТКРЫТЫЕ ПО КОДУ СОБЫТИЯ (с шага 4) ─────────────────────────

create table public.unlocked_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table public.unlocked_events enable row level security;

create policy "unlocked_events_select_own" on public.unlocked_events
  for select using (auth.uid() = user_id);

create policy "unlocked_events_insert_own" on public.unlocked_events
  for insert with check (auth.uid() = user_id);

-- ───────────────────────── ИСТОРИЯ БАЛЛОВ (с шага 4) ─────────────────────────

create table public.bonus_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.bonus_history enable row level security;

create policy "bonus_history_select_own" on public.bonus_history
  for select using (auth.uid() = user_id);

create policy "bonus_history_insert_own" on public.bonus_history
  for insert with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- СТАРТОВЫЕ ДАННЫЕ (то же самое, что сейчас в src/data/seed.ts)
-- ═══════════════════════════════════════════════════════════════

insert into public.organizers (id, name) values
  ('org-cherdak', 'Чердак Промо'),
  ('org-noch', 'NOCH Collective'),
  ('org-beliy-shum', 'Белый Шум'),
  ('org-klub-tseh', 'Клубный Цех'),
  ('org-polyn', 'Полынь Promo');

insert into public.friends (id, name, initials) values
  ('f-masha', 'Маша Орлова', 'МО'),
  ('f-lesha', 'Лёша Крылов', 'ЛК'),
  ('f-sonya', 'Соня Реут', 'СР'),
  ('f-dima', 'Дима Волков', 'ДВ'),
  ('f-ira', 'Ира Снегова', 'ИС'),
  ('f-pasha', 'Паша Лис', 'ПЛ'),
  ('f-katya', 'Катя Шум', 'КШ'),
  ('f-tema', 'Тёма Градов', 'ТГ'),
  ('f-nastya', 'Настя Полынь', 'НП');

insert into public.events (
  id, title, organizer_id, venue, address, metro, district, day_offset,
  start_time, end_time, genre, lineup, description, vibe, face_control,
  dress_code, age_18_plus, price, ticket_url, is_private, access_code,
  friends_going_ids
) values
  ('e1', 'Полуночный хип-хоп джем', 'org-cherdak', 'Чердак Нева', 'наб. Обводного канала, 14', 'Площадь Восстания', 'Центр', 0,
   '22:00', '03:00', 'hip-hop', array['MC ПУЛЬС','DJ ОРБИТА'],
   'Открытый джем для тех, кто живёт хип-хопом. Фристайл-зона, живые биты и тёплая атмосфера без понтов.',
   array['тёмный','дерзкий'], false, 'Свободный', true, 500, 'https://example.com/tickets/e1', false, null,
   array['f-masha','f-lesha','f-pasha']),

  ('e2', 'Рэп пятница: новые треки', 'org-noch', 'Станция Юг', 'Московский пр., 183', 'Московская', 'Московский', 0,
   '23:00', '05:00', 'rap-party', array['Братья Шум','ЮНА ДЕП'],
   'Премьеры новых треков от местных авторов и давно любимые хиты. Звук громкий, настроение — ещё громче.',
   array['энергичный','дерзкий'], true, 'Без спортивной одежды', true, 700, 'https://example.com/tickets/e2', false, null,
   array['f-sonya','f-dima']),

  ('e3', 'Студенческая пятница', 'org-klub-tseh', 'Дом Культуры Север', 'Политехническая ул., 22', 'Лесная', 'Выборгский', 0,
   '21:00', '02:00', 'student-party', array['DJ ПРИМ','Нова Соль'],
   'Бесплатный вход для первых 100 человек по списку курса. Для остальных — символическая цена и дружелюбный вайб.',
   array['дружелюбный','лёгкий'], false, 'Свободный', true, 300, 'https://example.com/tickets/e3', false, null,
   array['f-ira','f-pasha','f-katya','f-tema']),

  ('e4', 'Техно на заводе', 'org-beliy-shum', 'Завод Ритм', 'ш. Революции, 35', 'Елизаровская', 'Невский', 1,
   '23:30', '06:00', 'techno', array['КИРА НОВА','DJ ВОЛНА','DJ ТЕНЬ'],
   'Индустриальное пространство, тяжёлый бас и долгие сеты без пауз. Для тех, кто готов танцевать до утра.',
   array['подпольный','интенсивный'], true, 'Тёмные тона приветствуются', true, 900, 'https://example.com/tickets/e4', false, null,
   array['f-masha','f-nastya']),

  ('e5', 'Хаус вечер на крыше', 'org-klub-tseh', 'Крыша Атлант', 'Большой пр. П.С., 18', 'Петроградская', 'Петроградка', 1,
   '20:00', '01:00', 'house', array['Soft Prize','Нежный Грув'],
   'Закат, лёгкий хаус и вид на город. Идеально, чтобы начать вечер спокойно и плавно разогнаться к ночи.',
   array['лёгкий','атмосферный'], false, 'Свободный, без кепок', true, 600, 'https://example.com/tickets/e5', false, null,
   array['f-lesha','f-sonya','f-ira']),

  ('e6', 'Баттл эмси: открытый микрофон', 'org-cherdak', 'Подвал Ворон', '6-я линия В.О., 9', 'Василеостровская', 'Васильевский', 2,
   '19:00', '23:00', 'battle-jam', array['MC ЛУЧ','Эхо Крым','Нуар'],
   'Баттлы один на один, судьи из зала и открытый микрофон после основной программы. Можно просто посмотреть.',
   array['энергичный','камерный'], false, 'Свободный', true, 400, 'https://example.com/tickets/e6', false, null,
   array['f-dima']),

  ('e7', 'Дневной руфтоп-чилл', 'org-polyn', 'Терраса Горизонт', 'Невский пр., 104', 'Невский проспект', 'Центр', 2,
   '14:00', '20:00', 'day-rooftop', array['DJ АРКА','Полынь Band'],
   'Дневная тусовка без спешки: шезлонги, лёгкая музыка и разговоры допоздна. Хорошо зайти и после обеда, и к вечеру.',
   array['дневной','летний','лёгкий'], false, 'Лёгкий летний', true, 800, 'https://example.com/tickets/e7', false, null,
   array['f-pasha','f-katya']),

  ('e8', 'Закрытый техно-рейв', 'org-noch', 'Бункер Арка', 'Благодатная ул., 45', 'Электросила', 'Московский', 3,
   '23:00', '06:00', 'techno', array['DJ СЕВЕР','Нулевой Градус'],
   'Закрытая вечеринка без афиш и постов в сторис. Место держится в секрете до получения кода.',
   array['тёмный','таинственный','интенсивный'], true, 'Строго чёрное', true, 1500, 'https://example.com/tickets/e8', true, 'RAVE08',
   array['f-masha','f-lesha','f-sonya','f-dima','f-ira']),

  ('e9', 'Хаус на барже', 'org-polyn', 'Баржа Полынь', 'наб. Макарова, 10', 'Приморская', 'Васильевский', 4,
   '22:00', '04:00', 'house', array['Сухой Лёд','Soft Prize'],
   'Танцпол прямо на воде, вид на залив и мягкий хаус до рассвета. Берите тёплую куртку — на палубе свежо.',
   array['атмосферный','уютный'], false, 'Свободный', true, 650, 'https://example.com/tickets/e9', false, null,
   array['f-tema','f-nastya']),

  ('e10', 'Рэп-баттл сезона', 'org-beliy-shum', 'Ангар 14', 'пр. Обуховской Обороны, 70', 'Ломоносовская', 'Невский', 5,
   '18:00', '22:00', 'battle-jam', array['MC ЛУЧ','Братья Шум','Эхо Крым'],
   'Финал сезона баттлов: четыре пары, зрительское голосование и приз зрительских симпатий.',
   array['масштабный','энергичный'], false, 'Свободный', true, 500, 'https://example.com/tickets/e10', false, null,
   array['f-lesha','f-dima','f-pasha','f-tema']),

  ('e11', 'Студенческий интенсив', 'org-klub-tseh', 'Лофт Паркет', 'Выборгское ш., 15', 'Выборгская', 'Выборгский', 6,
   '20:00', '00:00', 'student-party', array['DJ ПРИМ','Ночной Эскиз'],
   'Бесплатный вход для всех. Фотозона, настольные игры в первой половине вечера и танцы — во второй.',
   array['дружелюбный','масштабный'], false, 'Свободный', true, 0, 'https://example.com/tickets/e11', false, null,
   array['f-masha','f-sonya','f-ira','f-katya','f-nastya']),

  ('e12', 'Тайная вечеринка Норд', 'org-noch', 'Склад №3', 'Большая Пушкарская ул., 5', 'Чкаловская', 'Петроградка', 6,
   '23:30', '05:00', 'hip-hop', array['MC ПУЛЬС','Нуар'],
   'Закрытая хип-хоп вечеринка для своих. Адрес склада узнаешь после ввода кода.',
   array['таинственный','дерзкий'], true, 'Тёмные тона', true, 1000, 'https://example.com/tickets/e12', true, 'SVOI777',
   array['f-pasha']),

  ('e13', 'Закрытый дневной руфтоп', 'org-polyn', 'Веранда Облако', 'Разъезжая ул., 12', 'Достоевская', 'Центр', 8,
   '13:00', '19:00', 'day-rooftop', array['Полынь Band','DJ АРКА'],
   'Камерная дневная тусовка по приглашениям — тихая терраса, минимум людей, максимум атмосферы.',
   array['дневной','камерный','таинственный'], true, 'Свободный', true, 400, 'https://example.com/tickets/e13', true, 'SOLNCE',
   array[]::text[]);
