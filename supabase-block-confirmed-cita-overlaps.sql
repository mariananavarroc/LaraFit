-- Ejecuta en Supabase → SQL Editor para bloquear choques de citas confirmadas.
-- Regla: no puede existir más de una cita con estado "confirmada" en el mismo minuto.

create or replace function public.prevent_confirmed_cita_overlap()
returns trigger
language plpgsql
as $$
begin
  if lower(coalesce(new.estado, '')) = 'confirmada' then
    if exists (
      select 1
      from public.citas c
      where date_trunc('minute', c.fecha_hora) = date_trunc('minute', new.fecha_hora)
        and lower(coalesce(c.estado, '')) = 'confirmada'
        and c.id_cita <> new.id_cita
    ) then
      raise exception 'Ya existe una cita confirmada en ese horario.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_confirmed_cita_overlap on public.citas;

create trigger trg_prevent_confirmed_cita_overlap
before insert or update of fecha_hora, estado on public.citas
for each row
execute function public.prevent_confirmed_cita_overlap();

create unique index if not exists uq_citas_confirmada_minuto
on public.citas ((date_trunc('minute', fecha_hora)))
where lower(estado) = 'confirmada';
