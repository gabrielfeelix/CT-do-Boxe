type Variant = 'ativo' | 'inativo' | 'bloqueado' | 'cancelado' | 'vencendo' | 'vencido' | 'aprovado' | 'reprovado' | 'aguardando' | 'pago' | 'pendente' | 'agendada' | 'concluida'

interface StatusBadgeProps {
    status: Variant | string
    size?: 'sm' | 'md'
}

const config: Record<string, { label: string; className: string }> = {
    ativo: { label: 'Ativo', className: 'bg-green-50 text-green-700 ring-green-200' },
    inativo: { label: 'Inativo', className: 'bg-gray-100 text-gray-600 ring-gray-200' },
    bloqueado: { label: 'Bloqueado', className: 'bg-red-50 text-red-700 ring-red-200' },
    cancelado: { label: 'Cancelado', className: 'bg-gray-100 text-gray-500 ring-gray-200' },
    vencendo: { label: 'Vencendo', className: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
    vencido: { label: 'Vencido', className: 'bg-red-50 text-red-700 ring-red-200' },
    aprovado: { label: 'Aprovado', className: 'bg-green-50 text-green-700 ring-green-200' },
    reprovado: { label: 'Reprovado', className: 'bg-red-50 text-red-700 ring-red-200' },
    aguardando: { label: 'Aguardando', className: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
    pago: { label: 'Pago', className: 'bg-green-50 text-green-700 ring-green-200' },
    pendente: { label: 'Pendente', className: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
    agendada: { label: 'Agendada', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
    concluida: { label: 'Concluída', className: 'bg-gray-100 text-gray-600 ring-gray-200' },
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const item = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 ring-gray-200' }

    return (
        <span
            className={`
        inline-flex items-center font-semibold rounded-full ring-1
        ${size === 'sm' ? 'px-2 py-0.5 text-[10px] uppercase tracking-wider' : 'px-2.5 py-1 text-xs'}
        ${item.className}
      `}
        >
            {item.label}
        </span>
    )
}
