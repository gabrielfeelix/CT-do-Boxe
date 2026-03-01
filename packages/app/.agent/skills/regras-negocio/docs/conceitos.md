# Conceitos de Negócio KITAMO

## Entidades Principais

### Transação (Transaction)
- A unidade básica de movimentação financeira.
- Pode ser receita, despesa ou transferência.
- Tem data, valor, descrição e categoria.
- Pode estar vinculada a uma conta ou fatura de cartão.

### Conta (Account)
- Local onde o dinheiro reside.
- Tipos: Corrente, Poupança, Investimento, Dinheiro.
- Tem saldo atual real.

### Cartão de Crédito (CreditCard)
- Instrumento de crédito com limite e vencimento.
- Gera faturas (Invoices).
- O pagamento da fatura é uma despesa da conta corrente.

### Recorrência (Recurrence)
- Modelo para gerar transações futuras.
- Tipos: Mensal, Quinzenal, Semanal, Anual.
- Gera transações "fantasmas" na projeção até serem efetivadas.

### Parcelamento (Installment)
- Compra única dividida em N vezes.
- Gera N transações vinculadas a um grupo de parcelamento.
- Comum em cartões de crédito.

## Lógica de Projeção (ProjecaoService)
1. Pega o saldo atual de todas as contas.
2. Itera dia a dia pelos próximos 30 dias.
3. Soma receitas previstas.
4. Subtrai despesas previstas (agendadas e recorrentes).
5. Plota o gráfico de "Saldo no Fim do Dia".
6. Objetivo: Avisar se o saldo vai ficar negativo em algum momento.
