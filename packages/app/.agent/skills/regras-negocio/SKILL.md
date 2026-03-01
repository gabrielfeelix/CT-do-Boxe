---
name: regras-negocio
description: Use quando o usuário pedir cálculos financeiros, projeções,
lógica de parcelamento, recorrência, saldo ou qualquer regra de negócio
do KITAMO.
---

# Skill: Regras de Negócio KITAMO

## Consulte
Leia `docs/conceitos.md` para as distinções conceituais do sistema.

## Regras Críticas

### Contas vs Cartões
- Contas = dinheiro que você TEM (corrente, poupança, investimento)
- Cartões = dívida futura com limite e fatura
- Nunca misturar os dois no mesmo cálculo de saldo

### Investimentos
- NÃO são despesas
- Transferência para investimento ≠ saída de dinheiro
- Aparecem no patrimônio, não no fluxo de caixa negativo

### Parcelamento vs Recorrência
- ParcelamentoGrupo: N parcelas com fim definido (iPhone 12x)
- RecorrenciaGrupo: repetição indefinida (Netflix, aluguel)
- Edição: "só esta" / "esta e próximas" / "todas"

### Projeção
- ProjecaoService calcula 30 dias à frente
- Considera: transações futuras agendadas + recorrências ativas
- Resultado: saldo projetado dia a dia
- É o CORE do produto — sempre preservar essa lógica
