'use client'

import { useState } from 'react'
import { Clock, CheckCircle, ClipboardList, Search } from 'lucide-react'
import { useAvaliacoesPendentes, useAvaliacoesConcluidas } from '@/hooks/useAvaliacoes'
import { AvatarInitials } from '@/components/shared/AvatarInitials'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDate } from '@/lib/utils/formatters'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function AvaliacoesPage() {
    const { avaliacoes, loading } = useAvaliacoesPendentes()
    const { avaliacoes: concluidas, loading: loadingConcluidas } = useAvaliacoesConcluidas()
    const [showNovaAvaliacao, setShowNovaAvaliacao] = useState(false)
    const [alunoBusca, setAlunoBusca] = useState('')
    const [alunosEncontrados, setAlunosEncontrados] = useState<Array<{ id: string; nome: string; email: string }>>([])
    const supabase = createClient()

    async function buscarAlunos(termo: string) {
        setAlunoBusca(termo)
        if (termo.trim().length < 2) { setAlunosEncontrados([]); return }
        const { data } = await supabase
            .from('alunos')
            .select('id,nome,email')
            .eq('status', 'ativo')
            .ilike('nome', `%${termo.trim()}%`)
            .limit(5)
        setAlunosEncontrados(data ?? [])
    }

    async function criarAvaliacao(alunoId: string, alunoNome: string) {
        const dataAvaliacao = new Date()
        dataAvaliacao.setDate(dataAvaliacao.getDate() + 3)

        const { error } = await supabase.from('avaliacoes').insert({
            aluno_id: alunoId,
            tipo: 'periodica',
            status: 'agendada',
            data_avaliacao: dataAvaliacao.toISOString().slice(0, 10),
            resultado: 'pendente',
        })

        if (error) { toast.error('Erro ao criar avaliação.'); return }
        toast.success(`Avaliação agendada para ${alunoNome}.`)
        setShowNovaAvaliacao(false)
        setAlunoBusca('')
        setAlunosEncontrados([])
        window.location.reload()
    }

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto pb-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Avaliações</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">Avaliações físicas agendadas e históricas</p>
                </div>
                <button
                    onClick={() => setShowNovaAvaliacao(prev => !prev)}
                    className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#AA0000] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                    <ClipboardList className="h-4 w-4" /> Nova avaliação
                </button>
            </div>

            {/* Formulário rápido de nova avaliação */}
            {showNovaAvaliacao && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Buscar aluno para agendar avaliação</p>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={alunoBusca}
                            onChange={e => buscarAlunos(e.target.value)}
                            placeholder="Digite o nome do aluno..."
                            className="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                        />
                    </div>
                    {alunosEncontrados.length > 0 && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            {alunosEncontrados.map(aluno => (
                                <button
                                    key={aluno.id}
                                    onClick={() => criarAvaliacao(aluno.id, aluno.nome)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                                >
                                    <p className="text-sm font-semibold text-gray-900">{aluno.nome}</p>
                                    <p className="text-xs text-gray-400">{aluno.email}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Pendentes */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Aguardando realização</h3>
                </div>

                {loading ? <LoadingSpinner size="sm" /> :
                    avaliacoes.length === 0 ? (
                        <div className="bg-gray-50 rounded-xl p-6 text-center text-sm text-gray-500">
                            Nenhuma avaliação pendente.
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

            {/* Histórico de avaliações concluídas */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Avaliações recentes</h3>
                </div>

                {loadingConcluidas ? <LoadingSpinner size="sm" /> :
                    concluidas.length === 0 ? (
                        <div className="bg-gray-50 rounded-xl p-6 text-center text-sm text-gray-500">
                            Nenhuma avaliação concluída ainda.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {concluidas.map(av => {
                                const aluno = av.aluno as { nome?: string; foto_url?: string; email?: string } | null
                                return (
                                    <div
                                        key={av.id}
                                        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
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
                                            <StatusBadge status={av.resultado ?? av.status} size="sm" />
                                        </div>
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
