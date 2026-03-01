'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CalendarCheck2, ChevronRight, Clock, Users, Search, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatters'
import { useAulas } from '@/hooks/useAulas'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'

export default function PresencaPage() {
    const hoje = new Date().toISOString().slice(0, 10)
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() + 7)

    const [busca, setBusca] = useState('')

    const { aulas, loading, error } = useAulas({
        status: 'agendada',
        dataInicio: hoje,
        dataFim: dataLimite.toISOString().slice(0, 10),
        limit: 50,
    })

    const proximasAulas = useMemo(() => {
        return aulas
            .filter(a => a.titulo.toLowerCase().includes(busca.toLowerCase()) || a.professor.toLowerCase().includes(busca.toLowerCase()))
            .sort((a, b) => {
                const first = new Date(`${a.data}T${a.hora_inicio}`).getTime()
                const second = new Date(`${b.data}T${b.hora_inicio}`).getTime()
                return first - second
            })
    }, [aulas, busca])

    return (
        <div className="mx-auto max-w-[1440px] space-y-6 pb-8 animate-in slide-in-from-bottom-2 duration-300">
            <header className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 flex gap-2 items-center">
                        <CalendarCheck2 className="w-6 h-6 text-[#CC0000]" /> Diário de Classe
                    </h2>
                    <p className="mt-1 text-sm font-medium text-gray-400">
                        Selecione a aula abaixo para realizar a chamada linear dos alunos.
                    </p>
                </div>

                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por turma ou professor..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-colors shadow-sm font-medium"
                    />
                </div>
            </header>

            {loading ? (
                <div className="pt-10"><LoadingSpinner label="Carregando turmas agendadas..." /></div>
            ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
            ) : proximasAulas.length === 0 ? (
                <EmptyState
                    icon={CalendarCheck2}
                    title="Nenhuma aula encontrada"
                    description="Não identificamos turmas agendadas para os próximos dias com este filtro."
                />
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Informações da Aula</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">Horário</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Professor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Ocupação</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {proximasAulas.map((aula) => {
                                const ocupacao = aula.capacidade_maxima > 0 ? (aula.total_agendados / aula.capacidade_maxima) * 100 : 0;
                                const isCheio = ocupacao >= 100;

                                return (
                                    <tr key={aula.id} className="hover:bg-red-50/30 transition-colors group cursor-default">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-red-600 uppercase tracking-widest mb-0.5">{formatDate(aula.data)}</span>
                                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-700 transition-colors leading-tight">{aula.titulo}</h3>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="font-mono text-gray-900 font-bold tracking-tighter">{aula.hora_inicio.slice(0, 5)}</span>
                                                <span className="text-gray-400">-</span>
                                                <span className="font-mono text-gray-500 tracking-tighter">{aula.hora_fim.slice(0, 5)}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1 w-fit">
                                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="font-semibold text-gray-700">{aula.professor}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center justify-between w-full max-w-[120px] mb-1.5 px-0.5">
                                                    <span className="text-[10px] font-black uppercase text-gray-400">Conf.</span>
                                                    <span className={`text-xs font-black ${isCheio ? 'text-red-600' : 'text-emerald-600'}`}>
                                                        {aula.total_agendados}/{aula.capacidade_maxima}
                                                    </span>
                                                </div>
                                                <div className="w-full max-w-[120px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all ${isCheio ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(ocupacao, 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/presenca/${aula.id}`} className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold hover:bg-[#CC0000] hover:text-white hover:border-[#CC0000] px-4 py-2 rounded-xl transition-all shadow-sm text-xs uppercase tracking-widest whitespace-nowrap">
                                                Abrir Diário <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
