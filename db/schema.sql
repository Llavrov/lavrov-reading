-- Личный слой читальни. Применяется к Neon один раз.
-- Публичного контента здесь нет — только приватные данные владельца.

create table if not exists reads (
  id         bigint generated always as identity primary key,
  slug       text        not null,
  read_at    timestamptz not null default now(),
  scroll_pct int         not null default 0
);
create index if not exists reads_slug_idx on reads (slug);

create table if not exists feedback (
  id         bigint generated always as identity primary key,
  slug       text        not null unique,
  rating     int         check (rating between 1 and 5),
  thoughts   text,
  updated_at timestamptz not null default now()
);

create table if not exists answers (
  id           bigint generated always as identity primary key,
  slug         text        not null,
  question_idx int         not null,
  answer       text,
  updated_at   timestamptz not null default now(),
  unique (slug, question_idx)
);

-- Связки статья↔дневник, которые пишет Claude. Приватно.
create table if not exists enrichments (
  id         bigint generated always as identity primary key,
  slug       text        not null,
  kind       text        not null,          -- 'diary-link' | 'insight' | ...
  body       text        not null,
  created_at timestamptz not null default now()
);
create index if not exists enrichments_slug_idx on enrichments (slug);

-- Фаза 3: спейсд-повторы через Telegram.
create table if not exists recall_log (
  id          bigint generated always as identity primary key,
  slug        text        not null,
  prompted_at timestamptz not null default now(),
  channel     text        not null default 'telegram',
  response    text
);
