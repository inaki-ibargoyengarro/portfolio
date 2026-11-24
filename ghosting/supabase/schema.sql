-- =====================================================================
-- GHOSTING DETECTOR™ · EPISODIO 02 · ¿POR QUÉ GHOSTEAMOS?
-- Esquema de base de datos para Supabase (PostgreSQL 15+)
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pegar TODO → Run.
-- Es idempotente: se puede volver a ejecutar sin perder respuestas.
--
-- Principios de seguridad:
--   · El público (rol anon) NO puede leer, modificar ni borrar la tabla.
--   · El público solo puede: 1) enviar una respuesta mediante la función
--     submit_response (que valida todo) y 2) leer estadísticas agregadas
--     mediante get_public_stats (que oculta grupos pequeños).
--   · Solo usuarios listados en public.admins pueden leer filas, marcar
--     respuestas como inválidas/prueba, importar y borrar datos de prueba.
--   · Las respuestas no guardan IP. El control de spam usa un hash con sal
--     secreta en una tabla privada separada, que se puede vaciar.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Esquema privado (no expuesto por la API) para sal y rate limit
-- ---------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_secrets (
  id int primary key default 1 check (id = 1),
  ip_salt text not null default (gen_random_uuid()::text || gen_random_uuid()::text)
);
insert into private.app_secrets (id) values (1) on conflict (id) do nothing;

create table if not exists private.rate_limits (
  ip_hash text not null,
  bucket timestamptz not null,           -- inicio de la ventana de 1 hora
  hits int not null default 0,
  primary key (ip_hash, bucket)
);

-- ---------------------------------------------------------------------
-- 1. Administradores
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- 2. Configuración del estudio (una sola fila)
-- ---------------------------------------------------------------------
create table if not exists public.study_settings (
  id int primary key default 1 check (id = 1),
  collecting boolean not null default true,      -- false = cierra la recolección web
  cutoff_at timestamptz,                         -- fecha de corte de la muestra del TP
  min_public_n int not null default 10 check (min_public_n between 1 and 1000),
  min_cell int not null default 5 check (min_cell between 1 and 100),
  updated_at timestamptz not null default now()
);
insert into public.study_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 3. Respuestas
-- ---------------------------------------------------------------------
create table if not exists public.responses (
  id bigint generated always as identity primary key,
  submission_id uuid not null unique,            -- evita duplicados accidentales
  created_at timestamptz not null default now(),
  is_test boolean not null default false,        -- datos de prueba separados
  source text not null default 'web' check (source in ('web', 'import')),
  import_batch text check (char_length(import_batch) <= 80),
  consent boolean not null check (consent),

  -- Filtros de participación
  eligible boolean not null,
  screen_out_reason text check (screen_out_reason in ('edad', 'residencia', 'uso_apps', 'sin_finalizacion')),
  age_group text check (age_group in ('18_24', '25_29', '30_35', 'menor_18', 'mayor_35')),
  urban boolean,
  uses_apps boolean,
  ended_recently boolean,                        -- en desuso (ya no se pregunta)

  -- X: incomodidad ante la confrontación (4 ítems Likert 1–5)
  x1 smallint check (x1 between 1 and 5),
  x2 smallint check (x2 between 1 and 5),
  x3 smallint check (x3 between 1 and 5),
  x4 smallint check (x4 between 1 and 5),
  x_total smallint generated always as (x1 + x2 + x3 + x4) stored,
  x_level text generated always as (
    case
      when (x1 + x2 + x3 + x4) is null then null
      when (x1 + x2 + x3 + x4) <= 7 then 'baja'
      when (x1 + x2 + x3 + x4) <= 14 then 'media'
      else 'alta'
    end
  ) stored,

  -- Y: estrategia de finalización · Z: profundidad del vínculo
  y_strategy text check (y_strategy in ('explicita', 'ghosting', 'otra')),
  z_depth text check (z_depth in ('digital', 'citas_1_5', 'citas_mas_5')),

  elapsed_seconds int check (elapsed_seconds between 0 and 86400),
  status text not null default 'valida' check (status in ('valida', 'invalida')),
  admin_note text check (char_length(admin_note) <= 500),

  -- Una respuesta no elegible tiene motivo y no guarda respuestas sustantivas
  constraint ineligible_has_reason check (
    eligible or (
      screen_out_reason is not null
      and x1 is null and x2 is null and x3 is null and x4 is null
      and y_strategy is null and z_depth is null
    )
  )
);

-- Coherencia: una respuesta elegible tiene que estar completa.
-- (Se define aparte para poder actualizarla si se vuelve a ejecutar el script.)
-- ended_recently ya no es un filtro: la encuesta dejó de preguntarlo.
-- La columna se conserva por compatibilidad con importaciones anteriores.
alter table public.responses drop constraint if exists eligible_is_complete;
alter table public.responses add constraint eligible_is_complete check (
  not eligible or (
    age_group in ('18_24', '25_29', '30_35')
    and urban and uses_apps
    and x1 is not null and x2 is not null and x3 is not null and x4 is not null
    and y_strategy is not null and z_depth is not null
  )
);

create index if not exists responses_created_idx on public.responses (created_at);
create index if not exists responses_analytic_idx on public.responses (is_test, status, eligible);

-- ---------------------------------------------------------------------
-- 4. Permisos y Row Level Security
-- ---------------------------------------------------------------------
alter table public.responses enable row level security;
alter table public.study_settings enable row level security;
alter table public.admins enable row level security;

-- Sin acceso directo para el público
revoke all on public.responses, public.study_settings, public.admins from anon;
revoke all on public.responses, public.study_settings, public.admins from authenticated;

-- Usuarios autenticados: permisos de tabla mínimos; RLS decide si son admins
grant select, delete on public.responses to authenticated;
grant insert (submission_id, created_at, is_test, source, import_batch, consent, eligible,
              screen_out_reason, age_group, urban, uses_apps, ended_recently,
              x1, x2, x3, x4, y_strategy, z_depth, elapsed_seconds, status, admin_note)
  on public.responses to authenticated;
-- Los admins solo pueden cambiar la clasificación, nunca las respuestas en sí
grant update (status, admin_note, is_test) on public.responses to authenticated;
grant select, update (collecting, cutoff_at, min_public_n, min_cell, updated_at) on public.study_settings to authenticated;
grant select on public.admins to authenticated;

drop policy if exists "admins leen respuestas" on public.responses;
create policy "admins leen respuestas" on public.responses
  for select to authenticated using (public.is_admin());

drop policy if exists "admins importan respuestas" on public.responses;
create policy "admins importan respuestas" on public.responses
  for insert to authenticated with check (public.is_admin() and source = 'import');

drop policy if exists "admins clasifican respuestas" on public.responses;
create policy "admins clasifican respuestas" on public.responses
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Solo se pueden borrar respuestas de PRUEBA (las reales se marcan como inválidas)
drop policy if exists "admins borran solo pruebas" on public.responses;
create policy "admins borran solo pruebas" on public.responses
  for delete to authenticated using (public.is_admin() and is_test);

drop policy if exists "admins leen config" on public.study_settings;
create policy "admins leen config" on public.study_settings
  for select to authenticated using (public.is_admin());

drop policy if exists "admins editan config" on public.study_settings;
create policy "admins editan config" on public.study_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins se ven" on public.admins;
create policy "admins se ven" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 5. Envío público de respuestas (única vía de escritura para anon)
-- ---------------------------------------------------------------------
create or replace function public.submit_response(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  s public.study_settings;
  v_headers json;
  v_ip text;
  v_hash text;
  v_hits int;
  v_sid uuid;
  v_eligible boolean;
  v_elapsed int;
  v_inserted int;
  v_x int[];
  v_reason text;
begin
  if payload is null or jsonb_typeof(payload) <> 'object' then
    return jsonb_build_object('ok', false, 'error', 'payload_invalido');
  end if;
  if pg_column_size(payload) > 4000 then
    return jsonb_build_object('ok', false, 'error', 'payload_invalido');
  end if;

  select * into s from public.study_settings where id = 1;
  if not coalesce(s.collecting, true) then
    return jsonb_build_object('ok', false, 'error', 'recoleccion_cerrada');
  end if;

  -- Honeypot: los bots completan el campo oculto. Se responde "ok" sin guardar.
  if coalesce(payload->>'website', '') <> '' then
    return jsonb_build_object('ok', true);
  end if;

  -- Identificador de envío (protección contra doble envío)
  begin
    v_sid := (payload->>'submission_id')::uuid;
  exception when others then
    return jsonb_build_object('ok', false, 'error', 'payload_invalido');
  end;
  if v_sid is null then
    return jsonb_build_object('ok', false, 'error', 'payload_invalido');
  end if;
  if exists (select 1 from public.responses where submission_id = v_sid) then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;

  if coalesce(payload->>'consent', '') <> 'true' then
    return jsonb_build_object('ok', false, 'error', 'sin_consentimiento');
  end if;

  v_eligible := coalesce(payload->>'eligible', '') = 'true';
  begin
    v_elapsed := (payload->>'elapsed_seconds')::int;
  exception when others then
    v_elapsed := null;
  end;
  -- Tiempo mínimo humano: 12 s para un recorrido completo, 3 s para un filtro
  if v_elapsed is null or v_elapsed < (case when v_eligible then 12 else 3 end) then
    return jsonb_build_object('ok', false, 'error', 'demasiado_rapido');
  end if;

  -- Rate limit por IP (hash con sal secreta; la IP nunca se guarda)
  begin
    v_headers := current_setting('request.headers', true)::json;
  exception when others then
    v_headers := null;
  end;
  v_ip := coalesce(
    v_headers->>'cf-connecting-ip',
    split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1),
    'sin-ip'
  );
  select encode(sha256(convert_to(v_ip || a.ip_salt, 'UTF8')), 'hex') into v_hash
  from private.app_secrets a where a.id = 1;

  insert into private.rate_limits as r (ip_hash, bucket, hits)
  values (v_hash, date_trunc('hour', now()), 1)
  on conflict (ip_hash, bucket) do update set hits = r.hits + 1
  returning hits into v_hits;
  -- Margen amplio: en una clase muchas personas comparten la misma red
  if v_hits > 40 then
    return jsonb_build_object('ok', false, 'error', 'demasiados_envios');
  end if;
  delete from private.rate_limits where bucket < now() - interval '2 days';

  begin
    if v_eligible then
      v_x := array[(payload->>'x1')::int, (payload->>'x2')::int, (payload->>'x3')::int, (payload->>'x4')::int];
      insert into public.responses (
        submission_id, is_test, source, consent, eligible,
        age_group, urban, uses_apps, ended_recently,
        x1, x2, x3, x4, y_strategy, z_depth, elapsed_seconds
      ) values (
        v_sid, coalesce(payload->>'is_test', '') = 'true', 'web', true, true,
        payload->>'age_group', true, true, null,
        v_x[1], v_x[2], v_x[3], v_x[4], payload->>'y_strategy', payload->>'z_depth', v_elapsed
      )
      on conflict (submission_id) do nothing;
    else
      v_reason := payload->>'screen_out_reason';
      insert into public.responses (
        submission_id, is_test, source, consent, eligible, screen_out_reason,
        age_group, urban, uses_apps, ended_recently, elapsed_seconds
      ) values (
        v_sid, coalesce(payload->>'is_test', '') = 'true', 'web', true, false, v_reason,
        payload->>'age_group',
        case when payload ? 'urban' then (payload->>'urban')::boolean end,
        case when payload ? 'uses_apps' then (payload->>'uses_apps')::boolean end,
        case when payload ? 'ended_recently' then (payload->>'ended_recently')::boolean end,
        v_elapsed
      )
      on conflict (submission_id) do nothing;
    end if;
    get diagnostics v_inserted = row_count;
  exception
    when check_violation or invalid_text_representation or not_null_violation or numeric_value_out_of_range then
      return jsonb_build_object('ok', false, 'error', 'datos_invalidos');
  end;

  return jsonb_build_object('ok', true, 'duplicate', v_inserted = 0);
end;
$$;

-- ---------------------------------------------------------------------
-- 6. Estadísticas públicas agregadas (sin filas individuales)
--    Solo respuestas reales, válidas y elegibles. Grupos con menos de
--    min_cell casos se publican como "suprimidos" (sin conteos).
-- ---------------------------------------------------------------------
-- Muestra analítica pública: reales, válidas y elegibles (sin columnas identificatorias)
create or replace function private.analytic_sample()
returns table (x_level text, y_strategy text, z_depth text)
language sql
stable
as $$
  select r.x_level, r.y_strategy, r.z_depth
  from public.responses r
  where not r.is_test and r.status = 'valida' and r.eligible;
$$;
revoke all on function private.analytic_sample() from public;

create or replace function public.get_public_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  s public.study_settings;
  n_eligible int;
  n_binary int;
  n_other int;
  n_screen int;
  result jsonb;
begin
  select * into s from public.study_settings where id = 1;

  select count(*) into n_eligible from private.analytic_sample();
  select count(*) into n_binary from private.analytic_sample() where y_strategy in ('explicita', 'ghosting');
  n_other := n_eligible - n_binary;
  select count(*) into n_screen from public.responses
    where not is_test and status = 'valida' and not eligible;

  result := jsonb_build_object(
    'generated_at', now(),
    'collecting', s.collecting,
    'min_public_n', s.min_public_n,
    'min_cell', s.min_cell,
    'n_eligible', n_eligible,
    'n_binary', n_binary,
    'n_other', n_other,
    'n_screened_out', n_screen,
    'sufficient', n_binary >= s.min_public_n
  );

  if n_binary < s.min_public_n then
    return result;   -- datos insuficientes: solo conteos de participación
  end if;

  -- B. Estrategias (análisis binario)
  result := result || jsonb_build_object('strategy', (
    select jsonb_build_object(
      'explicita', count(*) filter (where y_strategy = 'explicita'),
      'ghosting',  count(*) filter (where y_strategy = 'ghosting'))
    from private.analytic_sample() where y_strategy in ('explicita', 'ghosting')));

  -- C. Distribución de incomodidad (todas las respuestas elegibles)
  result := result || jsonb_build_object('discomfort', (
    select jsonb_build_object(
      'baja',  count(*) filter (where x_level = 'baja'),
      'media', count(*) filter (where x_level = 'media'),
      'alta',  count(*) filter (where x_level = 'alta'))
    from private.analytic_sample()));

  -- D/E. Tabla de contingencia X × Y (filas con n < min_cell, suprimidas)
  result := result || jsonb_build_object('crosstab', (
    select jsonb_agg(row_obj order by ord) from (
      select l.ord,
        case when count(t.y_strategy) < s.min_cell then
          jsonb_build_object('level', l.lvl, 'suppressed', true)
        else
          jsonb_build_object('level', l.lvl, 'suppressed', false, 'n', count(t.y_strategy),
            'explicita', count(t.y_strategy) filter (where t.y_strategy = 'explicita'),
            'ghosting',  count(t.y_strategy) filter (where t.y_strategy = 'ghosting'))
        end as row_obj
      from (values (1, 'baja'), (2, 'media'), (3, 'alta')) as l(ord, lvl)
      left join private.analytic_sample() t on t.x_level = l.lvl and t.y_strategy in ('explicita', 'ghosting')
      group by l.ord, l.lvl
    ) q));

  -- F. Estrategia según profundidad del vínculo (Z)
  result := result || jsonb_build_object('by_depth', (
    select jsonb_agg(row_obj order by ord) from (
      select d.ord,
        case when count(t.y_strategy) < s.min_cell then
          jsonb_build_object('depth', d.dep, 'suppressed', true)
        else
          jsonb_build_object('depth', d.dep, 'suppressed', false, 'n', count(t.y_strategy),
            'explicita', count(t.y_strategy) filter (where t.y_strategy = 'explicita'),
            'ghosting',  count(t.y_strategy) filter (where t.y_strategy = 'ghosting'))
        end as row_obj
      from (values (1, 'digital'), (2, 'citas_1_5'), (3, 'citas_mas_5')) as d(ord, dep)
      left join private.analytic_sample() t on t.z_depth = d.dep and t.y_strategy in ('explicita', 'ghosting')
      group by d.ord, d.dep
    ) q));

  -- F'. X × Y dentro de cada nivel de Z (exploración; mismas reglas de supresión)
  result := result || jsonb_build_object('crosstab_by_depth', (
    select jsonb_agg(row_obj order by dord, lord) from (
      select d.ord as dord, l.ord as lord,
        case when count(t.y_strategy) < s.min_cell then
          jsonb_build_object('depth', d.dep, 'level', l.lvl, 'suppressed', true)
        else
          jsonb_build_object('depth', d.dep, 'level', l.lvl, 'suppressed', false, 'n', count(t.y_strategy),
            'explicita', count(t.y_strategy) filter (where t.y_strategy = 'explicita'),
            'ghosting',  count(t.y_strategy) filter (where t.y_strategy = 'ghosting'))
        end as row_obj
      from (values (1, 'digital'), (2, 'citas_1_5'), (3, 'citas_mas_5')) as d(ord, dep)
      cross join (values (1, 'baja'), (2, 'media'), (3, 'alta')) as l(ord, lvl)
      left join private.analytic_sample() t on t.z_depth = d.dep and t.x_level = l.lvl
                             and t.y_strategy in ('explicita', 'ghosting')
      group by d.ord, d.dep, l.ord, l.lvl
    ) q));

  return result;
end;
$$;

-- Permisos de ejecución
revoke all on function public.submit_response(jsonb) from public;
revoke all on function public.get_public_stats() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.submit_response(jsonb) to anon, authenticated;
grant execute on function public.get_public_stats() to anon, authenticated;
grant execute on function public.is_admin() to authenticated;

-- =====================================================================
-- 7. DAR ACCESO DE ADMINISTRACIÓN (ejecutar DESPUÉS de crear tu usuario
--    en Authentication → Users → Add user). Reemplazá el mail:
--
--   insert into public.admins (user_id, email)
--   select id, email from auth.users where email = 'TU_MAIL@ejemplo.com'
--   on conflict (user_id) do nothing;
-- =====================================================================
