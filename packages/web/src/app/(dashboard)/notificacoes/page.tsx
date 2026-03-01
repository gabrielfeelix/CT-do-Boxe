'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Bell, BellDot, CalendarClock, CreditCard, ShieldAlert, Megaphone, Trash2, CheckCheck, Check, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useNotificacoes, type NotificacaoItem } from '@/hooks/useNotificacoes'

type Filtro = 'todas' | 'nao_lidas'

const TIPO_META: Record<string, { label: string; icon: React.ElementType; tone: string }> = {
    aula: {
        label: 'Aulas',
        icon: CalendarClock,
        tone: 'bg-orange-100 text-orange-700 border-orange-200',
    },
    pagamento: {
        label: 'Financeiro',
        icon: CreditCard,
        tone: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    ct: {
        label: 'CT',
        icon: BellDot,
        tone: 'bg-red-100 text-red-700 border-red-200',
    },
    sistema: {
        label: 'Sistema',
        icon: ShieldAlert,
        tone: 'bg-slate-100 text-slate-700 border-slate-200',
    },
}

function obterMeta(tipo: string) {
    return TIPO_META[tipo] ?? {
        label: 'Geral',
        icon: Megaphone,
        tone: 'bg-gray-100 text-gray-700 border-gray-200',
    }
}

function formatarMomento(valor: string) {
    const data = new Date(valor)
    if (Number.isNaN(data.getTime())) return '-'

    const diffMs = Date.now() - data.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHora = Math.floor(diffMs / 3600000)
    const diffDia = Math.floor(diffMs / 86400000)

    if (diffMin < 1) return 'agora'
    if (diffMin < 60) return `${diffMin} min`
    if (diffHora < 24) return `${diffHora} h`
    if (diffDia < 7) return `${diffDia} d`

    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

function NotificacaoCard({
    item,
    processando,
    onToggleLida,
    onRemover,
}: {
    item: NotificacaoItem
    processando: boolean
    onToggleLida: (item: NotificacaoItem) => Promise<void>
    onRemover: (id: string) => Promise<void>
}) {
    const meta = obterMeta(item.tipo)
    const Icon = meta.icon

    return (
        <article
            className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 ${
                item.lida
                    ? 'border-gray-100 bg-white'
                    : 'border-red-200 bg-gradient-to-r from-red-50/80 to-orange-50/50'
            }`}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${meta.tone}`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {meta.label}
                        </span>
                        {!item.lida && (
                            <span className="rounded-full bg-[#CC0000] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                Nova
                            </span>
                        )}
                        <span className="text-xs font-semibold text-gray-400">{formatarMomento(item.created_at)}</span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900">{item.titulo}</h3>
                    {item.subtitulo && <p className="mt-0.5 text-sm font-semibold text-gray-600">{item.subtitulo}</p>}
                    {item.mensagem && (
                        <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">{item.mensagem}</p>
                    )}
                    {item.aluno?.nome && (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Aluno: {item.aluno.nome}
                        </p>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {item.link && (
                        <Link
                            href={item.link}
                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            Abrir
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                    )}
                    <button
                        onClick={() => onToggleLida(item)}
                        disabled={processando}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        <Check className="h-3.5 w-3.5" />
                        {item.lida ? 'Marcar nova' : 'Marcar lida'}
                    </button>
                    <button
                        onClick={() => onRemover(item.id)}
                        disabled={processando}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remover
                    </button>
                </div>
            </div>
        </article>
    )
}

export default function NotificacoesPage() {
    const {
        notificacoes,
        loading,
        error,
        naoLidas,
        marcarComoLida,
        marcarTodasComoLidas,
        removerNotificacao,
    } = useNotificacoes()

    const [busca, setBusca] = useState('')
    const [filtro, setFiltro] = useState<Filtro>('todas')
    const [processandoId, setProcessandoId] = useState<string | null>(null)
    const [processandoTudo, setProcessandoTudo] = useState(false)

    const listaFiltrada = useMemo(() => {
        const termo = busca.trim().toLowerCase()

        return notificacoes.filter((item) => {
            if (filtro === 'nao_lidas' && item.lida) return false

            if (!termo) return true

            const alvo = [item.titulo, item.subtitulo, item.mensagem, item.aluno?.nome]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()

            return alvo.includes(termo)
        })
    }, [notificacoes, filtro, busca])

    async function handleToggleLida(item: NotificacaoItem) {
        setProcessandoId(item.id)
        const ok = await marcarComoLida(item.id, !item.lida)
        setProcessandoId(null)

        if (!ok) {
            toast.error('Não foi possível atualizar esta notificacao.')
            return
        }

        toast.success(item.lida ? 'Notificacao marcada como nova.' : 'Notificacao marcada como lida.')
    }

    async function handleMarcarTodas() {
        setProcessandoTudo(true)
        const ok = await marcarTodasComoLidas()
        setProcessandoTudo(false)

        if (!ok) {
            toast.error('Erro ao marcar notificacoes.')
            return
        }

        toast.success('Todas as notificacoes foram marcadas como lidas.')
    }

    async function handleRemover(id: string) {
        setProcessandoId(id)
        const ok = await removerNotificacao(id)
        setProcessandoId(null)

        if (!ok) {
            toast.error('Não foi possível remover a notificacao.')
            return
        }

        toast.success('Notificacao removida.')
    }

    return (
        <div className="mx-auto max-w-[1440px] space-y-6 pb-8">
            <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-400/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-14 left-10 h-36 w-36 rounded-full bg-red-400/20 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-gray-900">
                            <Bell className="h-6 w-6 text-[#CC0000]" />
                            Central de Notificacoes
                        </h2>
                        <p className="mt-1 text-sm font-medium text-gray-500">
                            Acompanhe avisos criticos de aulas, financeiro e sistema.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-red-600">Nao lidas</span>
                        <span className="text-lg font-black text-red-700">{naoLidas}</span>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 items-center gap-2">
                        <input
                            value={busca}
                            onChange={(event) => setBusca(event.target.value)}
                            placeholder="Buscar por titulo, aluno ou mensagem..."
                            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 text-sm font-medium text-gray-800 outline-none transition-all focus:border-[#CC0000] focus:bg-white focus:ring-2 focus:ring-[#CC0000]/20"
                        />
                        <div className="hidden items-center gap-2 sm:flex">
                            <button
                                onClick={() => setFiltro('todas')}
                                className={`h-10 rounded-xl px-4 text-xs font-bold uppercase tracking-wider transition-colors ${
                                    filtro === 'todas'
                                        ? 'bg-gray-900 text-white'
                                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                Todas
                            </button>
                            <button
                                onClick={() => setFiltro('nao_lidas')}
                                className={`h-10 rounded-xl px-4 text-xs font-bold uppercase tracking-wider transition-colors ${
                                    filtro === 'nao_lidas'
                                        ? 'bg-[#CC0000] text-white'
                                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                Nao lidas
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleMarcarTodas}
                        disabled={naoLidas === 0 || processandoTudo}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Marcar todas
                    </button>
                </div>
            </section>

            {loading ? (
                <LoadingSpinner label="Carregando notificacoes..." />
            ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
            ) : listaFiltrada.length === 0 ? (
                <EmptyState
                    icon={Bell}
                    title="Sem notificacoes por aqui"
                    description="Nenhum item combina com os filtros atuais."
                />
            ) : (
                <div className="space-y-4">
                    {listaFiltrada.map((item) => (
                        <NotificacaoCard
                            key={item.id}
                            item={item}
                            processando={processandoId === item.id}
                            onToggleLida={handleToggleLida}
                            onRemover={handleRemover}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
