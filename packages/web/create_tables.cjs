const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Gafe362215.@db.reqhddvgquiomxvqvcdn.supabase.co:5432/postgres',
});

const sql = `
-- ─── Planos ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  valor_mensal NUMERIC(10, 2) NOT NULL,
  tipo TEXT CHECK (tipo IN ('mensal', 'trimestral', 'semestral', 'anual')),
  max_aulas_semana INTEGER DEFAULT 3,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Contratos ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  plano_id UUID REFERENCES planos(id),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento BETWEEN 1 AND 31),
  valor NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado', 'finalizado')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Pagamentos / Financeiro ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,
  descricao TEXT,
  valor NUMERIC(10, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  metodo TEXT CHECK (metodo IN ('PIX', 'CARTAO', 'DINHEIRO', 'BOLETO')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  comprovante_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Aulas ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL DEFAULT 'Treino Completo',
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  professor TEXT DEFAULT 'Argel Riboli',
  capacidade_maxima INTEGER DEFAULT 16,
  status TEXT DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Presenças ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS presencas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID REFERENCES aulas(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'presente', 'falta', 'cancelada')),
  data_checkin TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure RLS is enabled and accessible for authenticated users
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'planos' AND policyname = 'Admin autenticado pode tudo') THEN
        CREATE POLICY "Admin autenticado pode tudo" ON planos FOR ALL USING (auth.role() = 'authenticated');
        CREATE POLICY "Admin autenticado pode tudo" ON contratos FOR ALL USING (auth.role() = 'authenticated');
        CREATE POLICY "Admin autenticado pode tudo" ON pagamentos FOR ALL USING (auth.role() = 'authenticated');
        CREATE POLICY "Admin autenticado pode tudo" ON aulas FOR ALL USING (auth.role() = 'authenticated');
        CREATE POLICY "Admin autenticado pode tudo" ON presencas FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;
`;

async function main() {
    try {
        await client.connect();
        console.log('Criando tabelas que ficaram faltando nas Fases 4 e 5...');
        await client.query(sql);
        console.log('Tabelas criadas com sucesso!');
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await client.end();
    }
}

main();
