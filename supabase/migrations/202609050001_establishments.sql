-- Executar no SQL Editor do projeto Onde Ir. Não contém credenciais nem dados fictícios.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table private.admin_users enable row level security;
revoke all on private.admin_users from public, anon, authenticated;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from private.admin_users where user_id = (select auth.uid())); $$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.establishments (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category text not null check (category in ('Gastronomia','Cafés','Bares','Compras','Hospedagem','Passeios','Experiências','Serviços','Eventos')),
  subcategory text not null default '',
  short_description text not null default '' check (length(short_description) <= 220),
  description text not null default '',
  logo text not null default '', cover_image text not null default '',
  gallery jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery) = 'array' and jsonb_array_length(gallery) <= 8),
  phone text not null default '', whatsapp text not null default '',
  address text not null default '', number text not null default '', neighborhood text not null default '',
  city text not null default 'Poços de Caldas', state text not null default 'MG', zip_code text not null default '',
  maps_url text not null default '' check (maps_url = '' or maps_url ~ '^https?://'),
  instagram text not null default '' check (instagram = '' or instagram ~ '^https?://'),
  website text not null default '' check (website = '' or website ~ '^https?://'),
  opening_hours jsonb not null default '[]'::jsonb check (jsonb_typeof(opening_hours) = 'array'),
  price_range text not null default '', badge text not null default '',
  placement_type text not null default 'standard' check (placement_type in ('standard','featured','premium')),
  display_order integer not null default 1 check (display_order >= 0),
  is_active boolean not null default true,
  start_date date, end_date date,
  is_mock boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint campaign_dates_valid check (start_date is null or end_date is null or start_date <= end_date)
);
create index if not exists establishments_public_order on public.establishments (display_order, id) where is_active and not is_mock;
create index if not exists establishments_end_date on public.establishments (end_date) where is_active;

create or replace function private.touch_establishment()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  if tg_op = 'UPDATE' then new.created_at = old.created_at; new.id = old.id; end if;
  return new;
end; $$;
drop trigger if exists establishments_updated_at on public.establishments;
create trigger establishments_updated_at before update on public.establishments
for each row execute function private.touch_establishment();

alter table public.establishments enable row level security;
revoke all on public.establishments from public, anon, authenticated;
grant select on public.establishments to anon;
grant select, insert, update, delete on public.establishments to authenticated;
drop policy if exists establishments_public_read on public.establishments;
create policy establishments_public_read on public.establishments for select to anon, authenticated using (
  is_active and not is_mock
  and (start_date is null or start_date <= (now() at time zone 'America/Sao_Paulo')::date)
  and (end_date is null or end_date >= (now() at time zone 'America/Sao_Paulo')::date)
);
drop policy if exists establishments_admin_read on public.establishments;
create policy establishments_admin_read on public.establishments for select to authenticated using ((select public.is_admin()));
drop policy if exists establishments_admin_insert on public.establishments;
create policy establishments_admin_insert on public.establishments for insert to authenticated with check ((select public.is_admin()));
drop policy if exists establishments_admin_update on public.establishments;
create policy establishments_admin_update on public.establishments for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists establishments_admin_delete on public.establishments;
create policy establishments_admin_delete on public.establishments for delete to authenticated using ((select public.is_admin()));

-- Imagens da vitrine são públicas. Somente administradores podem enviar/remover/listar.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('establishment-media', 'establishment-media', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists establishment_media_admin_select on storage.objects;
create policy establishment_media_admin_select on storage.objects for select to authenticated using (bucket_id = 'establishment-media' and (select public.is_admin()));
drop policy if exists establishment_media_admin_insert on storage.objects;
create policy establishment_media_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'establishment-media' and (select public.is_admin()));
drop policy if exists establishment_media_admin_delete on storage.objects;
create policy establishment_media_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'establishment-media' and (select public.is_admin()));

commit;
