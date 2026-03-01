'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarPlus2, CalendarX2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAulas, type AulaResumo } from '@/hooks/useAulas'
import { AulaFilters } from '@/components/aulas/AulaFilters'
import { AulaCard } from '@/components/aulas/AulaCard'
import { AulaCalendario } from '@/components/aulas/AulaCalendario'
import { CancelarAulaModal } from '@/components/aulas/CancelarAulaModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function AulasPage() {
    const supabase = createClient()
    const [busca, setBusca] = useState('')
    const [status, setStatus] = useState<'todos' | 'agendada' | 'realizada' | 'cancelada'>('todos')
    const [categoria, setCategoria] = useState<'todos' | 'infantil' | 'adulto'>('todos')
    const [dataInicio, setDataInicio] = useState('')
    const [dataFim, setDataFim] = useState('')
    const [aulaCancelamento, setAulaCancelamento] = useState<AulaResumo | null>(null)
    const [cancelando, setCancelando] = useState(false)

    const { aulas, loading, error, total, cancelarAula, refetch } = useAulas({
        busca,
        status,
        categoria,
        dataInicio,
        dataFim,
        limit: 100,
    })

    const agendaSemana = useMemo(() => aulas.filter((item) => item.status === 'agendada').slice(0, 8), [aulas])

    async function handleConfirmarCancelamento({
        motivo,
        notificarAlunos,
        scope,
    }: {
        motivo: string
        notificarAlunos: boolean
        scope: 'single' | 'future'
    }) {
        if (!aulaCancelamento) return

        setCancelando(true)
        const resultado = await cancelarAula(aulaCancelamento.id, { scope })

        if (!resultado.ok) {
            toast.error(resultado.error ?? 'Não foi possível cancelar a aula.')
            setCancelando(false)
            return
        }

        if (notificarAlunos) {
            const { data: inscritos, error: inscritosError } = await supabase
                .from('presencas')
                .select('aluno_id')
                .eq('aula_id', aulaCancelamento.id)

            if (!inscritosError && inscritos && inscritos.length > 0) {
                const notificacoes = inscritos
                    .map((inscrito) => inscrito.aluno_id)
                    .filter(Boolean)
                    .map((alunoId) => ({
                        aluno_id: alunoId,
                        tipo: 'aula',
                        titulo: 'Aula cancelada',
                        mensagem: motivo
                            ? `A aula "${aulaCancelamento.titulo}" foi cancelada. Motivo: ${motivo}`
                            : `A aula "${aulaCancelamento.titulo}" foi cancelada.`,
                        lida: false,
                    }))

                if (notificacoes.length > 0) {
                    const { error: notifyError } = await supabase.from('notificacoes').insert(notificacoes)
                    if (notifyError) {
                        console.error(notifyError)
                        toast.warning('A aula foi cancelada, mas nao foi possivel enviar todas as notificacoes.')
                    }
                }
            }
        }

        toast.success('Aula cancelada com sucesso.')
        setAulaCancelamento(null)
        setCancelando(false)
        await refetch()
    }

    return (
        <div className="mx-auto max-w-[1440px] space-y-6 pb-8">
            <header className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Aulas</h2>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                        {loading ? 'Carregando...' : `${total} aula${total === 1 ? '' : 's'} cadastrada${total === 1 ? '' : 's'}`}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/aulas/series"
                        className="inline-flex h-10 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                        Gerenciar series
                    </Link>
                    <Link
                        href="/aulas/nova"
                        className="inline-flex h-10 items-center rounded-lg bg-[#CC0000] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#AA0000]"
                    >
                        <CalendarPlus2 className="mr-2 h-4 w-4" />
                        Criar aula
                    </Link>
                </div>
            </header>

            <AulaFilters
                busca={busca}
                onBuscaChange={setBusca}
                status={status}
                onStatusChange={setStatus}
                categoria={categoria}
                onCategoriaChange={setCategoria}
                dataInicio={dataInicio}
                onDataInicioChange={setDataInicio}
                dataFim={dataFim}
                onDataFimChange={setDataFim}
            />

            {loading ? (
                <LoadingSpinner label="Carregando aulas..." />
            ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
            ) : aulas.length === 0 ? (
                <EmptyState
                    icon={CalendarX2}
                    title="Nenhuma aula encontrada"
                    description="Ajuste os filtros ou cadastre uma nova aula para iniciar a chamada."
                />
            ) : (
                <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-4">
                        {aulas.map((aula) => (
                            <AulaCard key={aula.id} aula={aula} onCancelar={setAulaCancelamento} />
                        ))}
                    </div>
                    <AulaCalendario aulas={agendaSemana} />
                </div>
            )}

            <CancelarAulaModal
                open={Boolean(aulaCancelamento)}
                aulaTitulo={aulaCancelamento?.titulo}
                isRecorrente={Boolean(aulaCancelamento?.serie_id)}
                loading={cancelando}
                onOpenChange={(open) => {
                    if (!open) setAulaCancelamento(null)
                }}
                onConfirm={handleConfirmarCancelamento}
            />
        </div>
    )
}
