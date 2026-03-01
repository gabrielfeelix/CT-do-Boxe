-- Migration 005: Adicionar colunas de historico de treino em alunos
-- Necessario para consultas em aulas/presenca/dashboard

ALTER TABLE alunos
ADD COLUMN IF NOT EXISTS ultimo_treino DATE;

ALTER TABLE alunos
ADD COLUMN IF NOT EXISTS total_treinos INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_alunos_ultimo_treino ON alunos(ultimo_treino);
