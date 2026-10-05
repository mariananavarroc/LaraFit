-- Ejecuta este script en Supabase despues de crear public.horarios_clases.

alter table public.horarios_clases
  add column if not exists cupo_max integer not null default 20;

update public.horarios_clases
set cupo_max = 20
where cupo_max is null;

alter table public.horarios_clases
  alter column cupo_max set default 20,
  alter column cupo_max set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'horarios_clases_cupo_max_positive'
      and conrelid = 'public.horarios_clases'::regclass
  ) then
    alter table public.horarios_clases
      add constraint horarios_clases_cupo_max_positive check (cupo_max > 0);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from public.horarios_clases) then
    insert into public.horarios_clases (bloque_horario, dia, nombre_clase, tipo, cupo_max)
    values
      ('07:10 – 08:00 am', 'Lunes', 'Trampolín', 'trampolin', 20),
      ('07:10 – 08:00 am', 'Martes', 'Mat', 'mat', 20),
      ('07:10 – 08:00 am', 'Miércoles', 'Baile Fit', 'baile', 20),
      ('07:10 – 08:00 am', 'Jueves', 'Fuerza', 'fuerza', 20),
      ('07:10 – 08:00 am', 'Viernes', 'Trampolín', 'trampolin', 20),
      ('08:10 – 09:00 am', 'Lunes', 'Trampolín', 'trampolin', 20),
      ('08:10 – 09:00 am', 'Martes', 'Trampolín', 'trampolin', 20),
      ('08:10 – 09:00 am', 'Miércoles', 'Trampolín', 'trampolin', 20),
      ('08:10 – 09:00 am', 'Jueves', 'Trampolín', 'trampolin', 20),
      ('08:10 – 09:00 am', 'Viernes', 'Trampolín', 'trampolin', 20),
      ('05:00 – 06:00 pm', 'Lunes', 'Mat', 'mat', 20),
      ('05:00 – 06:00 pm', 'Martes', 'Trampolín', 'trampolin', 20),
      ('05:00 – 06:00 pm', 'Miércoles', 'Fuerza', 'fuerza', 20),
      ('05:00 – 06:00 pm', 'Jueves', 'Mat', 'mat', 20),
      ('05:00 – 06:00 pm', 'Viernes', 'Clase Especial', 'especial', 20),
      ('06:00 – 07:00 pm', 'Lunes', 'Mat', 'mat', 20),
      ('06:00 – 07:00 pm', 'Martes', 'Fuerza', 'fuerza', 20),
      ('06:00 – 07:00 pm', 'Miércoles', 'Fuerza', 'fuerza', 20),
      ('06:00 – 07:00 pm', 'Jueves', 'Trampolín', 'trampolin', 20),
      ('07:00 – 08:00 pm', 'Lunes', 'Mat', 'mat', 20),
      ('07:00 – 08:00 pm', 'Martes', 'Baile Fit', 'baile', 20),
      ('07:00 – 08:00 pm', 'Miércoles', 'Fuerza', 'fuerza', 20),
      ('07:00 – 08:00 pm', 'Jueves', 'Baile Fit', 'baile', 20),
      ('08:00 – 09:00 pm', 'Lunes', 'Trampolín', 'trampolin', 20),
      ('08:00 – 09:00 pm', 'Martes', 'Trampolín', 'trampolin', 20),
      ('08:00 – 09:00 pm', 'Miércoles', 'Trampolín', 'trampolin', 20),
      ('08:00 – 09:00 pm', 'Jueves', 'Trampolín', 'trampolin', 20);
  end if;
end $$;

create table if not exists public.reservas_clases (
  id_reserva uuid primary key default gen_random_uuid(),
  id_alumna uuid not null references auth.users(id) on delete cascade,
  id_horario_clase bigint not null references public.horarios_clases(id) on delete cascade,
  fecha_clase date not null,
  estado text not null default 'reservada' check (estado in ('reservada', 'cancelada')),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create index if not exists idx_reservas_clases_slot_date
  on public.reservas_clases (id_horario_clase, fecha_clase)
  where estado = 'reservada';

create unique index if not exists idx_reservas_clases_active_student
  on public.reservas_clases (id_alumna, id_horario_clase, fecha_clase)
  where estado = 'reservada';

alter table public.reservas_clases enable row level security;

revoke all on public.reservas_clases from anon, authenticated;
grant select on public.reservas_clases to authenticated;

drop policy if exists reservas_clases_select_own on public.reservas_clases;
create policy reservas_clases_select_own
  on public.reservas_clases
  for select
  to authenticated
  using (id_alumna = auth.uid());

create or replace function public.listar_clases_disponibles(p_fecha date)
returns table (
  id_horario_clase bigint,
  bloque_horario text,
  dia text,
  nombre_clase text,
  cupo_max integer,
  cupos_ocupados integer,
  cupos_disponibles integer,
  id_reserva uuid
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion para consultar las clases.';
  end if;
  if p_fecha is null then
    raise exception 'Selecciona una fecha para consultar las clases.';
  end if;

  return query
  select
    hc.id,
    hc.bloque_horario,
    hc.dia,
    hc.nombre_clase,
    hc.cupo_max,
    count(rc.id_reserva)::integer,
    greatest(hc.cupo_max - count(rc.id_reserva)::integer, 0),
    (
      select mine.id_reserva
      from public.reservas_clases mine
      where mine.id_alumna = auth.uid()
        and mine.id_horario_clase = hc.id
        and mine.fecha_clase = p_fecha
        and mine.estado = 'reservada'
      limit 1
    )
  from public.horarios_clases hc
  left join public.reservas_clases rc
    on rc.id_horario_clase = hc.id
    and rc.fecha_clase = p_fecha
    and rc.estado = 'reservada'
  where hc.nombre_clase is not null
    and coalesce(hc.tipo, '') <> 'empty'
    and translate(lower(trim(coalesce(hc.dia, ''))), 'áéíóúü', 'aeiouu') = any (
      case extract(isodow from p_fecha)::integer
        when 1 then array['lunes', 'lun', 'monday', 'mon']::text[]
        when 2 then array['martes', 'mar', 'tuesday', 'tue']::text[]
        when 3 then array['miercoles', 'mie', 'wednesday', 'wed']::text[]
        when 4 then array['jueves', 'jue', 'thursday', 'thu']::text[]
        when 5 then array['viernes', 'vie', 'friday', 'fri']::text[]
        when 6 then array['sabado', 'sab', 'saturday', 'sat']::text[]
        else array['domingo', 'dom', 'sunday', 'sun']::text[]
      end
    )
  group by hc.id, hc.bloque_horario, hc.dia, hc.nombre_clase, hc.cupo_max
  order by hc.bloque_horario, hc.nombre_clase;
end;
$$;

create or replace function public.reservar_clase(
  p_id_horario_clase bigint,
  p_fecha date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cupo_max integer;
  v_dia text;
  v_tipo text;
  v_nombre_clase text;
  v_cupos_ocupados integer;
  v_id_reserva uuid;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion para reservar una clase.';
  end if;
  if p_fecha is null then
    raise exception 'Selecciona una fecha para reservar la clase.';
  end if;
  if p_fecha < current_date then
    raise exception 'No puedes reservar una clase en una fecha pasada.';
  end if;

  select hc.cupo_max, hc.dia, hc.tipo, hc.nombre_clase
  into v_cupo_max, v_dia, v_tipo, v_nombre_clase
  from public.horarios_clases hc
  where hc.id = p_id_horario_clase
  for update;

  if not found or v_nombre_clase is null or coalesce(v_tipo, '') = 'empty' then
    raise exception 'La clase seleccionada ya no esta disponible.';
  end if;

  if translate(lower(trim(coalesce(v_dia, ''))), 'áéíóúü', 'aeiouu') <> all (
    case extract(isodow from p_fecha)::integer
      when 1 then array['lunes', 'lun', 'monday', 'mon']::text[]
      when 2 then array['martes', 'mar', 'tuesday', 'tue']::text[]
      when 3 then array['miercoles', 'mie', 'wednesday', 'wed']::text[]
      when 4 then array['jueves', 'jue', 'thursday', 'thu']::text[]
      when 5 then array['viernes', 'vie', 'friday', 'fri']::text[]
      when 6 then array['sabado', 'sab', 'saturday', 'sat']::text[]
      else array['domingo', 'dom', 'sunday', 'sun']::text[]
    end
  ) then
    raise exception 'La clase seleccionada no corresponde al dia indicado.';
  end if;

  if exists (
    select 1
    from public.reservas_clases rc
    where rc.id_alumna = auth.uid()
      and rc.id_horario_clase = p_id_horario_clase
      and rc.fecha_clase = p_fecha
      and rc.estado = 'reservada'
  ) then
    raise exception 'Ya tienes una reservacion para esta clase.';
  end if;

  select count(*)::integer
  into v_cupos_ocupados
  from public.reservas_clases rc
  where rc.id_horario_clase = p_id_horario_clase
    and rc.fecha_clase = p_fecha
    and rc.estado = 'reservada';

  if v_cupos_ocupados >= v_cupo_max then
    raise exception 'La clase ya no tiene cupos disponibles.';
  end if;

  insert into public.reservas_clases (id_alumna, id_horario_clase, fecha_clase)
  values (auth.uid(), p_id_horario_clase, p_fecha)
  returning id_reserva into v_id_reserva;

  return v_id_reserva;
end;
$$;

create or replace function public.cancelar_reserva_clase(p_id_reserva uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion para cancelar una reservacion.';
  end if;

  update public.reservas_clases
  set estado = 'cancelada',
      cancelled_at = now()
  where id_reserva = p_id_reserva
    and id_alumna = auth.uid()
    and estado = 'reservada';

  if not found then
    raise exception 'No se encontro una reservacion activa que puedas cancelar.';
  end if;
end;
$$;

revoke all on function public.listar_clases_disponibles(date) from public, anon;
revoke all on function public.reservar_clase(bigint, date) from public, anon;
revoke all on function public.cancelar_reserva_clase(uuid) from public, anon;
grant execute on function public.listar_clases_disponibles(date) to authenticated;
grant execute on function public.reservar_clase(bigint, date) to authenticated;
grant execute on function public.cancelar_reserva_clase(uuid) to authenticated;
