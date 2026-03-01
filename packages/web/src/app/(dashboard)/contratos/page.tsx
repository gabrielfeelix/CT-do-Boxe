'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FilePlus, FileText, ChevronRight, AlertCircle } from 'lucide-react'
import { useContratos } from '@/hooks/useContratos'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AvatarInitials } from '@/components/shared/AvatarInitials'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils/formatters'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = [
    { value: 'todos', label: 'Todos' },
    { value: 'ativo', label: 'Ativos' },
    { value: 'vencendo', label: 'Vencendo' },
    { value: 'vencido', label: 'Vencidos' },
    { value: 'bloqueado', label: 'Bloqueados' },
    { value: 'cancelado', label: 'Cancelados' },
]

export default function ContratosPage() {
    const router = useRouter()
    const [statusFiltro, setStatusFiltro] = useState('todos')
    const { contratos, loading, error, total } = useContratos({ status: statusFiltro })

    // Contratos vencendo em 7 dias
    const vencendoEm7 = contratos.filter(c => c.dias_para_vencer >= 0 && c.dias_para_vencer <= 7 && c.status === 'ativo')

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto pb-8 animate-in fade-in zoom-in-95 duration-500">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <FileText className="w-6 h-6 text-gray-400" /> Gestão de Assinaturas
                    </h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        {loading ? 'Carregando...' : `${total} vínculo${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <Link
                    href="/contratos/novo"
                    className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
                >
                    <FilePlus className="h-4 w-4" /> Registrar novo contrato
                </Link>
            </div>

            {/* Alerta de vencendo em 7 dias (Estilo Premium) */}
            {!loading && vencendoEm7.length > 0 && statusFiltro === 'todos' && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-5 shadow-sm flex items-start sm:items-center gap-4 animate-in slide-in-from-top-2">
                    <div className="bg-amber-100/50 p-2.5 rounded-full shrink-0">
                        <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-amber-900">
                            Atenção: {vencendoEm7.length} assinatura{vencendoEm7.length > 1 ? 's expiram' : ' expira'} nos próximos 7 dias
                        </h4>
                        <p className="text-sm font-medium text-amber-700/80 mt-1 leading-relaxed">
                            Alunos afetados: <span className="font-semibold text-amber-800">{vencendoEm7.map(c => c.aluno_nome.split(' ')[0]).join(', ')}</span>.
                        </p>
                    </div>
                </div>
            )}

            {/* Filtros em Pílulas */}
            <div className="flex gap-2 flex-wrap bg-gray-50/50 p-2 rounded-2xl border border-gray-100 w-fit">
                {STATUS_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setStatusFiltro(opt.value)}
                        className={`
              px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap
              ${statusFiltro === opt.value
                                ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60'
                                : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900 border border-transparent'
                            }
            `}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Conteúdo */}
            {loading ? (
                <LoadingSpinner label="Buscando histórico de assinaturas..." />
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 font-semibold text-sm rounded-xl p-5 shadow-sm">
                    {error}
                </div>
            ) : contratos.length === 0 ? (
                <EmptyState
                    icon={FilePlus}
                    title="Sem assinaturas nesta visão"
                    description="Ainda não existe nenhum plano associado nestes critérios no sistema."
                />
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Aluno</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Plano Ativo</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Vigência</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/80">
                            {contratos.map(c => (
                                <tr
                                    key={c.id}
                                    className="hover:bg-gray-50/80 transition-colors duration-200 cursor-pointer group"
                                    onClick={() => router.push(`/contratos/${c.id}`)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <AvatarInitials nome={c.aluno_nome} fotoUrl={c.aluno_foto} size="md" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-tight">{c.aluno_nome}</p>
                                                <p className="text-xs font-medium text-gray-500 mt-1">{c.aluno_email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <p className="text-sm font-bold text-gray-800">{c.plano_nome}</p>
                                        <p className="text-xs font-semibold text-[#CC0000] mt-1">R$ {c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </td>

                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                            <span>{formatDate(c.data_inicio).slice(0, 5)}</span>
                                            <span className="text-gray-300">→</span>
                                            <span className="font-bold text-gray-900">{formatDate(c.data_fim)}</span>
                                        </div>
                                        {c.dias_para_vencer >= 0 && c.dias_para_vencer <= 7 && c.status === 'ativo' && (
                                            <p className="text-xs font-bold text-amber-600 mt-1.5 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Faltam {c.dias_para_vencer} dia{c.dias_para_vencer !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                        {c.dias_para_vencer < 0 && c.status !== 'cancelado' && (
                                            <p className="text-xs font-bold text-red-600 mt-1.5 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Vencido há {Math.abs(c.dias_para_vencer)} dia{Math.abs(c.dias_para_vencer) !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <StatusBadge status={c.status} />
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div className="bg-white border border-gray-200 p-1.5 rounded-lg text-gray-500 group-hover:border-gray-300 group-hover:bg-gray-50 transition-colors shadow-sm">
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
