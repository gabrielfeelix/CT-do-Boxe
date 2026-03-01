'use client'

import { Clock } from 'lucide-react'
import { useAvaliacoesPendentes } from '@/hooks/useAvaliacoes'
import { AvatarInitials } from '@/components/shared/AvatarInitials'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDate } from '@/lib/utils/formatters'

export default function AvaliacoesPage() {
    const { avaliacoes, loading } = useAvaliacoesPendentes()

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Avaliações</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Avaliações físicas agendadas e históricas</p>
                </div>
            </div>

            {/* Pendentes */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Aguardando realização</h3>
                </div>

                {loading ? <LoadingSpinner size="sm" /> :
                    avaliacoes.length === 0 ? (
                        <div className="bg-gray-50 rounded-xl p-6 text-center text-sm text-gray-400">
                            ✅ Nenhuma avaliação pendente.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {avaliacoes.map(av => {
                                const aluno = av.aluno as { nome?: string; foto_url?: string; email?: string } | null
                                return (
                                    <div
                                        key={av.id}
                                        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => window.location.href = `/avaliacoes/${av.aluno_id}/nova?avaliacao_id=${av.id}`}
                                    >
                                        <AvatarInitials nome={aluno?.nome ?? '?'} fotoUrl={aluno?.foto_url} size="md" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">{aluno?.nome}</p>
                                            <p className="text-xs text-gray-400">{aluno?.email}</p>
                                        </div>
                                        <div className="text-right">
                                            {av.data_avaliacao && (
                                                <p className="text-sm font-medium text-gray-700">{formatDate(av.data_avaliacao)}</p>
                                            )}
                                            <StatusBadge status={av.status} size="sm" />
                                        </div>
                                        <span className="text-xs text-gray-300 hover:text-[#CC0000] font-medium">Avaliar →</span>
                                    </div>
                                )
                            })}
                        </div>
                    )
                }
            </div>
        </div>
    )
}
