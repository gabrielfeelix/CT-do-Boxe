'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft, Calendar, Edit2,
    Lock, UserX, MessageCircle, ShieldCheck,
    CreditCard, FileText, CheckCircle2, ClipboardList
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAluno } from '@/hooks/useAlunos'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AvatarInitials } from '@/components/shared/AvatarInitials'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDate, formatPhone, formatCurrency } from '@/lib/utils/formatters'
import { useContratos } from '@/hooks/useContratos'
import { useAvaliacoesAluno } from '@/hooks/useAvaliacoes'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { HistoricoFrequencia } from '@/components/alunos/HistoricoFrequencia'

type Aba = 'geral' | 'contratos' | 'frequencia' | 'financeiro' | 'avaliacoes'

// ─── ABA CONTRATOS ──────────────────────────────────────────────
function AbaContratos({ alunoId }: { alunoId: string }) {
    const { contratos, loading } = useContratos({ aluno_id: alunoId })
    const router = useRouter()

    if (loading) return <div className="pt-20"><LoadingSpinner label="Localizando contratos ativos..." /></div>

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 relative overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-5 border-b border-gray-50 gap-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Planos Adquiridos
                </h3>
                <button onClick={() => router.push(`/contratos/novo?aluno_id=${alunoId}`)} className="text-sm font-bold bg-gray-900 text-white hover:bg-black px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all">
                    Nova Assinatura +
                </button>
            </div>

            {contratos.length === 0 ? (
                <div className="py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-center">
                    <h4 className="text-sm font-bold text-gray-600">Nenhuma assinatura ativa</h4>
                    <p className="text-xs font-medium text-gray-400 mt-1">Este aluno ainda não está vinculado a um plano do CT.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contratos.map(c => (
                        <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-gray-200 hover:border-gray-300 rounded-2xl cursor-pointer shadow-sm hover:shadow-md transition-all group gap-4" onClick={() => router.push(`/contratos/${c.id}`)}>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{c.plano_tipo}</p>
                                <p className="text-base font-black text-gray-900 group-hover:text-[#CC0000] transition-colors line-clamp-1">{c.plano_nome}</p>
                                <p className="text-xs font-bold text-gray-500 mt-2 bg-gray-50 px-2 py-1 flex items-center gap-1.5 w-fit rounded-md"><Calendar className="w-3 h-3 text-gray-400" /> {formatDate(c.data_inicio).slice(0, 5)} a {formatDate(c.data_fim)}</p>
                            </div>
                            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 flex-shrink-0 flex sm:flex-col justify-between items-center sm:items-end gap-2">
                                <StatusBadge status={c.status} size="sm" />
                                <p className="text-xl font-black text-gray-900 tracking-tighter">{formatCurrency(c.valor)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── ABA PAGAMENTOS ──────────────────────────────────────────────
function AbaPagamentos({ alunoId }: { alunoId: string }) {
    const [pagamentos, setPagamentos] = useState<Array<{
        id: string
        metodo?: string
        data_vencimento: string
        valor: number
        status: string
    }>>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        supabase.from('pagamentos').select('*').eq('aluno_id', alunoId).order('created_at', { ascending: false }).limit(20)
            .then(({ data }) => { setPagamentos(data ?? []); setLoading(false) })
    }, [alunoId, supabase])

    if (loading) return <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"><LoadingSpinner label="Carregando histórico..." /></div>

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 relative overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-5 border-b border-gray-50 gap-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-[#CC0000]" /> Extrato Financeiro
                </h3>
            </div>

            {pagamentos.length === 0 ? (
                <div className="py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-center">
                    <h4 className="text-sm font-bold text-gray-600">Histórico Limpo</h4>
                    <p className="text-xs font-medium text-gray-400 mt-1">Nenhum pagamento registrado no momento.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pagamentos.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 border border-gray-100 bg-gray-50/30 rounded-2xl hover:bg-gray-50 transition-colors group">
                            <div className="flex gap-4 items-center">
                                <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shrink-0">
                                    <CreditCard className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{p.metodo ?? 'PIX'}</p>
                                    <p className="text-xs sm:text-sm font-bold text-gray-800 tabular-nums">Venc. {formatDate(p.data_vencimento)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-base sm:text-lg font-black text-gray-900 tracking-tighter mb-1">{formatCurrency(p.valor)}</p>
                                <StatusBadge status={p.status} size="sm" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── ABA AVALIAÇÕES ──────────────────────────────────────────────
function AbaAvaliacoes({ alunoId }: { alunoId: string }) {
    const { avaliacoes, loading } = useAvaliacoesAluno(alunoId)
    const router = useRouter()

    if (loading) return <div className="pt-20"><LoadingSpinner label="Buscando histórico de avaliações..." /></div>

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 relative overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-5 border-b border-gray-50 gap-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <ClipboardList className="w-6 h-6 text-blue-500" /> Histórico de Avaliações
                </h3>
                <button onClick={() => router.push(`/avaliacoes/${alunoId}/nova`)} className="text-sm font-bold bg-[#CC0000] text-white hover:bg-[#AA0000] px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all">
                    Nova Avaliação +
                </button>
            </div>

            {avaliacoes.length === 0 ? (
                <div className="py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-center">
                    <h4 className="text-sm font-bold text-gray-600">Nenhuma avaliação física</h4>
                    <p className="text-xs font-medium text-gray-400 mt-1">Este aluno ainda não realizou testes físicos ou pesagens.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {avaliacoes.map(av => (
                        <div key={av.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-gray-200 hover:border-[#CC0000] rounded-2xl cursor-pointer shadow-sm hover:shadow-md transition-all group gap-4" onClick={() => router.push(`/avaliacoes/${alunoId}/nova?avaliacao_id=${av.id}`)}>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{av.tipo}</p>
                                <p className="text-base font-black text-gray-900 group-hover:text-[#CC0000] transition-colors">{av.resultado === 'pendente' ? 'Agendada' : `Teste concluído: ${av.resultado}`}</p>
                                <p className="text-xs font-bold text-gray-500 mt-2 bg-gray-50 px-2 py-1 flex items-center gap-1.5 w-fit rounded-md"><Calendar className="w-3 h-3 text-gray-400" /> {av.data_avaliacao ? formatDate(av.data_avaliacao) : 'Data não definida'}</p>
                            </div>
                            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 flex-shrink-0 flex sm:flex-col justify-between items-center sm:items-end gap-2">
                                <StatusBadge status={av.status} size="sm" />
                                {av.nota_tecnica_geral && (
                                    <p className="text-xl font-black text-gray-900 tracking-tighter">{av.nota_tecnica_geral}/5</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function AlunoDetalhePage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const { aluno, loading, error, refetch } = useAluno(id)
    const [aba, setAba] = useState<Aba>('geral')
    const [salvando, setSalvando] = useState(false)
    const supabase = createClient()

    async function handleBloquear() {
        if (!aluno) return
        const novoStatus = aluno.status === 'bloqueado' ? 'ativo' : 'bloqueado'
        const acao = novoStatus === 'bloqueado' ? 'bloquear' : 'desbloquear'

        if (!confirm(`Tem certeza que deseja ${acao} o acesso de ${aluno.nome}?`)) return

        setSalvando(true)
        const { error } = await supabase
            .from('alunos')
            .update({ status: novoStatus })
            .eq('id', aluno.id)

        if (error) {
            toast.error('Erro ao atualizar status.')
        } else {
            toast.success(`Acesso do aluno ${novoStatus === 'bloqueado' ? 'bloqueado' : 'restabelecido'} com sucesso.`)
            refetch()
        }
        setSalvando(false)
    }

    async function handleCancelar() {
        if (!aluno) return
        if (!confirm(`Atenção: Tem certeza que deseja cancelar o registro de ${aluno.nome}? O aluno perderá acesso a todas as dependências.`)) return

        setSalvando(true)
        const { error } = await supabase
            .from('alunos')
            .update({ status: 'cancelado' })
            .eq('id', aluno.id)

        if (error) {
            toast.error('Erro ao cancelar cadastro.')
        } else {
            toast.success('Vínculo cancelado de forma definitiva.')
            refetch()
        }
        setSalvando(false)
    }

    function handleWhatsApp() {
        if (!aluno?.telefone) return
        const numero = aluno.telefone.replace(/\D/g, '')
        const mensagem = encodeURIComponent(`Olá, ${aluno.nome.split(' ')[0]}! Tudo bem? Aqui é do CT Boxe.`)
        window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank')
    }

    if (loading) return <div className="pt-20"><LoadingSpinner label="Buscando detalhes do aluno..." /></div>

    if (error || !aluno) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100">
                    <UserX className="w-8 h-8" />
                </div>
                <p className="text-gray-900 font-bold mb-2">Aluno não encontrado.</p>
                <p className="text-gray-500 text-sm mb-6 max-w-sm text-center">O registro pode ter sido excluído ou você não tem permissão para visualizar.</p>
                <button
                    onClick={() => router.back()}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
                >
                    Voltar para listagem
                </button>
            </div>
        )
    }

    const abas: { id: Aba; label: string; icon: LucideIcon }[] = [
        { id: 'geral', label: 'Visão Geral', icon: FileText },
        { id: 'contratos', label: 'Planos', icon: CheckCircle2 },
        { id: 'frequencia', label: 'Check-ins', icon: Calendar },
        { id: 'avaliacoes', label: 'Avaliações', icon: ClipboardList },
        { id: 'financeiro', label: 'Financeiro', icon: CreditCard },
    ]

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto pb-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Botão voltar */}
            <button
                onClick={() => router.back()}
                className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors w-fit"
            >
                <div className="bg-white border border-gray-200 p-1.5 rounded-md group-hover:border-gray-300 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                Voltar
            </button>

            {/* Header Profile Premium */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
                {/* Banner / Cover */}
                <div className="h-32 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-900 w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-800/60 to-gray-900/95" />
                </div>

                <div className="px-6 sm:px-10 pb-8">
                    <div className="flex flex-col md:flex-row md:items-end gap-6 sm:gap-8 -mt-12 relative z-10">

                        {/* Avatar Em destaque */}
                        <div className="ring-4 ring-white rounded-2xl bg-white self-start md:self-auto shadow-sm overflow-hidden shrink-0 transition-transform hover:scale-105 duration-300">
                            <AvatarInitials nome={aluno.nome} fotoUrl={aluno.foto_url} size="xl" />
                        </div>

                        {/* Info principal container — parte sobre o banner (precisa de texto branco) */}
                        <div className="flex-1 min-w-0 flex flex-col md:flex-row justify-between md:items-end gap-6 pb-2">
                            <div>
                                <div className="flex items-center gap-3 flex-wrap mb-1.5">
                                    <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">{aluno.nome}</h2>
                                    <StatusBadge status={aluno.status} />
                                </div>
                                <p className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                    Membro Desde <span className="bg-white/10 text-white px-2.5 py-1 rounded-md backdrop-blur-sm">{formatDate(aluno.data_cadastro || aluno.created_at)}</span>
                                </p>
                            </div>

                            {/* Ações Rápidas Premium */}
                            <div className="flex flex-wrap items-center gap-3">
                                {aluno.telefone && (
                                    <button
                                        onClick={handleWhatsApp}
                                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-black text-white bg-[#25D366] hover:bg-[#128C7E] uppercase tracking-widest rounded-xl shadow-sm hover:shadow transition-all duration-200"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        WhatsApp
                                    </button>
                                )}
                                <button
                                    onClick={handleBloquear}
                                    disabled={salvando || aluno.status === 'cancelado'}
                                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-40"
                                >
                                    {aluno.status === 'bloqueado' ? (
                                        <><ShieldCheck className="h-4 w-4 text-green-600" /> Liberar Acesso</>
                                    ) : (
                                        <><Lock className="h-4 w-4 text-yellow-600" /> Travar Acesso</>
                                    )}
                                </button>
                                {aluno.status !== 'cancelado' && (
                                    <button
                                        onClick={handleCancelar}
                                        disabled={salvando}
                                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-40"
                                        title="Encerrar Vínculo Total"
                                    >
                                        <UserX className="h-4 w-4" />
                                        Encerrar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navegação por Abas - Estilo iOS/Segmented */}
            <div className="bg-gray-100 p-1.5 rounded-xl inline-flex overflow-x-auto max-w-full no-scrollbar">
                {abas.map((a) => {
                    const Icon = a.icon
                    const isActive = aba === a.id
                    return (
                        <button
                            key={a.id}
                            onClick={() => setAba(a.id)}
                            className={`
                flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 whitespace-nowrap
                ${isActive
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }
              `}
                        >
                            <Icon className={`h-4 w-4 ${isActive ? 'text-[#CC0000]' : 'text-gray-400'}`} />
                            {a.label}
                        </button>
                    )
                })}
            </div>

            {/* CONTEÚDO: Visão Geral */}
            {aba === 'geral' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2 duration-300">

                    {/* Col 1 e 2: Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-[#CC0000] rounded-full inline-block" />
                                    Ficha do Aluno
                                </h3>
                                <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#CC0000] transition-colors rounded-lg hover:bg-red-50 px-3 py-1.5">
                                    <Edit2 className="h-4 w-4" /> Editar
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">E-mail Pessoal</p>
                                    <p className="text-sm font-medium text-gray-900 break-all">{aluno.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Telefone</p>
                                    <p className="text-sm font-medium text-gray-900">{aluno.telefone ? formatPhone(aluno.telefone) : 'Não informado'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Documento (CPF)</p>
                                    <p className="text-sm font-medium text-gray-900">{aluno.cpf || 'Não preenchido'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data de nascimento</p>
                                    <p className="text-sm font-medium text-gray-900">{aluno.data_nascimento ? formatDate(aluno.data_nascimento) : 'Não informado'}</p>
                                </div>
                            </div>

                            {aluno.observacoes && (
                                <div className="mt-8 p-5 bg-yellow-50/50 border border-yellow-100 rounded-xl">
                                    <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Edit2 className="h-3 w-3" /> Anotações Internas (Staff)
                                    </p>
                                    <p className="text-sm font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">{aluno.observacoes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Col 3: Side actions */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 relative overflow-hidden h-full flex flex-col justify-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
                            <h3 className="text-sm font-bold text-gray-900 relative z-10 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-blue-500" /> Área de Suporte</h3>
                            <p className="text-xs font-medium text-gray-500 mt-2 mb-5 relative z-10">
                                Precisando de ajuda com este aluno? Utilize a Central de Dúvidas para relatar qualquer instabilidade técnica ou acionar a administração.
                            </p>
                            <button
                                className="w-full relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Suporte Técnico
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Placeholders Abas */}
            {aba === 'contratos' && (
                <AbaContratos alunoId={aluno.id} />
            )}

            {aba === 'frequencia' && (
                <HistoricoFrequencia alunoId={aluno.id} />
            )}

            {aba === 'financeiro' && (
                <AbaPagamentos alunoId={aluno.id} />
            )}

            {aba === 'avaliacoes' && (
                <AbaAvaliacoes alunoId={aluno.id} />
            )}
        </div>
    )
}
