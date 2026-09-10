-- ================================================================
-- DANMO HUB - Modulo de Permissoes e Controlo de Acesso
-- ----------------------------------------------------------------
-- COMO CORRER:
--   1. Abre o Supabase (dashboard.supabase.com) > o teu projeto
--   2. Menu lateral: SQL Editor > New query
--   3. Cola TODO este ficheiro e clica em RUN
--   4. Espera a mensagem verde de sucesso
--
-- SEGURANCA: pode correr-se mais do que uma vez sem partir nada.
-- As definicoes iniciais (matriz de permissoes e conta de recurso)
-- so sao aplicadas na primeira vez; depois do primeiro RUN, as
-- alteracoes que fizeres no painel Permissoes nunca sao revertidas.
-- ================================================================

-- 1) Extensao de criptografia (hash de senhas bcrypt)
create extension if not exists pgcrypto with schema extensions;

-- 2) Colunas novas na tabela de utilizadores
alter table public.utilizadores
  add column if not exists senha_hash text,
  add column if not exists precisa_trocar boolean not null default false,
  add column if not exists ultimo_acesso timestamptz;

-- 3) Converte as senhas antigas (texto simples) para hash.
--    Cada conta mantem a MESMA senha que ja tinha; ao entrar,
--    o sistema pede para definir uma nova (precisa_trocar).
update public.utilizadores
   set senha_hash = crypt(senha, gen_salt('bf', 10)),
       precisa_trocar = true
 where (senha_hash is null or senha_hash = '')
   and senha is not null and senha <> '';

-- 4) Elimina o texto simples das senhas da base de dados
update public.utilizadores set senha = null where senha is not null;

-- 5) Sessoes (cada entrada = um login ativo, com validade de 12h)
create table if not exists public.sessoes (
  token         text primary key,
  utilizador_id uuid not null references public.utilizadores(id) on delete cascade,
  criado_em     timestamptz not null default now(),
  expira_em     timestamptz not null
);

-- 6) Matriz de permissoes (nivel x modulo x acao)
create table if not exists public.permissoes (
  id        bigint generated always as identity primary key,
  nivel     text not null,
  modulo    text not null,
  acao      text not null,
  permitido boolean not null default true,
  unique (nivel, modulo, acao)
);

-- 7) Registo de acessos e acoes administrativas (auditoria)
create table if not exists public.registos_acesso (
  id            bigint generated always as identity primary key,
  utilizador_id uuid references public.utilizadores(id) on delete set null,
  usuario       text,
  acao          text not null,
  sucesso       boolean not null default true,
  detalhe       text,
  criado_em     timestamptz not null default now()
);

-- 8) Configuracao do sistema
create table if not exists public.config_sistema (
  chave text primary key,
  valor text not null
);

insert into public.config_sistema (chave, valor) values
  ('hub_bloqueado', 'false'),
  ('chave_admin_hash', '$2a$10$WbX3/jomxqVydGfkiNfZP.Nog38WniEGbHJYziYHOwVm8WxnPDDVC')
on conflict (chave) do nothing;

-- 9) Conta de recurso do sistema (usar so em emergencia)
--    Codigo: DMADMIN  |  Senha temporaria: enviada a parte
--    No primeiro login o sistema obriga a definir uma senha nova.
insert into public.utilizadores (nome, cargo, usuario, senha_hash, nivel, ativo, precisa_trocar)
select 'Administrador do Hub', 'Administracao', 'DMADMIN',
       '$2a$10$TNUzIA0pkQq2Sqdc6rDGGeKk6coEXgmEC0dJLtnYRhfndtYkdH5Gi',
       'admin', true, true
 where not exists (select 1 from public.utilizadores where usuario = 'DMADMIN');

-- 10) Protecao das tabelas sensiveis (RLS)
--     Sem isto, qualquer pessoa com a chave anon conseguia LER as
--     contas e as senhas. Com o RLS ativo e sem politicas, o acesso
--     direto fica bloqueado; tudo passa pelas funcoes abaixo, que
--     validam sessao e nivel antes de devolver qualquer coisa.
alter table public.utilizadores    enable row level security;
alter table public.sessoes         enable row level security;
alter table public.permissoes      enable row level security;
alter table public.registos_acesso enable row level security;
alter table public.config_sistema  enable row level security;

-- ================================================================
-- FUNCOES INTERNAS (nao chamar diretamente)
-- ================================================================

create or replace function public.chave_admin_ok(p_chave text)
returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (
    select 1 from public.config_sistema
     where chave = 'chave_admin_hash'
       and p_chave is not null and p_chave <> ''
       and crypt(p_chave, valor) = valor
  );
$$;

create or replace function public.sessao_utilizador(p_token text)
returns table (id uuid, nome text, cargo text, usuario text,
               nivel text, precisa_trocar boolean)
language sql stable security definer set search_path = public, extensions as $$
  select u.id, u.nome, u.cargo, u.usuario, u.nivel, u.precisa_trocar
    from public.sessoes s
    join public.utilizadores u on u.id = s.utilizador_id
   where s.token = p_token
     and s.expira_em > now()
     and u.ativo
   limit 1;
$$;

create or replace function public.registar_acesso(
  p_utilizador uuid, p_usuario text, p_acao text,
  p_sucesso boolean, p_detalhe text default null)
returns void
language sql security definer set search_path = public, extensions as $$
  insert into public.registos_acesso (utilizador_id, usuario, acao, sucesso, detalhe)
  values (p_utilizador, p_usuario, p_acao, p_sucesso, p_detalhe);
$$;

-- ================================================================
-- FUNCOES CHAMADAS PELO SISTEMA (RPC)
-- ================================================================

-- Login: devolve token + dados do utilizador ou lanca erro
create or replace function public.autenticar(p_usuario text, p_senha text)
returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  u public.utilizadores%rowtype;
  v_token text;
  v_expira timestamptz;
  v_bloqueado text;
begin
  if p_usuario is null or p_senha is null
     or length(trim(p_usuario)) = 0 or length(p_senha) = 0 then
    raise exception 'Escreve o codigo e a senha.';
  end if;

  select * into u
    from public.utilizadores
   where usuario = upper(trim(p_usuario))
   order by ativo desc
   limit 1;

  if u.id is null or u.senha_hash is null
     or crypt(p_senha, u.senha_hash) <> u.senha_hash then
    perform public.registar_acesso(u.id, upper(trim(p_usuario)), 'login_falhou', false, 'Codigo ou senha errados');
    raise exception 'Codigo ou senha incorretos.';
  end if;

  if not u.ativo then
    raise exception 'Conta desativada. Fala com a administracao.';
  end if;

  select valor into v_bloqueado from public.config_sistema where chave = 'hub_bloqueado';
  if v_bloqueado = 'true' and u.nivel <> 'admin' then
    raise exception 'O sistema esta bloqueado temporariamente pela administracao.';
  end if;

  v_token  := encode(gen_random_bytes(32), 'hex');
  v_expira := now() + interval '12 hours';

  delete from public.sessoes where expira_em < now();
  insert into public.sessoes (token, utilizador_id, expira_em)
  values (v_token, u.id, v_expira);

  update public.utilizadores set ultimo_acesso = now() where id = u.id;
  perform public.registar_acesso(u.id, u.usuario, 'login', true, null);

  return json_build_object(
    'ok', true,
    'token', v_token,
    'expira_em', v_expira,
    'utilizador', json_build_object(
      'id', u.id, 'usuario', u.usuario, 'nome', u.nome,
      'cargo', u.cargo, 'nivel', u.nivel, 'precisa_trocar', u.precisa_trocar
    )
  );
end;
$$;

-- Valida a sessao e devolve utilizador + matriz de permissoes
create or replace function public.validar_sessao(p_token text)
returns json
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  u record;
  v_bloqueado text;
  v_matriz json;
begin
  select * into u from public.sessao_utilizador(p_token);
  if u.id is null then
    return json_build_object('valido', false, 'motivo', 'sessao_invalida');
  end if;

  select valor into v_bloqueado from public.config_sistema where chave = 'hub_bloqueado';
  if v_bloqueado = 'true' and u.nivel <> 'admin' then
    return json_build_object('valido', false, 'motivo', 'bloqueado');
  end if;

  select coalesce(
           json_agg(json_build_object(
             'nivel', nivel, 'modulo', modulo,
             'acao', acao, 'permitido', permitido)),
           '[]'::json)
    into v_matriz
    from public.permissoes;

  return json_build_object(
    'valido', true,
    'motivo', null,
    'utilizador', json_build_object(
      'id', u.id, 'usuario', u.usuario, 'nome', u.nome,
      'cargo', u.cargo, 'nivel', u.nivel, 'precisa_trocar', u.precisa_trocar),
    'matriz', v_matriz
  );
end;
$$;

-- Termina a sessao (Sair)
create or replace function public.terminar_sessao(p_token text)
returns void
language sql security definer set search_path = public, extensions as $$
  delete from public.sessoes where token = p_token;
$$;

-- Troca da propria senha (primeiro acesso ou por vontade)
create or replace function public.trocar_senha(p_token text, p_atual text, p_nova text)
returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  u record;
  v_hash text;
begin
  select * into u from public.sessao_utilizador(p_token);
  if u.id is null then
    raise exception 'Sessao expirada. Entra de novo.';
  end if;

  if p_nova is null or length(p_nova) < 6 then
    raise exception 'A nova senha precisa de ter pelo menos 6 caracteres.';
  end if;

  select senha_hash into v_hash from public.utilizadores where id = u.id;
  if v_hash is null or crypt(p_atual, v_hash) <> v_hash then
    perform public.registar_acesso(u.id, u.usuario, 'trocar_senha', false, 'Senha atual errada');
    raise exception 'A senha atual esta errada.';
  end if;

  update public.utilizadores
     set senha_hash = crypt(p_nova, gen_salt('bf', 10)),
         precisa_trocar = false
   where id = u.id;

  perform public.registar_acesso(u.id, u.usuario, 'trocar_senha', true, null);
  return json_build_object('ok', true);
end;
$$;

-- Lista utilizadores (so admin)
create or replace function public.listar_utilizadores(p_token text)
returns table (id uuid, usuario text, nome text, cargo text, nivel text,
               ativo boolean, precisa_trocar boolean,
               ultimo_acesso timestamptz, criado_em timestamptz)
language sql stable security definer set search_path = public, extensions as $$
  select u.id, u.usuario, u.nome, u.cargo, u.nivel,
         u.ativo, u.precisa_trocar, u.ultimo_acesso, u.criado_em
    from public.sessao_utilizador(p_token) s
    join public.utilizadores u on s.nivel = 'admin'
   order by u.criado_em asc;
$$;

-- Cria ou edita um utilizador (admin + chave de administracao)
-- p_id nulo = criar conta nova; p_senha preenchido = redefinir senha
create or replace function public.guardar_utilizador(
  p_token text, p_chave text, p_id uuid,
  p_usuario text, p_nome text, p_cargo text,
  p_nivel text, p_ativo boolean, p_senha text)
returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  s record;
  t record;
  v_id uuid;
  v_usuario text;
  v_acao text;
  v_ativo boolean;
begin
  select * into s from public.sessao_utilizador(p_token);
  if s.id is null or s.nivel <> 'admin' then
    raise exception 'So a administracao pode fazer isto.';
  end if;
  if not public.chave_admin_ok(p_chave) then
    perform public.registar_acesso(s.id, s.usuario, 'chave_admin_errada', false, 'guardar_utilizador');
    raise exception 'Chave de administracao errada.';
  end if;

  if p_nivel not in ('admin','gestor','operador','consulta') then
    raise exception 'Nivel invalido.';
  end if;
  if p_usuario is null or length(trim(p_usuario)) < 3 then
    raise exception 'O codigo de utilizador precisa de ter pelo menos 3 caracteres.';
  end if;
  v_usuario := upper(trim(p_usuario));
  v_ativo := coalesce(p_ativo, true);

  if p_id is null then
    -- Criar conta nova
    if exists (select 1 from public.utilizadores where usuario = v_usuario) then
      raise exception 'Ja existe uma conta com o codigo %.', v_usuario;
    end if;
    if p_senha is null or length(p_senha) < 6 then
      raise exception 'Define uma senha inicial com pelo menos 6 caracteres.';
    end if;

    insert into public.utilizadores
      (nome, cargo, usuario, senha_hash, nivel, ativo, precisa_trocar)
    values
      (trim(p_nome), p_cargo, v_usuario,
       crypt(p_senha, gen_salt('bf', 10)), p_nivel, v_ativo, true)
    returning id into v_id;

    v_acao := 'criar_utilizador';
  else
    -- Editar conta existente
    select * into t from public.utilizadores where id = p_id;
    if t.id is null then
      raise exception 'Conta nao encontrada.';
    end if;

    if t.id = s.id and (p_nivel <> t.nivel or v_ativo = false) then
      raise exception 'Nao podes alterar o teu proprio nivel nem desativar a tua propria conta.';
    end if;

    -- Garante que fica sempre uma conta de administracao ativa
    if t.nivel = 'admin' and t.ativo
       and (p_nivel <> 'admin' or v_ativo = false) then
      if (select count(*) from public.utilizadores
           where nivel = 'admin' and ativo and id <> t.id) = 0 then
        raise exception 'Tem de ficar pelo menos uma conta de administracao ativa.';
      end if;
    end if;

    if exists (select 1 from public.utilizadores
                where usuario = v_usuario and id <> t.id) then
      raise exception 'Ja existe outra conta com o codigo %.', v_usuario;
    end if;

    update public.utilizadores
       set nome = trim(p_nome), cargo = p_cargo, usuario = v_usuario,
           nivel = p_nivel, ativo = v_ativo
     where id = t.id;

    if p_senha is not null and length(p_senha) > 0 then
      if length(p_senha) < 6 then
        raise exception 'A senha precisa de ter pelo menos 6 caracteres.';
      end if;
      update public.utilizadores
         set senha_hash = crypt(p_senha, gen_salt('bf', 10)),
             precisa_trocar = true
       where id = t.id;
      v_acao := 'redefinir_senha';
    else
      v_acao := 'editar_utilizador';
    end if;

    -- Conta desativada = sessoes cortadas de imediato
    if v_ativo = false then
      delete from public.sessoes where utilizador_id = t.id;
    end if;

    v_id := t.id;
  end if;

  perform public.registar_acesso(s.id, s.usuario, v_acao, true, v_usuario);
  return json_build_object('ok', true, 'id', v_id);
end;
$$;

-- Apaga um utilizador (admin + chave de administracao)
create or replace function public.apagar_utilizador(p_token text, p_chave text, p_id uuid)
returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  s record;
  t record;
begin
  select * into s from public.sessao_utilizador(p_token);
  if s.id is null or s.nivel <> 'admin' then
    raise exception 'So a administracao pode fazer isto.';
  end if;
  if not public.chave_admin_ok(p_chave) then
    perform public.registar_acesso(s.id, s.usuario, 'chave_admin_errada', false, 'apagar_utilizador');
    raise exception 'Chave de administracao errada.';
  end if;
  if p_id = s.id then
    raise exception 'Nao podes apagar a tua propria conta.';
  end if;

  select * into t from public.utilizadores where id = p_id;
  if t.id is null then
    raise exception 'Conta nao encontrada.';
  end if;
  if t.nivel = 'admin'
     and (select count(*) from public.utilizadores
           where nivel = 'admin' and ativo and id <> t.id) = 0 then
    raise exception 'Tem de ficar pelo menos uma conta de administracao ativa.';
  end if;

  delete from public.sessoes where utilizador_id = t.id;
  delete from public.utilizadores where id = t.id;
  perform public.registar_acesso(s.id, s.usuario, 'apagar_utilizador', true, t.usuario);
  return json_build_object('ok', true);
exception
  when foreign_key_violation then
    raise exception 'Esta conta tem registos ligados noutras tabelas. Desativa-a em vez de apagar.';
end;
$$;

-- Guarda a matriz de permissoes de um nivel (admin + chave)
create or replace function public.guardar_matriz(p_token text, p_chave text, p_nivel text, p_itens json)
returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  s record;
  v_n int;
begin
  select * into s from public.sessao_utilizador(p_token);
  if s.id is null or s.nivel <> 'admin' then
    raise exception 'So a administracao pode fazer isto.';
  end if;
  if not public.chave_admin_ok(p_chave) then
    perform public.registar_acesso(s.id, s.usuario, 'chave_admin_errada', false, 'guardar_matriz');
    raise exception 'Chave de administracao errada.';
  end if;
  if p_nivel = 'admin' then
    raise exception 'O perfil administrador tem sempre acesso total.';
  end if;
  if p_nivel not in ('gestor','operador','consulta') then
    raise exception 'Perfil invalido.';
  end if;

  delete from public.permissoes where nivel = p_nivel;
  insert into public.permissoes (nivel, modulo, acao, permitido)
  select p_nivel, i.modulo, i.acao, coalesce(i.permitido, false)
    from json_to_recordset(p_itens) as i(modulo text, acao text, permitido boolean)
   where i.modulo is not null and i.acao is not null;
  get diagnostics v_n = row_count;

  perform public.registar_acesso(s.id, s.usuario, 'matriz_atualizada', true, p_nivel || ' (' || v_n || ' linhas)');
  return json_build_object('ok', true, 'linhas', v_n);
end;
$$;

-- Lista os ultimos registos de acesso (so admin)
create or replace function public.listar_registos(p_token text)
returns table (criado_em timestamptz, usuario text, acao text,
               sucesso boolean, detalhe text)
language sql stable security definer set search_path = public, extensions as $$
  select r.criado_em, r.usuario, r.acao, r.sucesso, r.detalhe
    from public.sessao_utilizador(p_token) s
    join public.registos_acesso r on s.nivel = 'admin'
   order by r.criado_em desc
   limit 200;
$$;

-- Confirma a chave de administracao (usada pelo painel antes de abrir modais)
create or replace function public.verificar_chave_admin(p_token text, p_chave text)
returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (select 1 from public.sessao_utilizador(p_token) where nivel = 'admin')
     and public.chave_admin_ok(p_chave);
$$;

-- Altera a chave de administracao
create or replace function public.alterar_chave_admin(p_token text, p_atual text, p_nova text)
returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  s record;
begin
  select * into s from public.sessao_utilizador(p_token);
  if s.id is null or s.nivel <> 'admin' then
    raise exception 'So a administracao pode fazer isto.';
  end if;
  if not public.chave_admin_ok(p_atual) then
    perform public.registar_acesso(s.id, s.usuario, 'chave_admin_errada', false, 'alterar_chave_admin');
    raise exception 'A chave atual esta errada.';
  end if;
  if p_nova is null or length(p_nova) < 8 then
    raise exception 'A nova chave precisa de ter pelo menos 8 caracteres.';
  end if;
  update public.config_sistema
     set valor = crypt(p_nova, gen_salt('bf', 10))
   where chave = 'chave_admin_hash';
  perform public.registar_acesso(s.id, s.usuario, 'chave_alterada', true, null);
  return json_build_object('ok', true);
end;
$$;

-- Bloqueia ou desbloqueia o sistema inteiro (admin + chave)
-- Bloqueado: so contas de administracao conseguem entrar.
create or replace function public.alternar_bloqueio(p_token text, p_chave text, p_bloquear boolean)
returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  s record;
begin
  select * into s from public.sessao_utilizador(p_token);
  if s.id is null or s.nivel <> 'admin' then
    raise exception 'So a administracao pode fazer isto.';
  end if;
  if not public.chave_admin_ok(p_chave) then
    perform public.registar_acesso(s.id, s.usuario, 'chave_admin_errada', false, 'alternar_bloqueio');
    raise exception 'Chave de administracao errada.';
  end if;

  update public.config_sistema
     set valor = case when p_bloquear then 'true' else 'false' end
   where chave = 'hub_bloqueado';

  if p_bloquear then
    delete from public.sessoes
     where utilizador_id in (select id from public.utilizadores where nivel <> 'admin');
  end if;

  perform public.registar_acesso(s.id, s.usuario,
    case when p_bloquear then 'bloquear_sistema' else 'desbloquear_sistema' end, true, null);
  return json_build_object('ok', true, 'bloqueado', p_bloquear);
end;
$$;

-- Estado geral para o painel (bloqueado? sou admin?)
create or replace function public.obter_estado(p_token text)
returns json
language sql stable security definer set search_path = public, extensions as $$
  select json_build_object(
    'bloqueado', (select valor = 'true' from public.config_sistema where chave = 'hub_bloqueado'),
    'admin', exists (select 1 from public.sessao_utilizador(p_token) where nivel = 'admin')
  );
$$;

-- ================================================================
-- MATRIZ INICIAL DE PERMISSOES
-- Corre UMA UNICA VEZ (na primeira instalacao). Depois disto,
-- as permissoes ajustam-se no painel Permissoes do hub.
--
-- Niveis: admin (tudo, sempre) | gestor | operador | consulta
-- ================================================================
do $$
declare
  v_modulos text[] := array['inicio','oficina','stock','hst','ferramentaria','rh','avaliacao','aquisicao','ferias','permissoes'];
  v_acoes text[] := array['ver','criar','editar','apagar'];
  m text;
  a text;
begin
  if exists (select 1 from public.config_sistema where chave = 'matriz_instalada') then
    return;
  end if;

  -- admin: acesso total documentado (o sistema tambem garante por codigo)
  foreach m in array v_modulos loop
    foreach a in array v_acoes loop
      insert into public.permissoes (nivel, modulo, acao, permitido)
      values ('admin', m, a, true)
      on conflict (nivel, modulo, acao) do nothing;
    end loop;
  end loop;

  -- gestor: ver, criar e editar em tudo; sem apagar; sem permissoes
  foreach m in array v_modulos loop
    foreach a in array v_acoes loop
      insert into public.permissoes (nivel, modulo, acao, permitido)
      values ('gestor', m, a,
              a in ('ver','criar','editar') and m <> 'permissoes')
      on conflict (nivel, modulo, acao) do nothing;
    end loop;
  end loop;

  -- operador: ver tudo; criar so no dia a dia (oficina, stock, ferramentaria, aquisicao)
  foreach m in array v_modulos loop
    foreach a in array v_acoes loop
      insert into public.permissoes (nivel, modulo, acao, permitido)
      values ('operador', m, a,
              (a = 'ver' and m <> 'permissoes')
              or (a = 'criar' and m in ('oficina','stock','ferramentaria','aquisicao')))
      on conflict (nivel, modulo, acao) do nothing;
    end loop;
  end loop;

  -- consulta: so ver (ideal para direcao e analises)
  foreach m in array v_modulos loop
    foreach a in array v_acoes loop
      insert into public.permissoes (nivel, modulo, acao, permitido)
      values ('consulta', m, a, a = 'ver' and m <> 'permissoes')
      on conflict (nivel, modulo, acao) do nothing;
    end loop;
  end loop;

  insert into public.config_sistema (chave, valor)
  values ('matriz_instalada', 'true')
  on conflict (chave) do nothing;
end;
$$;
