-- Migration: Adicionar renovação automática aos planos
-- Data: 2026-02-28
-- Descrição: Adiciona campos para planos com assinatura recorrente via Mercado Pago

-- Adicionar campo recorrencia_automatica
ALTER TABLE planos
ADD COLUMN IF NOT EXISTS recorrencia_automatica BOOLEAN DEFAULT false;

-- Adicionar campo tipo_acesso (grupo/individual)
ALTER TABLE planos
ADD COLUMN IF NOT EXISTS tipo_acesso TEXT DEFAULT 'grupo'
  CHECK (tipo_acesso IN ('grupo', 'individual'));

-- Adicionar campo para armazenar ID do plano de assinatura do Mercado Pago
ALTER TABLE planos
ADD COLUMN IF NOT EXISTS mercadopago_plan_id TEXT DEFAULT NULL;

-- Criar índice para queries por tipo de acesso
CREATE INDEX IF NOT EXISTS idx_planos_tipo_acesso ON planos(tipo_acesso);

-- Criar índice para planos recorrentes
CREATE INDEX IF NOT EXISTS idx_planos_recorrentes ON planos(recorrencia_automatica) WHERE recorrencia_automatica = true;

COMMENT ON COLUMN planos.recorrencia_automatica IS 'Se true, cobra automaticamente todo mês via Mercado Pago';
COMMENT ON COLUMN planos.tipo_acesso IS 'grupo: aulas em grupo | individual: aulas individuais (personal)';
COMMENT ON COLUMN planos.mercadopago_plan_id IS 'ID do plano de assinatura criado no Mercado Pago (PreApprovalPlan)';
