alter table public.pedidos_web
add column if not exists pedido_numero bigint;

create sequence if not exists public.pedidos_web_pedido_numero_seq;

alter sequence public.pedidos_web_pedido_numero_seq
owned by public.pedidos_web.pedido_numero;

alter table public.pedidos_web
alter column pedido_numero set default nextval('public.pedidos_web_pedido_numero_seq');

update public.pedidos_web
set pedido_numero = nextval('public.pedidos_web_pedido_numero_seq')
where pedido_numero is null;

alter table public.pedidos_web
alter column pedido_numero set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pedidos_web_pedido_numero_key'
  ) then
    alter table public.pedidos_web
    add constraint pedidos_web_pedido_numero_key unique (pedido_numero);
  end if;
end $$;