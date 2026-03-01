const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Gafe362215.@db.reqhddvgquiomxvqvcdn.supabase.co:5432/postgres',
});

const sql = `
-- ─── Avaliações físicas ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  candidato_id UUID REFERENCES candidatos(id), -- se veio do processo seletivo
  tipo TEXT NOT NULL DEFAULT 'entrada'
    CHECK (tipo IN ('entrada', 'progresso', 'saída')),
  status TEXT NOT NULL DEFAULT 'agendada'
    CHECK (status IN ('agendada', 'concluida', 'cancelada')),
  data_avaliacao DATE,
  avaliador TEXT DEFAULT 'Argel Riboli',

  -- Dados antropométricos
  peso_kg NUMERIC(5,2),
  altura_cm NUMERIC(5,1),
  imc NUMERIC(4,2),             -- calculado automaticamente
  bf_percentual NUMERIC(4,1),   -- gordura corporal %
  massa_muscular_kg NUMERIC(5,2),

  -- Medidas corporais (cm)
  med_peito NUMERIC(5,1),
  med_cintura NUMERIC(5,1),
  med_quadril NUMERIC(5,1),
  med_braco_d NUMERIC(5,1),
  med_braco_e NUMERIC(5,1),
  med_coxa_d NUMERIC(5,1),
  med_coxa_e NUMERIC(5,1),

  -- Testes de condicionamento
  test_flexao_30s INTEGER,      -- flexões em 30 segundos
  test_burpee_1min INTEGER,     -- burpees em 1 minuto
  test_cooper_metros INTEGER,   -- metros no teste Cooper (12min)
  test_pular_corda_min NUMERIC(4,1), -- minutos pulando corda sem parar

  -- Avaliação técnica de boxe (0–5 por item)
  tec_postura INTEGER CHECK (tec_postura BETWEEN 0 AND 5),
  tec_jab INTEGER CHECK (tec_jab BETWEEN 0 AND 5),
  tec_direto INTEGER CHECK (tec_direto BETWEEN 0 AND 5),
  tec_gancho INTEGER CHECK (tec_gancho BETWEEN 0 AND 5),
  tec_uppercut INTEGER CHECK (tec_uppercut BETWEEN 0 AND 5),
  tec_defesa INTEGER CHECK (tec_defesa BETWEEN 0 AND 5),
  tec_footwork INTEGER CHECK (tec_footwork BETWEEN 0 AND 5),
  nota_tecnica_geral NUMERIC(3,1), -- média dos tec_*

  -- Resultado
  resultado TEXT CHECK (resultado IN ('aprovado', 'aprovado_condicional', 'reprovado', 'pendente')),
  observacoes TEXT,
  proximos_passos TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'avaliacoes' AND policyname = 'Admin autenticado pode tudo em avaliacoes'
    ) THEN
        CREATE POLICY "Admin autenticado pode tudo em avaliacoes" ON avaliacoes FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END
$$;

DROP TRIGGER IF EXISTS avaliacoes_updated_at ON avaliacoes;
CREATE TRIGGER avaliacoes_updated_at
  BEFORE UPDATE ON avaliacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── View: progresso do aluno (comparativo entre avaliações) ─────────────────
CREATE OR REPLACE VIEW progresso_alunos AS
SELECT
  av.*,
  a.nome AS aluno_nome,
  a.email AS aluno_email,
  -- Pega a avaliação mais antiga para calcular delta
  FIRST_VALUE(av.peso_kg) OVER (
    PARTITION BY av.aluno_id ORDER BY av.data_avaliacao ASC
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS peso_inicial,
  FIRST_VALUE(av.bf_percentual) OVER (
    PARTITION BY av.aluno_id ORDER BY av.data_avaliacao ASC
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS bf_inicial,
  ROW_NUMBER() OVER (
    PARTITION BY av.aluno_id ORDER BY av.data_avaliacao ASC
  ) AS numero_avaliacao
FROM avaliacoes av
JOIN alunos a ON a.id = av.aluno_id
WHERE av.status = 'concluida';
`;

async function main() {
    try {
        await client.connect();
        console.log('Deploying Fase 7...');
        await client.query(sql);
        console.log('Success.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

main();
