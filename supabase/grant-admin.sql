-- 1. Crie a conta em Authentication → Users → Add user (e-mail confirmado).
-- 2. Substitua abaixo pelo UUID dessa conta e execute no SQL Editor.
-- Administradores não podem conceder acesso pelo navegador.
insert into private.admin_users (user_id)
values ('SUBSTITUA-PELO-UUID-DO-USUARIO'::uuid)
on conflict (user_id) do nothing;
