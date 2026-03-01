'use client'

import { MessageCircle, RefreshCw, AlertOctagon, TrendingDown, ArrowLeft } from 'lucide-react'
import { useInadimplentes } from '@/hooks/useFinanceiro'
import { AvatarInitials } from '@/components/shared/AvatarInitials'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function InadimplenciaPage() {
    const router = useRouter()
    const { inadimplentes, loading, totalEmAberto, refetch } = useInadimplentes()
    const [gerando, setGerando] = useState<string | null>(null)

    function abrirWhatsApp(telefone: string, nome: string, valor: number, vencimento: string) {
        const numero = telefone.replace(/\D/g, '')
        // eslint-disable-next-line react-hooks/purity
        const diasAtraso = Math.floor((Date.now() - new Date(vencimento).getTime()) / (1000 * 60 * 60 * 24))
        const msg = encodeURIComponent(
            `Olá ${nome.split(' ')[0]}! Tudo certo?\n\nSou do administrativo do CT Boxe, passando para avisar que tem uma pendência de R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} que venceu no dia ${formatDate(vencimento).slice(0, 5)}.\n\nPrecisa de ajuda para gerar uma nova cobrança? Estou à disposição!`
        )
        window.open(`https://wa.me/55${numero}?text=${msg}`, '_blank')
    }

    async function gerarCobranca(pagamentoId: string, alunoId: string, valor: number, email: string, nome: string) {
        setGerando(pagamentoId)
        const response = await fetch('/api/pagamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aluno_id: alunoId, valor, descricao: 'Recuperação CT Boxe', email_pagador: email, nome_pagador: nome }),
        })

        // Simulação do QR Code na tela - na Fase 4 real podemos jogar pro detalhe do contrato ou abrir modal, aqui so mostramos toast por ser listagem rápida
        if (response.ok) {
            toast.success(`Nova cobrança rodada para o gateway Mercado Pago com sucesso!`);
            refetch();
        }
        else { toast.error('Falha de Integração com Mercado Pago.') }
        setGerando(null)
    }

    const diasAtraso = (vencimento: string) => {
        // eslint-disable-next-line react-hooks/purity
        return Math.floor((Date.now() - new Date(vencimento).getTime()) / (1000 * 60 * 60 * 24))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in slide-in-from-bottom-2 duration-300">
            <button onClick={() => router.back()} className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors w-fit">
                <div className="bg-white border border-gray-200 p-1.5 rounded-md group-hover:border-gray-300 transition-colors shadow-sm">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                Voltar
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-red-50 p-6 sm:p-8 rounded-3xl border border-red-200 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-300 blur-[80px] opacity-20 pointer-events-none" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-red-950 tracking-tight flex items-center gap-2">
                        <AlertOctagon className="w-8 h-8 text-red-600" /> Pendências Financeiras
                    </h2>
                    <p className="text-sm font-bold text-red-800/80 uppercase tracking-widest mt-2">{loading ? 'Analisando...' : `Gerenciamento de Inadimplência`}</p>
                </div>

                <div className="relative z-10 text-left sm:text-right bg-white/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-red-100 shadow-sm">
                    <p className="text-xs font-bold text-red-800 uppercase tracking-widest mb-1">Total em Aberto</p>
                    <p className="text-4xl font-black text-red-700 tracking-tighter shadow-sm flex items-center justify-start sm:justify-end gap-2">
                        <TrendingDown className="w-6 h-6 shrink-0 opacity-50" />
                        {formatCurrency(totalEmAberto)}
                    </p>
                </div>
            </div>

            {loading ? <LoadingSpinner label="Buscando inadimplentes..." /> :
                inadimplentes.length === 0 ? (
                    <EmptyState icon={AlertOctagon} title="Fluxo Cristalino" description="Excelente! Nenhum aluno com passivo configurado em sistema." />
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {inadimplentes.map(p => {
                            const aluno = p.aluno as { nome?: string; telefone?: string; email?: string } | null
                            const dias = diasAtraso(p.data_vencimento)

                            return (
                                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 hover:border-red-300 transition-colors duration-300 hover:shadow-md">

                                    <div className="flex w-full sm:w-auto items-center gap-4 flex-1">
                                        <AvatarInitials nome={aluno?.nome ?? '?'} size="lg" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-lg font-black text-gray-900 truncate leading-tight">{aluno?.nome}</p>
                                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{aluno?.telefone || aluno?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 sm:pl-4 sm:border-l border-gray-100">

                                        <div className="text-left sm:text-right">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-red-500 mb-0.5">Vencido dia {formatDate(p.data_vencimento).slice(0, 5)} • {dias}D Atr</p>
                                            <p className="text-2xl font-black text-red-700 tracking-tight leading-none">{formatCurrency(p.valor)}</p>
                                        </div>

                                        <div className="flex flex-col gap-2 shrink-0">
                                            {aluno?.telefone && (
                                                <button
                                                    onClick={() => abrirWhatsApp(aluno.telefone!, aluno.nome || 'Aluno', p.valor, p.data_vencimento)}
                                                    className="flex items-center justify-center gap-1.5 w-full sm:w-32 py-2 text-xs font-bold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors shadow-sm"
                                                >
                                                    <MessageCircle className="h-4 w-4" /> Enviar WhatsApp
                                                </button>
                                            )}
                                            <button
                                                onClick={() => gerarCobranca(p.id, p.aluno_id, p.valor, aluno?.email || '', aluno?.nome || 'Aluno')}
                                                disabled={gerando === p.id}
                                                className="flex items-center justify-center gap-1.5 w-full sm:w-32 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {gerando === p.id
                                                    ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> ...</>
                                                    : <>Gerar Nova Cobrança</>
                                                }
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            }
        </div>
    )
}
