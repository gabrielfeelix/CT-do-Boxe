'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Bell, CalendarClock, CreditCard, ShieldAlert, Megaphone, Trash2, CheckCheck, Check, ExternalLink, Settings2, Instagram, Youtube, Video, RefreshCw, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useNotificacoes, type NotificacaoItem } from '@/hooks/useNotificacoes'

type Filtro = 'todas' | 'nao_lidas'
type Tab = 'inbox' | 'regras'

const TIPO_META: Record<string, { label: string; icon: React.ElementType; tone: string }> = {
    aula: { label: 'Aulas', icon: CalendarClock, tone: 'bg-orange-100 text-orange-700 border-orange-200' },
    pagamento: { label: 'Financeiro', icon: CreditCard, tone: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    ct: { label: 'CT', icon: Bell, tone: 'bg-red-100 text-red-700 border-red-200' },
    sistema: { label: 'Sistema', icon: ShieldAlert, tone: 'bg-slate-100 text-slate-700 border-slate-200' },
}

function obterMeta(tipo: string) {
    return TIPO_META[tipo] ?? { label: 'Geral', icon: Megaphone, tone: 'bg-gray-100 text-gray-700 border-gray-200' }
}

function formatarMomento(valor: string) {
    const data = new Date(valor)
    if (Number.isNaN(data.getTime())) return '-'
    const diffMs = Date.now() - data.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHora = Math.floor(diffMs / 3600000)
    const diffDia = Math.floor(diffMs / 86400000)
    if (diffMin < 1) return 'agora'
    if (diffMin < 60) return `${diffMin} min`
    if (diffHora < 24) return `${diffHora} h`
    if (diffDia < 7) return `${diffDia} d`
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function NotificacaoCard({ item, processando, onToggleLida, onRemover }: {
    item: NotificacaoItem, processando: boolean, onToggleLida: (item: NotificacaoItem) => Promise<void>, onRemover: (id: string) => Promise<void>
}) {
    const meta = obterMeta(item.tipo)
    const Icon = meta.icon
    return (
        <article className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 ${item.lida ? 'border-gray-100 bg-white' : 'border-red-200 bg-gradient-to-r from-red-50/80 to-orange-50/50'}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${meta.tone}`}>
                            <Icon className="h-3.5 w-3.5" /> {meta.label}
                        </span>
                        {!item.lida && <span className="rounded-full bg-[#CC0000] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Nova</span>}
                        <span className="text-xs font-semibold text-gray-400">{formatarMomento(item.created_at)}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{item.titulo}</h3>
                    {item.subtitulo && <p className="mt-0.5 text-sm font-semibold text-gray-600">{item.subtitulo}</p>}
                    {item.mensagem && <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">{item.mensagem}</p>}
                    {item.aluno?.nome && <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Aluno: {item.aluno.nome}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {item.link && <Link href={item.link} className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50">Abrir <ExternalLink className="h-3.5 w-3.5" /></Link>}
                    <button onClick={() => onToggleLida(item)} disabled={processando} className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"><Check className="h-3.5 w-3.5" /> {item.lida ? 'Marcar nova' : 'Marcar lida'}</button>
                    <button onClick={() => onRemover(item.id)} disabled={processando} className="inline-flex h-9 items-center gap-1 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /> Remover</button>
                </div>
            </div>
        </article>
    )
}

function ToggleRule({ label, description, icon: Icon, defaultChecked = false, tag = '' }: { label: string; description: string; icon: React.ElementType; defaultChecked?: boolean; tag?: string }) {
    const [checked, setChecked] = useState(defaultChecked)

    return (
        <div className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 transition-all shadow-sm group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${checked ? 'bg-red-50 text-[#CC0000]' : 'bg-gray-50 text-gray-400'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        {label} {tag && <span className="text-[9px] uppercase font-black tracking-widest bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{tag}</span>}
                    </h4>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">{description}</p>
                </div>
            </div>

            <button
                onClick={() => { setChecked(!checked); toast.success(`Regra de ${label} ${!checked ? 'ativada' : 'desativada'} com sucesso.`); }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:ring-offset-2 ${checked ? 'bg-[#CC0000]' : 'bg-gray-200'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    )
}

function ActionRule({ label, description, icon: Icon, tag = '', actionLabel, onAction }: { label: string; description: string; icon: React.ElementType; tag?: string, actionLabel: string, onAction: () => void }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 transition-all shadow-sm group gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl transition-colors bg-gray-50 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-900">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        {label} {tag && <span className="text-[9px] uppercase font-black tracking-widest bg-gray-900 text-white px-1.5 py-0.5 rounded">{tag}</span>}
                    </h4>
                    <p className="text-xs font-medium text-gray-500 mt-0.5 leading-relaxed pr-2">{description}</p>
                </div>
            </div>

            <button
                onClick={onAction}
                className="w-full sm:w-auto px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm shrink-0"
            >
                {actionLabel}
            </button>
        </div>
    )
}

export default function NotificacoesPage() {
    const { notificacoes, loading, error, naoLidas, marcarComoLida, marcarTodasComoLidas, removerNotificacao } = useNotificacoes()
    const [busca, setBusca] = useState('')
    const [filtro, setFiltro] = useState<Filtro>('todas')
    const [tab, setTab] = useState<Tab>('inbox')
    const [processandoId, setProcessandoId] = useState<string | null>(null)
    const [processandoTudo, setProcessandoTudo] = useState(false)

    const [modalSocial, setModalSocial] = useState<'instagram' | 'youtube' | null>(null)
    const [socialUrl, setSocialUrl] = useState('')
    const [socialMensagem, setSocialMensagem] = useState('')
    const [enviandoPush, setEnviandoPush] = useState(false)

    const listaFiltrada = useMemo(() => {
        const termo = busca.trim().toLowerCase()
        return notificacoes.filter((item) => {
            if (filtro === 'nao_lidas' && item.lida) return false
            if (!termo) return true
            const alvo = [item.titulo, item.subtitulo, item.mensagem, item.aluno?.nome].filter(Boolean).join(' ').toLowerCase()
            return alvo.includes(termo)
        })
    }, [notificacoes, filtro, busca])

    async function handleToggleLida(item: NotificacaoItem) {
        setProcessandoId(item.id)
        const ok = await marcarComoLida(item.id, !item.lida)
        setProcessandoId(null)
        if (!ok) { toast.error('Não foi possível atualizar esta notificacao.'); return }
    }

    async function handleMarcarTodas() {
        setProcessandoTudo(true)
        const ok = await marcarTodasComoLidas()
        setProcessandoTudo(false)
        if (!ok) { toast.error('Erro ao marcar notificacoes.'); return; }
        toast.success('Todas as notificacoes foram marcadas como lidas.')
    }

    async function handleRemover(id: string) {
        setProcessandoId(id)
        const ok = await removerNotificacao(id)
        setProcessandoId(null)
        if (!ok) { toast.error('Não foi possível remover a notificacao.'); return }
    }

    async function handleDispararPush() {
        if (!socialUrl) { toast.error('Insira a URL do vídeo/post.'); return }
        setEnviandoPush(true)
        // Simulate API call to notification engine
        await new Promise(resolve => setTimeout(resolve, 800))
        toast.success(`Push Notification enviado para os alunos com sucesso!`)
        setEnviandoPush(false)
        setModalSocial(null)
        setSocialUrl('')
        setSocialMensagem('')
    }

    return (
        <div className="mx-auto max-w-[1440px] space-y-6 pb-8 animate-in slide-in-from-bottom-2 duration-500">
            {/* Header com Tabs Estilo Enterprise */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-0 gap-4">
                <div className="pb-4">
                    <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-gray-900">
                        <Smartphone className="h-6 w-6 text-[#CC0000]" /> Notificações & Automações
                    </h2>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                        Central de mensageria e regras de push automáticas para o app dos alunos.
                    </p>
                </div>

                <div className="flex gap-6 border-b-2 border-transparent">
                    <button
                        onClick={() => setTab('inbox')}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest relative transition-colors ${tab === 'inbox' ? 'text-[#CC0000]' : 'text-gray-400 hover:text-gray-700'}`}
                    >
                        Caixa de Entrada {naoLidas > 0 && <span className="ml-1.5 bg-red-100 text-red-700 py-0.5 px-2 rounded-full text-[10px]">{naoLidas}</span>}
                        {tab === 'inbox' && <div className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-[#CC0000]" />}
                    </button>
                    <button
                        onClick={() => setTab('regras')}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest relative transition-colors ${tab === 'regras' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
                    >
                        Regras do Sistema
                        {tab === 'regras' && <div className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-gray-900" />}
                    </button>
                </div>
            </div>

            {tab === 'inbox' ? (
                <>
                    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-1 items-center gap-2">
                            <input
                                value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por título, aluno ou mensagem..."
                                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 text-sm font-medium text-gray-800 outline-none transition-all focus:border-[#CC0000] focus:bg-white focus:ring-2 focus:ring-[#CC0000]/20"
                            />
                            <div className="hidden items-center gap-2 sm:flex">
                                <button onClick={() => setFiltro('todas')} className={`h-10 rounded-xl px-4 text-xs font-bold uppercase tracking-wider transition-colors ${filtro === 'todas' ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>Todas</button>
                                <button onClick={() => setFiltro('nao_lidas')} className={`h-10 rounded-xl px-4 text-xs font-bold uppercase tracking-wider transition-colors ${filtro === 'nao_lidas' ? 'bg-[#CC0000] text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>Nao lidas</button>
                            </div>
                        </div>
                        <button onClick={handleMarcarTodas} disabled={naoLidas === 0 || processandoTudo} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"><CheckCheck className="h-4 w-4" /> Marcar todas</button>
                    </section>
                    {loading ? <LoadingSpinner label="Carregando notificacoes..." /> : error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : listaFiltrada.length === 0 ? <EmptyState icon={Bell} title="Sem notificacoes por aqui" description="Nenhum item combina com os filtros atuais." /> : (
                        <div className="space-y-4">
                            {listaFiltrada.map((item) => <NotificacaoCard key={item.id} item={item} processando={processandoId === item.id} onToggleLida={handleToggleLida} onRemover={handleRemover} />)}
                        </div>
                    )}
                </>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">

                    {/* Coluna Específica: Aulas e Financeiro */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-500" /> Financeiro & Contratos</h3>
                            <div className="space-y-3">
                                <ToggleRule icon={CreditCard} label="Aviso de Fatura a Vencer" description="Envia push ao aluno 3 dias antes do vencimento do PIX" defaultChecked={true} tag="D-3" />
                                <ToggleRule icon={ShieldAlert} label="Aviso de Inadimplência" description="Alerta o aluno no dia seguinte caso a fatura não seja paga" defaultChecked={true} tag="D+1" />
                                <ToggleRule icon={RefreshCw} label="Aviso de Vencimento do Plano" description="Lembra o aluno que o contrato expira em breve" defaultChecked={true} tag="D-7" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2"><CalendarClock className="w-4 h-4 text-orange-500" /> Agenda de Aulas</h3>
                            <div className="space-y-3">
                                <ToggleRule icon={CalendarClock} label="Lembrete de Aula Marcada" description="Notifica o aluno 2h antes da aula agendada" defaultChecked={true} />
                                <ToggleRule icon={Bell} label="Aviso de Nova Aula Liberada" description="Notifica todos quando uma nova aula é adicionada à grade" defaultChecked={false} />
                            </div>
                        </div>
                    </div>

                    {/* Coluna Específica: Social e Marketing */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2"><Megaphone className="w-4 h-4 text-blue-500" /> Marketing & Social Push</h3>
                            <div className="space-y-3">
                                <ToggleRule icon={Instagram} label="Postagem no Feed" description="Dispara Push Notification sempre que você cria um aviso no Feed do CT" defaultChecked={true} tag="APP FEED" />
                                <ActionRule
                                    icon={Video}
                                    label="Disparo: Reels / Post IG"
                                    description="Sem integração direta (API do Meta restrita). Cole a URL da sua postagem para disparar o Push aos alunos manualmente."
                                    actionLabel="Disparar Push"
                                    onAction={() => setModalSocial('instagram')}
                                    tag="MANUAL"
                                />
                                <ActionRule
                                    icon={Youtube}
                                    label="Disparo: Vídeo YouTube"
                                    description="Sem integração Hubbub nativa ativa. Use este botão sempre que lançar um vídeo novo para notificar direto no App."
                                    actionLabel="Disparar Push"
                                    onAction={() => setModalSocial('youtube')}
                                    tag="MANUAL"
                                />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-orange-50/50 border border-red-200 p-6 rounded-3xl shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-400 blur-[80px] opacity-20 pointer-events-none" />
                            <Settings2 className="w-8 h-8 text-red-500 mb-4 relative z-10" />
                            <h4 className="text-lg font-black text-gray-900 mb-2 relative z-10">Motor de Regras Inteligentes</h4>
                            <p className="text-xs font-medium text-gray-600 leading-relaxed mb-4 relative z-10">
                                Para automações diretas (Onde o sistema posta sozinho ao detectar um vídeo no Instagram), é necessária aprovação do App Developer da Meta e vinculação de conta. Como fluxo contínuo, utilize os <strong className="text-gray-900 font-bold">botões de Disparo Manual</strong> acima.
                            </p>
                        </div>
                    </div>

                </div>
            )}

            {/* Modal Submissao Social */}
            {modalSocial && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setModalSocial(null)} />
                    <div className="w-full max-w-md animate-in zoom-in-95 bg-white rounded-3xl p-6 shadow-2xl relative z-10 border border-gray-100 flex flex-col gap-5">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className={`p-3 rounded-2xl ${modalSocial === 'instagram' ? 'bg-pink-50 text-pink-600' : 'bg-red-50 text-red-600'}`}>
                                {modalSocial === 'instagram' ? <Instagram className="w-6 h-6" /> : <Youtube className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 leading-tight">Divulgar {modalSocial === 'instagram' ? 'no Instagram' : 'no YouTube'}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Disparo de Push</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">URL da Publicação</label>
                                <input
                                    type="url"
                                    value={socialUrl}
                                    onChange={e => setSocialUrl(e.target.value)}
                                    placeholder={modalSocial === 'instagram' ? "https://instagram.com/p/..." : "https://youtube.com/watch?v=..."}
                                    className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-3 outline-none focus:bg-white focus:border-gray-400 font-medium text-sm transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Mensagem do Push (Opcional)</label>
                                <textarea
                                    value={socialMensagem}
                                    onChange={e => setSocialMensagem(e.target.value)}
                                    placeholder="Ex: Confere só esse nocaute que a gente postou agora! 🥊"
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:bg-white focus:border-gray-400 font-medium text-sm transition-colors resize-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button onClick={() => setModalSocial(null)} className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
                            <button onClick={handleDispararPush} disabled={enviandoPush || !socialUrl} className="py-3 px-4 text-xs font-bold uppercase tracking-widest text-white bg-gray-900 hover:bg-black rounded-xl shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center">
                                {enviandoPush ? <LoadingSpinner size="sm" /> : 'Disparar Agora'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
