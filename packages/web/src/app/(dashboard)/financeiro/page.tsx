'use client'

import { DollarSign, AlertTriangle, Clock, TrendingUp, PiggyBank, CreditCard, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useInadimplentes, usePagamentosDoMes } from '@/hooks/useFinanceiro'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { AvatarInitials } from '@/components/shared/AvatarInitials'

function MetricaCard({ title, value, subtitle, icon: Icon, cor, gradient }: {
    title: string; value: string; subtitle?: string; icon: React.ElementType; cor: string; gradient?: string
}) {
    return (
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300`}>
            {gradient && <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} blur-[60px] opacity-20 -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-40`} />}

            <div className="flex items-start justify-between relative z-10">
                <div className="pr-4">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">{title}</p>
                    <p className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">{value}</p>
                    {subtitle && <p className="text-xs font-bold text-gray-400 mt-2">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-xl shadow-inner ${cor}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    )
}

export default function FinanceiroPage() {
    const { inadimplentes, loading: loadingI, totalEmAberto } = useInadimplentes()
    const { pagamentos, loading: loadingP, totalPago, totalPendente } = usePagamentosDoMes()

    const loading = loadingI || loadingP

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto pb-8 animate-in slide-in-from-bottom-2 duration-500">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex gap-2 items-center">
                        <PiggyBank className="w-6 h-6 text-emerald-500" /> Cockpit Financeiro
                    </h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Balanço Competitivo de {new Date().toLocaleString('pt-BR', { month: 'long' })}</p>
                </div>
                <Link href="/financeiro/inadimplencia" className="inline-flex items-center gap-2 bg-white border border-red-200 text-red-600 font-bold hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all shadow-sm">
                    <AlertTriangle className="w-4 h-4" /> Cobranças Atrasadas →
                </Link>
            </div>

            {loading ? <LoadingSpinner label="Carregando dados..." /> : (
                <>
                    {/* Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <MetricaCard title="Líquido Registrado" value={formatCurrency(totalPago)} subtitle="Notas liquidadas no caixa" icon={DollarSign} cor="bg-emerald-100 text-emerald-700" gradient="bg-emerald-500" />
                        <MetricaCard title="Previsão Restante" value={formatCurrency(totalPendente)} subtitle="Cobradas aguardando quitação" icon={Clock} cor="bg-blue-100 text-blue-700" gradient="bg-blue-500" />
                        <MetricaCard title="Total Evasivo" value={formatCurrency(totalEmAberto)} subtitle={`${inadimplentes.length} atleta(s) em debito`} icon={AlertTriangle} cor="bg-red-100 text-red-700" gradient="bg-red-500" />
                        <MetricaCard title="Potencial Total" value={formatCurrency(totalPago + totalPendente)} subtitle="Recebimentos c/ Inadimplência Zero" icon={TrendingUp} cor="bg-[#111827] text-white" gradient="bg-gray-500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Últimos pagamentos - Tabela Principal*/}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-fit">
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50/80 bg-gray-50/50">
                                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2"><CreditCard className="w-5 h-5 text-gray-400" /> Lançamentos Recentes</h3>
                            </div>

                            {pagamentos.length === 0 ? (
                                <div className="py-20 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <DollarSign className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">Sem capital rodando hoje.</p>
                                    <p className="text-xs font-medium text-gray-500 max-w-xs mt-1">Os avisos automáticos de recebimento pingarão nesta matriz.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white border-b border-gray-100">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-1/2">Emitente</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">Emissão</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Lançamento</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {pagamentos.slice(0, 10).map(p => {
                                            const aluno = p.aluno as { nome?: string } | null;
                                            return (
                                                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors group cursor-default">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <AvatarInitials nome={aluno?.nome || '?'} size="sm" />
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-gray-900 truncate">{aluno?.nome || 'Desconhecido'}</p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <StatusBadge status={p.status} size="sm" />
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{p.metodo || 'PIX'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 hidden sm:table-cell">
                                                        <p className="text-xs font-bold text-gray-500 tabular-nums">Venc. {formatDate(p.data_vencimento).slice(0, 5)}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <p className="text-sm font-black text-gray-900 tabular-nums leading-tight">
                                                            {formatCurrency(p.valor)}
                                                        </p>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Inadimplentes destaque - Sidebar Direita */}
                        <div className="space-y-6">
                            {inadimplentes.length > 0 && (
                                <div className="bg-gradient-to-br from-red-50 to-orange-50/50 border border-red-200/50 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-400 blur-[80px] opacity-20 pointer-events-none" />

                                    <div className="flex items-center justify-between mb-5 relative z-10">
                                        <h3 className="text-sm font-black text-red-900 uppercase tracking-widest flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Alerta Vermelho</h3>
                                        <Link href="/financeiro/inadimplencia" className="text-xs font-bold text-red-600 hover:text-red-800 uppercase tracking-wider flex items-center bg-white px-2.5 py-1 rounded-md shadow-sm border border-red-100 transition-colors">Ver Fila <ChevronRight className="w-3 h-3 ml-0.5" /></Link>
                                    </div>

                                    <div className="space-y-3 relative z-10">
                                        {inadimplentes.slice(0, 4).map(p => {
                                            // eslint-disable-next-line react-hooks/purity
                                            const dias = Math.floor((Date.now() - new Date(p.data_vencimento).getTime()) / (1000 * 60 * 60 * 24));
                                            return (
                                                <div key={p.id} className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 shadow-sm border border-red-100 hover:border-red-300 transition-colors">
                                                    <div className="min-w-0 pr-3">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{(p.aluno as { nome?: string } | null)?.nome}</p>
                                                        <p className="text-[10px] uppercase font-bold text-red-500 mt-1">Estourou há {dias}d</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-base font-black text-red-700 tracking-tight">{formatCurrency(p.valor)}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="bg-[#111827] rounded-3xl p-6 shadow-md border border-gray-800">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Módulo Automação</p>
                                <h4 className="text-lg font-black text-white mb-4">Fechamento PIX Ativo</h4>
                                <p className="text-sm font-medium text-gray-400 leading-relaxed mb-5">
                                    Assim que a confirmação da api do Mercado Pago disparar um webhook para esta engine, o caixa local dará baixa da inadimplência sem fricção.
                                </p>
                                <div className="w-full h-8 flex items-center justify-center bg-green-500/10 rounded-lg border border-green-500/30">
                                    <span className="text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Listening Webhook Ping</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    )
}
