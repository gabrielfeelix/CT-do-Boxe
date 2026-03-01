-- Migration 006: Remover planos que nao devem existir no fluxo atual
-- Remove: Mensal (180), Trimestral, Semestral e Anual

DELETE FROM planos
WHERE nome IN ('Mensal', 'Trimestral', 'Semestral', 'Anual')
  AND id NOT IN (
    SELECT DISTINCT plano_id
    FROM contratos
    WHERE plano_id IS NOT NULL
  );
