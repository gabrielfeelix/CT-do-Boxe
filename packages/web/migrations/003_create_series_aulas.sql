-- Migration: Criar tabela series_aulas
-- Data: 2026-02-28
-- Descrição: Tabela para gerenciar horários recorrentes (aulas que se repetem toda semana)

CREATE TABLE IF NOT EXISTS series_aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL DEFAULT 'Aula de Boxe',
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=domingo, 1=segunda, ..., 6=sábado
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('infantil', 'adulto', 'todos')),
  tipo_aula TEXT NOT NULL CHECK (tipo_aula IN ('grupo', 'individual')),
  professor TEXT DEFAULT 'Argel Riboli',
  capacidade_maxima INTEGER DEFAULT 16 CHECK (capacidade_maxima > 0),
  ativo BOOLEAN DEFAULT true,
  data_inicio DATE NOT NULL, -- A partir de quando a série começa a valer
  data_fim DATE DEFAULT NULL, -- NULL = infinito, ou data específica para encerrar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_series_dia_semana ON series_aulas(dia_semana);
CREATE INDEX IF NOT EXISTS idx_series_ativo ON series_aulas(ativo) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_series_categoria ON series_aulas(categoria);
CREATE INDEX IF NOT EXISTS idx_series_tipo ON series_aulas(tipo_aula);

-- Comentários
COMMENT ON TABLE series_aulas IS 'Define horários de aulas recorrentes (ex: toda segunda às 18h30)';
COMMENT ON COLUMN series_aulas.dia_semana IS '0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado';
COMMENT ON COLUMN series_aulas.data_inicio IS 'Data a partir da qual as aulas desta série começam a ser geradas';
COMMENT ON COLUMN series_aulas.data_fim IS 'Data de encerramento da série (NULL = sem fim)';
COMMENT ON COLUMN series_aulas.ativo IS 'Se false, não gera novas aulas desta série';
