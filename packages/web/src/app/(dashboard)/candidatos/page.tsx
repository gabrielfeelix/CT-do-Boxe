'use client'

import { useState } from 'react'
import { useCandidatos } from '@/hooks/useCandidatos'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { Users, Filter } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatters'
import Link from 'next/link'

const STATUS_OPTIONS = [
    { value: 'todos', label: 'Todos' },
    { value: 'aguardando', label: 'Aguardando' },
    { value: 'aprovado', label: 'Aprovados' },
    { value: 'reprovado', label: 'Reprovados' },
]

const EXPERIENCIA_LABELS: Record<string, string> = {
    nenhuma: 'Sem experiência',
    iniciante: 'Iniciante',
    intermediario: 'Intermediário',
    avancado: 'Avançado',
}

export default function CandidatosPage() {
    const [statusFiltro, setStatusFiltro] = useState('todos')
    const { candidatos, loading, total, pendentes } = useCandidatos({ status: statusFiltro })

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto pb-8 animate-in slide-in-from-bottom-2 duration-500">
            {/* Header Premium */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#CC0000]" /> Processo Seletivo
                    </h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {loading ? 'Carregando...' : `${total} candidato${total !== 1 ? 's' : ''} na base`}
                    </p>
                </div>
                {pendentes > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2.5 rounded-xl shadow-sm text-sm font-bold animate-pulse">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                        {pendentes} Aguardando Avaliação
                    </div>
                )}
            </div>

            {/* Alerta de pendentes em card destacado */}
            {pendentes > 0 && statusFiltro === 'todos' && !loading && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50/50 border border-yellow-200/60 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 blur-[80px] opacity-20 pointer-events-none" />
                    <div className="bg-yellow-100 p-2.5 rounded-full shrink-0 relative z-10">
                        <Users className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-base font-black text-yellow-900 tracking-tight">
                            Ação Requirida: {pendentes} candidato{pendentes > 1 ? 's novos na fila' : ' novo na fila'}
                        </h4>
                        <p className="text-sm font-medium text-yellow-800/80 mt-0.5 leading-relaxed">
                            Ninguém entra no CT sem a sua aprovação. Avalie as fichas de inscrição para criar as contas e liberar o app.
                        </p>
                    </div>
                    <div className="relative z-10 sm:ml-auto w-full sm:w-auto mt-2 sm:mt-0">
                        <button onClick={() => setStatusFiltro('aguardando')} className="w-full sm:w-auto px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold text-sm rounded-lg transition-colors shadow-sm">
                            Avaliar Agora
                        </button>
                    </div>
                </div>
            )}

            {/* Filtros em Pílulas */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                <div className="flex items-center gap-2 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100 w-fit shrink-0">
                    {STATUS_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setStatusFiltro(opt.value)}
                            className={`
                px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2
                ${statusFiltro === opt.value
                                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60'
                                    : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900 border border-transparent'
                                }
                `}
                        >
                            {opt.value === 'aguardando' && <div className={`w-2 h-2 rounded-full ${statusFiltro === opt.value ? 'bg-yellow-400' : 'bg-gray-300'}`} />}
                            {opt.label}
                        </button>
                    ))}
                </div>
                <div className="h-6 w-px bg-gray-200 hidden sm:block mx-1" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:flex items-center gap-1.5 shrink-0"><Filter className="w-3.5 h-3.5" /> Filtros Rápidos</p>
            </div>

            {/* Lista */}
            {loading ? <LoadingSpinner label="Buscando fichas do processo seletivo..." /> :
                candidatos.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title={statusFiltro === 'todos' ? "Nenhuma inscrição recebida" : "Sem candidatos nesta visão"}
                        description={statusFiltro === 'todos' ? "Quando alguém tentar se inscrever pelo app, a solicitação aparecerá aqui." : "Altere o filtro acima para ver outras fichas."}
                    />
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50/80">
                        {candidatos.map(c => (
                            <Link
                                href={`/candidatos/${c.id}`}
                                key={c.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-gray-50/80 transition-colors group cursor-pointer gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#CC0000]/10 group-hover:text-[#CC0000] border border-gray-200 group-hover:border-[#CC0000]/20 transition-all shrink-0">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-base font-black text-gray-900 group-hover:text-[#CC0000] transition-colors leading-tight">{c.nome}</p>
                                            {c.status === 'aguardando' && <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-sm" title="Aguardando Avaliação" />}
                                        </div>
                                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{c.email}</p>
                                            {c.telefone && <p className="text-xs font-bold text-gray-400 uppercase tracking-widest block sm:inline-block border-l border-gray-200 pl-3">{c.telefone}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-4 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                    <div className="hidden md:block text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nível Informado</p>
                                        <p className="text-sm font-bold text-gray-800">{EXPERIENCIA_LABELS[c.experiencia_previa ?? ''] ?? '—'}</p>
                                    </div>
                                    <div className="hidden lg:block text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Aplicou em</p>
                                        <p className="text-sm font-bold text-gray-700">{formatDate(c.created_at).slice(0, 5)} as {new Date(c.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        <StatusBadge status={c.status} />
                                        <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 group-hover:border-gray-300 group-hover:bg-gray-50 transition-colors shadow-sm ml-2">
                                            {c.status === 'aguardando' ? 'Avaliar Ficha →' : 'Ver Detalhes →'}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )
            }
        </div>
    )
}
