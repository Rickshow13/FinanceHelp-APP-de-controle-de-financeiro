-- =====================================================================
-- FinanceHelp: a "planta" do banco de dados (Supabase)
-- Para recriar o banco: cole tudo no SQL Editor do Supabase e clique em Run
-- =====================================================================

-- ---------- 1. A GAVETA DAS TRANSAÇÕES ----------
-- Cria a tabela (a "planilha") das transações
create table transacoes (
  -- RG de cada registro, criado sozinho
  id uuid primary key default gen_random_uuid(),
  -- De quem é o registro: preenchido sozinho com o usuário logado (e apagado junto se a conta for apagada)
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  -- Só aceita 'entrada' ou 'gasto'
  tipo text not null check (tipo in ('entrada', 'gasto')),
  -- Valor em reais, sempre maior que zero
  valor numeric(12, 2) not null check (valor > 0),
  -- Categoria obrigatória
  categoria text not null,
  -- Descrição opcional
  descricao text,
  -- Dia em que aconteceu (se não informado, hoje)
  data date not null default current_date,
  -- Data e hora exata do registro
  criado_em timestamptz not null default now()
);

-- ---------- 2. O SEGURANÇA DA GAVETA (RLS) ----------
-- Liga o segurança: ninguém mexe sem permissão
alter table transacoes enable row level security;
-- Cada pessoa só VÊ os próprios registros
create policy "Ver apenas os seus" on transacoes for select using (auth.uid() = user_id);
-- Cada pessoa só CRIA registros no próprio nome
create policy "Criar apenas os seus" on transacoes for insert with check (auth.uid() = user_id);
-- Cada pessoa só EDITA os próprios registros
create policy "Editar apenas os seus" on transacoes for update using (auth.uid() = user_id);
-- Cada pessoa só APAGA os próprios registros
create policy "Apagar apenas os seus" on transacoes for delete using (auth.uid() = user_id);

-- ---------- 3. O FUNCIONÁRIO DE CONFIANÇA (apagar a própria conta) ----------
-- Função que apaga a conta de quem chamou (usa a chave mestra, que nunca sai do banco)
create or replace function public.apagar_minha_conta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Apaga SÓ o usuário cujo RG é igual ao crachá de quem pediu
  delete from auth.users where id = auth.uid();
end;
$$;
-- Ninguém pode chamar o funcionário...
revoke all on function public.apagar_minha_conta() from public, anon;
-- ...exceto quem está logado
grant execute on function public.apagar_minha_conta() to authenticated;