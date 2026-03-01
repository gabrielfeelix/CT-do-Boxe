-- ============================================
-- INSERIR PLANOS INICIAIS - CT BOXE
-- Data: 2026-02-28
-- ============================================
-- Os 4 planos do sistema:
-- 1. Mensal Grupo - PIX (sem renovação): R$ 230,00
-- 2. Mensal Grupo - Recorrente (com renovação): R$ 195,90
-- 3. Mensal Individual - PIX (sem renovação): R$ 330,00
-- 4. Mensal Individual - Recorrente (com renovação): R$ 295,90
-- ============================================

-- Limpar planos existentes (CUIDADO: use apenas em desenvolvimento)
-- DELETE FROM planos;

-- 1️⃣ PLANO GRUPO - PIX (sem renovação automática)
INSERT INTO planos (
  nome,
  tipo,
  valor,
  descricao,
  ativo,
  recorrencia_automatica,
  tipo_acesso,
  mercadopago_plan_id
) VALUES (
  'Mensal Grupo - PIX',
  'mensal',
  230.00,
  'Plano mensal com acesso às aulas em grupo. Pagamento via PIX à vista.',
  true,
  false,
  'grupo',
  NULL
) ON CONFLICT DO NOTHING;

-- 2️⃣ PLANO GRUPO - RECORRENTE (com renovação automática)
INSERT INTO planos (
  nome,
  tipo,
  valor,
  descricao,
  ativo,
  recorrencia_automatica,
  tipo_acesso,
  mercadopago_plan_id
) VALUES (
  'Mensal Grupo - Recorrente',
  'mensal',
  195.90,
  'Plano mensal com acesso às aulas em grupo. Renovação automática via Mercado Pago (cartão de crédito).',
  true,
  true,
  'grupo',
  NULL
) ON CONFLICT DO NOTHING;

-- 3️⃣ PLANO INDIVIDUAL - PIX (sem renovação automática)
INSERT INTO planos (
  nome,
  tipo,
  valor,
  descricao,
  ativo,
  recorrencia_automatica,
  tipo_acesso,
  mercadopago_plan_id
) VALUES (
  'Mensal Individual - PIX',
  'mensal',
  330.00,
  'Plano mensal com aulas individuais (personal). Pagamento via PIX à vista.',
  true,
  false,
  'individual',
  NULL
) ON CONFLICT DO NOTHING;

-- 4️⃣ PLANO INDIVIDUAL - RECORRENTE (com renovação automática)
INSERT INTO planos (
  nome,
  tipo,
  valor,
  descricao,
  ativo,
  recorrencia_automatica,
  tipo_acesso,
  mercadopago_plan_id
) VALUES (
  'Mensal Individual - Recorrente',
  'mensal',
  295.90,
  'Plano mensal com aulas individuais (personal). Renovação automática via Mercado Pago (cartão de crédito).',
  true,
  true,
  'individual',
  NULL
) ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICAR PLANOS INSERIDOS
-- ============================================
SELECT
  nome,
  tipo,
  valor,
  tipo_acesso,
  recorrencia_automatica,
  ativo
FROM planos
ORDER BY tipo_acesso, valor DESC;

-- ============================================
-- FIM
-- ============================================
