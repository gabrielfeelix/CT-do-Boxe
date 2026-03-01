-- Migration: Adicionar categorização às aulas
-- Data: 2026-02-28
-- Descrição: Adiciona campos categoria, tipo_aula e serie_id para aulas recorrentes

-- Adicionar campo categoria (infantil/adulto/todos)
ALTER TABLE aulas
ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'todos'
  CHECK (categoria IN ('infantil', 'adulto', 'todos'));

-- Adicionar campo tipo_aula (grupo/individual)
ALTER TABLE aulas
ADD COLUMN IF NOT EXISTS tipo_aula TEXT DEFAULT 'grupo'
  CHECK (tipo_aula IN ('grupo', 'individual'));

-- Adicionar campo serie_id para agrupar aulas recorrentes
ALTER TABLE aulas
ADD COLUMN IF NOT EXISTS serie_id UUID DEFAULT NULL;

-- Criar índice para melhorar performance de queries por série
CREATE INDEX IF NOT EXISTS idx_aulas_serie ON aulas(serie_id);

-- Criar índice para filtros por categoria
CREATE INDEX IF NOT EXISTS idx_aulas_categoria ON aulas(categoria);

-- Criar índice para filtros por tipo
CREATE INDEX IF NOT EXISTS idx_aulas_tipo ON aulas(tipo_aula);

COMMENT ON COLUMN aulas.categoria IS 'Categoria da aula: infantil, adulto ou todos';
COMMENT ON COLUMN aulas.tipo_aula IS 'Tipo de acesso: grupo (padrão) ou individual (pago extra)';
COMMENT ON COLUMN aulas.serie_id IS 'ID da série para aulas recorrentes (mesmo horário toda semana)';
