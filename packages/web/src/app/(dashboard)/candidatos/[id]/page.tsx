'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, MessageCircle, User, ShieldCheck, Mail, CalendarDays, KeyRound, Save, ClipboardList } from 'lucide-react'
import { useCandidato } from '@/hooks/useCandidatos'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDate } from '@/lib/utils/formatters'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { QuestionarioRecrutamento } from '@/components/avaliacoes/QuestionarioRecrutamento'

const EXPERIENCIA_LABELS: Record<string, string> = {
    nenhuma: 'Nenhuma — zerado',
    iniciante: 'Iniciante (< 6 meses)',
    intermediario: 'Intermediário (6m – 2 anos)',
    avancado: 'Avançado (2+ anos)',
}

function gerarSenhaTemporaria(nome: string): string {
    const primeiro = nome.split(' ')[0].toLowerCase()
    const numeros = Math.floor(1000 + Math.random() * 9000)
    return `${primeiro}@${numeros}`
}

type Aba = 'geral' | 'avaliacao'

export default function CandidatoDetalhePage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const { candidato, loading, refetch } = useCandidato(id)
    const supabase = createClient()
    const [aba, setAba] = useState<Aba>('geral')

    const [processando, setProcessando] = useState(false)
    const [showAprovar, setShowAprovar] = useState(false)
    const [showReprovar, setShowReprovar] = useState(false)
    const [senhaTemp, setSenhaTemp] = useState('')
    const [motivoReprovacao, setMotivoReprovacao] = useState('')
    const [obsInternas, setObsInternas] = useState('')
    const [salvandoObs, setSalvandoObs] = useState(false)

    // Buscar avaliação já existente do candidato
    const [avaliacaoExistente, setAvaliacaoExistente] = useState<any>(null)
    const [loadingAvaliacao, setLoadingAvaliacao] = useState(false)

    const fetchAvaliacao = async () => {
        if (!id) return
        setLoadingAvaliacao(true)
        const { data } = await supabase.from('avaliacoes').select('*').eq('candidato_id', id).maybeSingle()
        setAvaliacaoExistente(data)
        setLoadingAvaliacao(false)
    }

    useEffect(() => {
        fetchAvaliacao()
        if (candidato?.observacoes_internas) {
            setObsInternas(candidato.observacoes_internas)
        }
    }, [id, candidato])

    async function handleAprovar() {
        if (!senhaTemp.trim() || senhaTemp.length < 6) {
            toast.error('Token/Senha deve ter pelo menos 6 caracteres.')
            return
        }
        setProcessando(true)

        const response = await fetch('/api/candidatos/aprovar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidato_id: id, senha_temporaria: senhaTemp }),
        })

        const data = await response.json()

        if (!response.ok) {
            toast.error(data.error || 'Erro processando liberação de acesso.')
            setProcessando(false)
            return
        }

        toast.success(`Candidato aprovado! Conta criada com sucesso.`)
        setShowAprovar(false)
        refetch()
        setProcessando(false)
    }

    async function handleReprovar() {
        setProcessando(true)
        const response = await fetch('/api/candidatos/reprovar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidato_id: id, motivo: motivoReprovacao }),
        })
        if (!response.ok) {
            toast.error('Erro ao reprovar candidato.')
            setProcessando(false)
            return
        }
        toast.success('Candidato reprovado.')
        setShowReprovar(false)
        refetch()
        setProcessando(false)
    }

    async function salvarObservacoes() {
        if (!candidato) return
        setSalvandoObs(true)
        const { error } = await supabase
            .from('candidatos')
            .update({ observacoes_internas: obsInternas })
            .eq('id', candidato.id)
        if (error) toast.error('Erro ao salvar observações.')
        else toast.success('Observações salvas!')
        setSalvandoObs(false)
    }

    function abrirWhatsApp() {
        if (!candidato?.telefone) return
        const numero = candidato.telefone.replace(/\D/g, '')
        const msg = encodeURIComponent(`Olá ${candidato.nome.split(' ')[0]}! Aqui é o professor Argel do CT Boxe.`)
        window.open(`https://wa.me/55${numero}?text=${msg}`, '_blank')
    }

    if (loading) return <div className="pt-20"><LoadingSpinner label="Carregando dados do candidato..." /></div>
    if (!candidato) return <div className="text-center py-20 text-gray-500 font-bold uppercase tracking-widest text-sm">Registro Inexistente.</div>

    const isPendente = candidato.status === 'aguardando'
    const isAprovado = candidato.status === 'aprovado'

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in slide-in-from-bottom-3 duration-500">
            <button onClick={() => router.back()} className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors w-fit">
                <div className="bg-white border border-gray-200 p-1.5 rounded-md group-hover:border-gray-300 transition-colors shadow-sm">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                Candidatos
            </button>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:items-start justify-between border-b border-gray-50">
                    <div className="flex gap-5">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex justify-center items-center shadow-inner border border-gray-200 shrink-0">
                            <User className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="pt-1">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">{candidato.nome}</h2>
                            <StatusBadge status={candidato.status} />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {candidato.telefone && (
                            <button
                                onClick={abrirWhatsApp}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all shadow-sm"
                            >
                                <MessageCircle className="h-4 w-4" /> WhatsApp
                            </button>
                        )}
                        <div className="text-left sm:text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 justify-start sm:justify-end">
                                <CalendarDays className="w-3 h-3" /> Inscrito em
                            </p>
                            <p className="text-sm font-bold text-gray-800">{formatDate(candidato.created_at)}</p>
                        </div>
                    </div>
                </div>

                <div className="px-8 bg-gray-50/10 border-b border-gray-50 flex gap-8">
                    {[
                        { id: 'geral', label: 'Dados Iniciais', icon: User },
                        { id: 'avaliacao', label: 'Avaliação de Recrutamento', icon: ClipboardList }
                    ].map(a => (
                        <button
                            key={a.id}
                            onClick={() => setAba(a.id as any)}
                            className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${aba === a.id
                                ? 'border-[#CC0000] text-[#CC0000]'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <a.icon className="w-4 h-4" />
                            {a.label}
                        </button>
                    ))}
                </div>

                <div className="p-4 sm:px-8 sm:py-5 bg-gray-50/50 flex flex-wrap gap-3">
                    {isPendente && (
                        <>
                            <button
                                onClick={() => { setShowAprovar(true); setShowReprovar(false); setSenhaTemp(gerarSenhaTemporaria(candidato.nome)) }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-sm h-11"
                            >
                                <CheckCircle className="h-4 w-4" /> Aprovar e Matricular
                            </button>
                            <button
                                onClick={() => { setShowReprovar(true); setShowAprovar(false) }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors shadow-sm h-11"
                            >
                                <XCircle className="h-4 w-4" /> Recusar
                            </button>
                        </>
                    )}
                    {isAprovado && candidato.aluno_id && (
                        <Link
                            href={`/alunos/${candidato.aluno_id}`}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition-colors shadow-sm h-11"
                        >
                            Ver ficha do aluno
                        </Link>
                    )}
                </div>
            </div>

            {showAprovar && (
                <div className="bg-green-50 border border-green-200 rounded-3xl p-6 sm:p-8 space-y-5 animate-in slide-in-from-top-4 shadow-sm">
                    <h3 className="text-xl font-black text-green-900 tracking-tight flex items-center gap-2 mb-1"><ShieldCheck className="w-5 h-5" /> Liberar Acesso</h3>
                    <div className="bg-white border border-green-100 rounded-2xl p-5 max-w-xl">
                        <label className="block text-[10px] font-black text-green-800 uppercase tracking-widest mb-2 flex items-center gap-1.5"><KeyRound className="w-3 h-3" /> Token Inicial</label>
                        <input
                            value={senhaTemp}
                            onChange={e => setSenhaTemp(e.target.value)}
                            className="w-full px-4 py-3 text-sm font-mono font-bold border border-green-200 rounded-xl bg-white"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowAprovar(false)} className="px-5 py-3 text-sm font-bold text-green-800 bg-white border border-green-200 rounded-xl">Cancelar</button>
                        <button onClick={handleAprovar} disabled={processando} className="px-6 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl flex items-center gap-2">
                            {processando ? <LoadingSpinner size="sm" /> : 'Confirmar Aprovação'}
                        </button>
                    </div>
                </div>
            )}

            {showReprovar && (
                <div className="bg-red-50 border border-red-200 rounded-3xl p-6 sm:p-8 space-y-5 animate-in slide-in-from-top-4 shadow-sm">
                    <h3 className="text-xl font-black text-red-900 tracking-tight flex items-center gap-2 mb-1"><XCircle className="w-5 h-5" /> Recusar Inscrição</h3>
                    <textarea
                        value={motivoReprovacao}
                        onChange={e => setMotivoReprovacao(e.target.value)}
                        placeholder="Motivo (opcional)..."
                        rows={3}
                        className="w-full max-w-xl px-4 py-3 text-sm font-medium border border-red-200 rounded-xl bg-white resize-none"
                    />
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowReprovar(false)} className="px-5 py-3 text-sm font-bold text-red-800 bg-white border border-red-200 rounded-xl">Voltar</button>
                        <button onClick={handleReprovar} disabled={processando} className="px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl">Confirmar</button>
                    </div>
                </div>
            )}

            {aba === 'geral' && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 animate-in fade-in duration-500">
                    <div className="md:col-span-3 space-y-6">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3 flex items-center gap-2"><User className="w-4 h-4" /> Dados do Candidato</h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'E-mail', value: candidato.email },
                                    { label: 'Telefone', value: candidato.telefone || '—' },
                                    { label: 'Level', value: EXPERIENCIA_LABELS[candidato.experiencia_previa ?? ''] ?? '—' },
                                    { label: 'Vindo de', value: candidato.como_conheceu || '—' },
                                ].map(campo => (
                                    <div key={campo.label} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{campo.label}</p>
                                        <p className="text-sm font-black text-gray-900">{campo.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-[#111827] rounded-3xl border border-gray-800 shadow-md p-6 sm:p-8 h-full">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Save className="w-4 h-4" /> Notas Internas</h3>
                            <p className="text-[10px] text-gray-500 mb-4 uppercase font-black">Histórico e observações</p>
                            <textarea
                                value={obsInternas}
                                onChange={e => setObsInternas(e.target.value)}
                                rows={8}
                                className="w-full px-4 py-3 text-sm font-medium text-white border border-gray-700 rounded-xl bg-gray-800 resize-none outline-none focus:ring-1 focus:ring-gray-400"
                            />
                            <button onClick={salvarObservacoes} disabled={salvandoObs} className="mt-6 w-full py-3.5 text-xs font-black uppercase tracking-widest text-white bg-gray-700 hover:bg-gray-600 rounded-xl transition-all h-12">
                                {salvandoObs ? <LoadingSpinner size="sm" /> : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {aba === 'avaliacao' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 animate-in fade-in duration-500">
                    {loadingAvaliacao ? <LoadingSpinner label="Buscando avaliação..." /> : (
                        <QuestionarioRecrutamento
                            candidatoId={id}
                            avaliacaoInicial={avaliacaoExistente}
                            onSave={fetchAvaliacao}
                        />
                    )}
                </div>
            )}
        </div>
    )
}
