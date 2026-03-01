export const ALUNO_STATUS_LABELS = {
    ativo: 'Ativo',
    inativo: 'Inativo',
    bloqueado: 'Bloqueado',
    cancelado: 'Cancelado',
} as const

export const CONTRATO_STATUS_LABELS = {
    ativo: 'Ativo',
    vencendo: 'Vencendo',
    vencido: 'Vencido',
    cancelado: 'Cancelado',
    bloqueado: 'Bloqueado',
} as const

export const CANDIDATO_STATUS_LABELS = {
    aguardando: 'Aguardando avaliação',
    aprovado: 'Aprovado',
    reprovado: 'Reprovado',
} as const

export const AULA_STATUS_LABELS = {
    agendada: 'Agendada',
    em_andamento: 'Em andamento',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
} as const

export const TIPO_AULA_LABELS = {
    tecnico: 'Treino Técnico',
    condicionamento: 'Condicionamento',
    sparring: 'Sparring',
    interclasse: 'Interclasse',
    livre: 'Livre',
} as const

export const PAGAMENTO_STATUS_LABELS = {
    pago: 'Pago',
    pendente: 'Pendente',
    vencido: 'Vencido',
    cancelado: 'Cancelado',
} as const

export const CORES_STATUS = {
    ativo: 'green',
    inativo: 'gray',
    bloqueado: 'red',
    cancelado: 'gray',
    vencendo: 'yellow',
    vencido: 'red',
    aguardando: 'yellow',
    aprovado: 'green',
    reprovado: 'red',
    pago: 'green',
    pendente: 'yellow',
    agendada: 'blue',
    em_andamento: 'green',
    concluida: 'gray',
} as const
