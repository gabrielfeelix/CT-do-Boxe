'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarPlus2, Calendar as CalendarIcon, Clock, Users, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAulas, type AulaResumo } from '@/hooks/useAulas'
import { AulaFilters } from '@/components/aulas/AulaFilters'
import { CancelarAulaModal } from '@/components/aulas/CancelarAulaModal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { format, parseISO, startOfWeek, addDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AulasPage() {
    const supabase = createClient()
    const [busca, setBusca] = useState('')
    const [status, setStatus] = useState<'todos' | 'agendada' | 'realizada' | 'cancelada'>('todos')
    const [categoria, setCategoria] = useState<'todos' | 'infantil' | 'adulto'>('todos')
    const [professor, setProfessor] = useState('')
    const [dataInicio, setDataInicio] = useState('')
    const [dataFim, setDataFim] = useState('')
    const [aulaCancelamento, setAulaCancelamento] = useState<AulaResumo | null>(null)
    const [cancelando, setCancelando] = useState(false)

    // Pegamos a semana atual como base se não houver filtro de data (para o Weekly Grid)
    const baseDate = dataInicio ? parseISO(dataInicio) : new Date()
    const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 }) // Domingo = 0

    // Gera os 7 dias da semana
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
    }, [weekStart])

    const { aulas, loading, error, total, cancelarAula, refetch } = useAulas({
        busca,
        status,
        categoria,
        professor,
        dataInicio,
        dataFim,
        limit: 100,
    })

    async function handleConfirmarCancelamento({ motivo, notificarAlunos, scope }: { motivo: string, notificarAlunos: boolean, scope: 'single' | 'future' }) {
        if (!aulaCancelamento) return
        setCancelando(true)
        const resultado = await cancelarAula(aulaCancelamento.id, { scope })

        if (!resultado.ok) {
            toast.error(resultado.error ?? 'Não foi possível cancelar a aula.')
            setCancelando(false)
            return
        }

        if (notificarAlunos) {
            const { data: inscritos } = await supabase.from('presencas').select('aluno_id').eq('aula_id', aulaCancelamento.id)
            if (inscritos && inscritos.length > 0) {
                const notificacoes = inscritos.map((inscrito) => inscrito.aluno_id).filter(Boolean).map((alunoId) => ({
                    aluno_id: alunoId,
                    tipo: 'aula',
                    titulo: 'Aula cancelada',
                    mensagem: motivo ? `A aula "${aulaCancelamento.titulo}" foi cancelada. Motivo: ${motivo}` : `A aula "${aulaCancelamento.titulo}" foi cancelada.`,
                    lida: false,
                }))
                if (notificacoes.length > 0) await supabase.from('notificacoes').insert(notificacoes)
            }
        }

        toast.success('Aula cancelada com sucesso.')
        setAulaCancelamento(null)
        setCancelando(false)
        await refetch()
    }

    // Filtra e Agrupa Aulas por Dia
    const getAulasForDay = (date: Date) => {
        return aulas.filter(aula => isSameDay(parseISO(aula.data), date)).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
    }

    return (
        <div className="mx-auto max-w-[1440px] space-y-6 pb-8 animate-in slide-in-from-bottom-2 duration-300">
            <header className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-[#CC0000]" /> Grade de Aulas
                    </h2>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                        {loading ? 'Carregando agenda...' : `Visualizando agenda da semana (${total} aulas encontradas)`}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href="/aulas/series" className="inline-flex h-10 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
                        Gerenciar series
                    </Link>
                    <Link href="/aulas/nova" className="inline-flex h-10 items-center rounded-lg bg-[#CC0000] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#AA0000]">
                        <CalendarPlus2 className="mr-2 h-4 w-4" /> Nova Aula
                    </Link>
                </div>
            </header>

            <AulaFilters
                busca={busca} onBuscaChange={setBusca}
                status={status} onStatusChange={setStatus}
                categoria={categoria} onCategoriaChange={setCategoria}
                professor={professor} onProfessorChange={setProfessor}
                dataInicio={dataInicio} onDataInicioChange={setDataInicio}
                dataFim={dataFim} onDataFimChange={setDataFim}
            />

            {loading ? (
                <LoadingSpinner label="Carregando grade..." />
            ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px] w-full hide-scrollbar overflow-x-auto">
                    {/* Weekly Grid columns */}
                    {weekDays.map((day, ix) => {
                        const dayAulas = getAulasForDay(day)
                        const isToday = isSameDay(day, new Date())

                        return (
                            <div key={ix} className={`flex-1 min-w-[200px] border-r border-gray-100 last:border-r-0 flex flex-col ${isToday ? 'bg-red-50/20' : 'bg-transparent'}`}>
                                {/* Header do Dia */}
                                <div className={`p-4 text-center border-b border-gray-100 ${isToday ? 'border-b-red-200' : ''}`}>
                                    <p className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-red-500' : 'text-gray-400'}`}>
                                        {format(day, 'EEEE', { locale: ptBR })}
                                    </p>
                                    <p className={`text-2xl font-black mt-1 ${isToday ? 'text-red-600' : 'text-gray-900'}`}>
                                        {format(day, 'dd', { locale: ptBR })}
                                    </p>
                                </div>

                                {/* Aulas do Dia */}
                                <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                                    {dayAulas.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center pt-10 opacity-30">
                                            <CalendarIcon className="w-6 h-6 text-gray-400 mb-2" />
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Sem aulas</span>
                                        </div>
                                    ) : (
                                        dayAulas.map(aula => {
                                            const ocupacao = aula.capacidade_maxima > 0 ? (aula.total_agendados / aula.capacidade_maxima) * 100 : 0

                                            return (
                                                <Link href={`/aulas/${aula.id}`} key={aula.id} className="block group">
                                                    <div className={`rounded-xl border p-3 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm text-left ${aula.status === 'cancelada' ? 'bg-gray-50 border-gray-100 opacity-60 grayscale' : 'bg-white border-gray-200 hover:border-red-200 hover:shadow-md'}`}>

                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex gap-1.5 items-center">
                                                                <Clock className={`w-3.5 h-3.5 ${aula.status === 'cancelada' ? 'text-gray-400' : 'text-red-500'}`} />
                                                                <span className="text-xs font-black text-gray-900 tracking-tighter">{aula.hora_inicio.slice(0, 5)}</span>
                                                            </div>
                                                            {aula.status === 'cancelada' && <span className="text-[9px] uppercase font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Canc</span>}
                                                        </div>

                                                        <h4 className="text-sm font-bold text-gray-900 leading-tight mb-2 group-hover:text-red-700 transition-colors line-clamp-2">{aula.titulo}</h4>

                                                        <div className="flex flex-col gap-2 mt-auto">
                                                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                                                <Users className="w-3.5 h-3.5" />
                                                                <span className="truncate max-w-[120px]">{aula.professor}</span>
                                                            </div>
                                                            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 flex justify-between items-center text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                                                <span className="flex items-center gap-1.5"><UserCheck className="w-3 h-3 text-emerald-500" /> {aula.total_agendados}/{aula.capacidade_maxima}</span>
                                                                <span className={ocupacao >= 100 ? 'text-red-500' : 'text-emerald-600'}>{aula.vagas_disponiveis} vagas</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <CancelarAulaModal
                open={Boolean(aulaCancelamento)}
                aulaTitulo={aulaCancelamento?.titulo}
                isRecorrente={Boolean(aulaCancelamento?.serie_id)}
                loading={cancelando}
                onOpenChange={(open) => { if (!open) setAulaCancelamento(null) }}
                onConfirm={handleConfirmarCancelamento}
            />
        </div>
    )
}
