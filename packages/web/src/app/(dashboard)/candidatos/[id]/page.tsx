'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, MessageCircle, User, ShieldCheck, Mail, CalendarDays, KeyRound, Save } from 'lucide-react'
import { useCandidato } from '@/hooks/useCandidatos'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDate } from '@/lib/utils/formatters'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

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

export default function CandidatoDetalhePage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const { candidato, loading, refetch } = useCandidato(id)
    const supabase = createClient()

    const [processando, setProcessando] = useState(false)
    const [showAprovar, setShowAprovar] = useState(false)
    const [showReprovar, setShowReprovar] = useState(false)
    const [senhaTemp, setSenhaTemp] = useState('')
    const [motivoReprovacao, setMotivoReprovacao] = useState('')
    const [obsInternas, setObsInternas] = useState('')
    const [salvandoObs, setSalvandoObs] = useState(false)

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
        if (data.data_avaliacao) {
            toast.info(`Avaliação física agendada para ${data.data_avaliacao}. Aluno ficará inativo até ser avaliado.`)
        }
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
            toast.error('Gargalo ao tentar carimbar reprovação.')
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
        const msg = encodeURIComponent(`Olá ${candidato.nome.split(' ')[0]}! Aqui é o professor Argel do CT Boxe. Vi sua inscrição e gostaria de conversar com você.`)
        window.open(`https://wa.me/55${numero}?text=${msg}`, '_blank')
    }

    if (loading) return <div className="pt-20"><LoadingSpinner label="Carregando dados do candidato..." /></div>
    if (!candidato) return <div className="text-center py-20 text-gray-500 font-bold uppercase tracking-widest text-sm">Registro de Candidatura Inexistente.</div>

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

            {/* Hero Header Estilo Passaporte */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
                {isPendente && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-500" />}
                {isAprovado && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500" />}
                {candidato.status === 'reprovado' && <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />}

                <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:items-start justify-between border-b border-gray-50">
                    <div className="flex gap-5">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex justify-center items-center shadow-inner border border-gray-200 shrink-0">
                            <User className="h-8 w-8 text-gray-400" />
                        </div>

                        <div className="pt-1">
                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">{candidato.nome}</h2>
                                <StatusBadge status={candidato.status} />
                            </div>

                            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3 opacity-90">
                                <p className="text-sm font-bold text-gray-500 flex items-center gap-1.5"><Mail className="w-4 h-4" /> {candidato.email}</p>
                                {candidato.telefone && <p className="text-sm font-bold text-gray-500 flex items-center gap-1.5"><span className="hidden sm:inline text-gray-300">|</span> {candidato.telefone}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="text-left sm:text-right bg-gray-50/50 sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 justify-start sm:justify-end"><CalendarDays className="w-3 h-3" /> Reivindicou vaga em</p>
                        <p className="text-sm font-bold text-gray-800 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm w-fit sm:ml-auto">
                            {formatDate(candidato.created_at)}
                        </p>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="p-4 sm:px-8 sm:py-5 bg-gray-50/50 flex flex-wrap gap-3">
                    {candidato.telefone && (
                        <button onClick={abrirWhatsApp} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200/60 rounded-xl transition-all shadow-sm hover:shadow">
                            <MessageCircle className="h-4 w-4" /> Enviar WhatsApp
                        </button>
                    )}
                    {isPendente && (
                        <>
                            <button
                                onClick={() => { setShowAprovar(true); setShowReprovar(false); setSenhaTemp(gerarSenhaTemporaria(candidato.nome)) }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-sm hover:shadow"
                            >
                                <CheckCircle className="h-4 w-4" /> Aprovar (Matricular)
                            </button>
                            <button
                                onClick={() => { setShowReprovar(true); setShowAprovar(false) }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 rounded-xl transition-colors shadow-sm hover:shadow"
                            >
                                <XCircle className="h-4 w-4" /> Recusar Perfil
                            </button>
                        </>
                    )}
                    {isAprovado && candidato.aluno_id && (
                        <>
                            <Link
                                href={`/alunos/${candidato.aluno_id}`}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition-colors shadow-sm cursor-pointer"
                            >
                                Ver ficha do aluno
                            </Link>
                            <Link
                                href="/avaliacoes"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 rounded-xl transition-colors shadow-sm cursor-pointer"
                            >
                                Aguardando avaliação física
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Painéis Overlays Interativos de Aprovação e Reprovação (Glassmorphism/Premium) */}
            {showAprovar && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 border border-green-200 rounded-3xl p-6 sm:p-8 space-y-5 animate-in slide-in-from-top-4 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-green-400 blur-[80px] opacity-20 pointer-events-none" />

                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-green-900 tracking-tight flex items-center gap-2 mb-1"><ShieldCheck className="w-5 h-5" /> Aprovar candidato</h3>
                        <p className="text-sm font-medium text-green-800/80 leading-relaxed max-w-xl">
                            Ao aprovar, uma conta será criada para {candidato.nome} com acesso ao app.
                        </p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm border border-green-100 rounded-2xl p-5 relative z-10 max-w-xl">
                        <label className="block text-[10px] font-black text-green-800 uppercase tracking-widest mb-2 flex items-center gap-1.5"><KeyRound className="w-3 h-3" /> Token/Senha Inicial do App</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                value={senhaTemp}
                                onChange={e => setSenhaTemp(e.target.value)}
                                className="flex-1 px-4 py-3 text-sm font-mono font-bold border border-green-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-300 shadow-sm"
                                placeholder="Mínimo 6 caracteres"
                            />
                            <button
                                onClick={() => setSenhaTemp(gerarSenhaTemporaria(candidato.nome))}
                                className="px-4 py-3 text-xs font-bold text-green-700 bg-white border border-green-200 rounded-xl hover:bg-green-50 uppercase tracking-wider shadow-sm transition-colors"
                            >
                                🔄 Recriar
                            </button>
                        </div>
                        <p className="text-xs font-bold text-green-600/80 mt-2.5">Forneça esta chave ao aluno. O app o forçara a alterá-la no primeiro acesso (Security Policy).</p>
                    </div>

                    <div className="flex gap-3 relative z-10 pt-2">
                        <button onClick={() => setShowAprovar(false)} className="px-5 py-3 text-sm font-bold text-green-800 bg-white border border-green-200 rounded-xl hover:bg-green-100 shadow-sm transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleAprovar} disabled={processando} className="px-6 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 rounded-xl shadow-md transition-colors flex items-center gap-2">
                            {processando ? <><LoadingSpinner size="sm" /> Criando conta...</> : 'Confirmar aprovação'}
                        </button>
                    </div>
                </div>
            )}

            {showReprovar && (
                <div className="bg-gradient-to-br from-red-50 to-orange-50/50 border border-red-200 rounded-3xl p-6 sm:p-8 space-y-5 animate-in slide-in-from-top-4 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-400 blur-[80px] opacity-20 pointer-events-none" />

                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-red-900 tracking-tight flex items-center gap-2 mb-1"><XCircle className="w-5 h-5" /> Reprovação de Ficha</h3>
                        <p className="text-sm font-medium text-red-800/80 leading-relaxed max-w-xl">
                            Arquivar esta solicitação. A justificativa ajudará na sua matriz de admissões histórica.
                        </p>
                    </div>

                    <div className="relative z-10 max-w-xl">
                        <label className="block text-[10px] font-black text-red-800 uppercase tracking-widest mb-2 ml-1">Memo Confidencial (Opcional)</label>
                        <textarea
                            value={motivoReprovacao}
                            onChange={e => setMotivoReprovacao(e.target.value)}
                            placeholder="Exemplo: Disponibilidade incompatível com a grade horária atual."
                            rows={3}
                            className="w-full px-4 py-3 text-sm font-medium border border-red-200 rounded-xl bg-white resize-none focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm"
                        />
                    </div>

                    <div className="flex gap-3 relative z-10 pt-2">
                        <button onClick={() => setShowReprovar(false)} className="px-5 py-3 text-sm font-bold text-red-800 bg-white border border-red-200 rounded-xl hover:bg-red-100 shadow-sm transition-colors">
                            Cancelar e Repensar
                        </button>
                        <button onClick={handleReprovar} disabled={processando} className="px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-xl shadow-md transition-colors flex items-center gap-2">
                            {processando ? <><LoadingSpinner size="sm" /> Processando...</> : 'Confirmar reprovação'}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

                {/* Main Info */}
                <div className="md:col-span-3 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3 flex items-center gap-2"><User className="w-4 h-4" /> Dados da inscrição</h3>

                        <div className="space-y-6">
                            {[
                                { label: 'Data de Nascimento', value: candidato.data_nascimento ? formatDate(candidato.data_nascimento) : '—' },
                                { label: 'Level Desportivo', value: EXPERIENCIA_LABELS[candidato.experiencia_previa ?? ''] ?? '—' },
                                { label: 'Como conheceu o CT', value: candidato.como_conheceu ?? '—' },
                                { label: 'Disponibilidade', value: candidato.disponibilidade ?? '—' },
                            ].map(campo => (
                                <div key={campo.label} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{campo.label}</p>
                                    <p className="text-sm font-black text-gray-900">{campo.value}</p>
                                </div>
                            ))}
                        </div>

                        {candidato.motivacao && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <p className="text-[10px] font-black text-[#CC0000] uppercase tracking-widest mb-3 bg-red-50 w-fit px-2 py-1 rounded">Motivação</p>
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/60 shadow-inner">
                                    <p className="text-sm font-medium text-gray-700 leading-relaxed italic border-l-2 border-[#CC0000] pl-4">{candidato.motivacao}</p>
                                </div>
                            </div>
                        )}

                        {candidato.tem_condicao_medica && candidato.descricao_condicao && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-5 border border-yellow-200 shadow-sm">
                                    <p className="text-xs font-black text-yellow-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">Condição médica informada</p>
                                    <p className="text-sm font-bold text-yellow-900">{candidato.descricao_condicao}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-[#111827] rounded-3xl border border-gray-800 shadow-md p-6 sm:p-8 h-full flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-700 blur-[80px] opacity-30 pointer-events-none" />

                        <div className="relative z-10 flex-1">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Save className="w-4 h-4" /> Observações internas</h3>
                            <p className="text-xs font-bold text-gray-500 mb-5 pb-4 border-b border-gray-800 leading-relaxed">Notas visíveis apenas para o professor.</p>

                            <textarea
                                value={obsInternas || candidato.observacoes_internas || ''}
                                onChange={e => setObsInternas(e.target.value)}
                                placeholder="Exemplo: Ele mencionou via WhatsApp que prefere a turma noturna, tem flexibilidade as quintas..."
                                rows={6}
                                className="w-full px-4 py-3 text-sm font-medium text-white border border-gray-700 rounded-xl bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all shadow-inner placeholder:text-gray-600"
                            />
                        </div>

                        <button
                            onClick={salvarObservacoes}
                            disabled={salvandoObs || obsInternas === candidato.observacoes_internas}
                            className="mt-6 w-full py-3.5 text-sm font-bold text-white bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:bg-gray-800 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 relative z-10"
                        >
                            {salvandoObs ? <><LoadingSpinner size="sm" /> Salvando...</> : 'Salvar observações'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
