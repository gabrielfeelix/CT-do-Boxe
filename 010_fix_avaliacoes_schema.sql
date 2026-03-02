-- Correção da tabela de avaliações para evitar erro 400
ALTER TABLE IF EXISTS avaliacoes 
ADD COLUMN IF NOT EXISTS peso NUMERIC,
ADD COLUMN IF NOT EXISTS altura NUMERIC,
ADD COLUMN IF NOT EXISTS gordura_corporal NUMERIC,
ADD COLUMN IF NOT EXISTS massa_magra NUMERIC,
ADD COLUMN IF NOT EXISTS medidas_json JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS testes_condicionamento JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS nota_tecnica_geral INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS observacoes_instrutor TEXT,
ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'entrada', -- 'entrada' ou 'periódica'
ADD COLUMN IF NOT EXISTS candidato_id UUID REFERENCES candidatos(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS questoes_json JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_avaliacoes_candidato ON avaliacoes(candidato_id);
