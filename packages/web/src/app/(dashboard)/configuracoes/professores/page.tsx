'use client'

import { useState } from 'react'
import {
    Users,
    Plus,
    Trash2,
    ShieldCheck,
    GraduationCap,
    Phone,
    Mail,
    BookOpen,
    ToggleLeft,
    ToggleRight,
    X,
    Save,
    Palette,
    ChevronLeft,
    Send,
    CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { useProfessores, type CriarProfessorPayload, type Professor } from '@/hooks/useProfessores'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { toast } from 'sonner'

const CORES = [
    '#CC0000', '#DC2626', '#EA580C', '#D97706',
    '#16A34A', '#0284C7', '#7C3AED', '#DB2777',
    '#0F172A', '#374151',
]

function CorAvatar({ nome, cor }: { nome: string; cor: string }) {
    const iniciais = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    return (
        <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shrink-0"
            style={{ background: cor }}
        >
            {iniciais}
        </div>
    )
}

function RoleBadge({ role }: { role: Professor['role'] }) {
    if (role === 'super_admin') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
                <ShieldCheck className="h-3 w-3" /> Admin Master
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
            <GraduationCap className="h-3 w-3" /> Professor
        </span>
    )
}

const formVazio: CriarProfessorPayload = {
    nome: '',
    email: '',
    telefone: '',
    bio: '',
    especialidade: '',
    role: 'professor',
    cor_perfil: '#CC0000',
}

export default function ProfessoresPage() {
    const { professores, loading, error, criarprofessor, atualizarProfessor, toggleAtivo, excluirProfessor } = useProfessores()
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState<CriarProfessorPayload>(formVazio)
    const [salvando, setSalvando] = useState(false)
    const [excluindo, setExcluindo] = useState<string | null>(null)
    const [editandoId, setEditandoId] = useState<string | null>(null)
    const [convidando, setConvidando] = useState<string | null>(null)
    const [convidados, setConvidados] = useState<Set<string>>(new Set())

    function abrirModal(professor?: Professor) {
        if (professor) {
            setForm({
                nome: professor.nome,
                email: professor.email,
                telefone: professor.telefone ?? '',
                bio: professor.bio ?? '',
                especialidade: professor.especialidade ?? '',
                role: professor.role,
                cor_perfil: professor.cor_perfil,
            })
            setEditandoId(professor.id)
        } else {
            setForm(formVazio)
            setEditandoId(null)
        }
        setShowModal(true)
    }

    function fecharModal() {
        setShowModal(false)
        setForm(formVazio)
        setEditandoId(null)
    }

    async function handleSalvar() {
        if (!form.nome.trim() || !form.email.trim()) {
            toast.error('Nome e e-mail são obrigatórios.')
            return
        }
        setSalvando(true)
        try {
            if (editandoId) {
                const { ok, error } = await atualizarProfessor(editandoId, form)
                if (!ok) toast.error(error ?? 'Erro ao salvar.')
                else fecharModal()
            } else {
                const { data, error } = await criarprofessor(form)
                if (error) {
                    toast.error(error)
                } else {
                    fecharModal()
                    // Oferecer envio de convite logo após cadastrar
                    if (data) {
                        toast('Professor cadastrado! Enviar convite de acesso agora?', {
                            action: {
                                label: 'Enviar convite',
                                onClick: () => handleConvidar(data),
                            },
                            duration: 8000,
                        })
                    }
                }
            }
        } finally {
            setSalvando(false)
        }
    }

    async function handleConvidar(professor: Professor) {
        setConvidando(professor.id)
        try {
            const res = await fetch('/api/professores/convidar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    professorId: professor.id,
                    email: professor.email,
                    nome: professor.nome,
                }),
            })
            const json = await res.json()
            if (!res.ok) {
                toast.error(json.error ?? 'Erro ao enviar convite.')
            } else {
                setConvidados(prev => new Set(prev).add(professor.id))
                toast.success(`Convite enviado para ${professor.email}!`)
            }
        } catch {
            toast.error('Erro de conexão ao enviar convite.')
        } finally {
            setConvidando(null)
        }
    }

    async function handleExcluir(professor: Professor) {
        if (professor.role === 'super_admin') {
            toast.error('Não é possível remover o Admin Master.')
            return
        }
        if (!confirm(`Remover o professor ${professor.nome}? Suas aulas serão mantidas sem vínculo.`)) return
        setExcluindo(professor.id)
        await excluirProfessor(professor.id)
        setExcluindo(null)
    }

    const ativos = professores.filter(p => p.ativo).length
    const admins = professores.filter(p => p.role === 'super_admin').length

    return (
        <div className="mx-auto max-w-5xl space-y-6 pb-10 animate-in slide-in-from-bottom-2 duration-500">

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-red-400/15 blur-3xl" />
                <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/configuracoes" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-gray-900">
                                <Users className="h-6 w-6 text-[#CC0000]" />
                                Equipe de Professores
                            </h1>
                            <p className="mt-0.5 text-sm font-medium text-gray-400">
                                Gerencie quem pode criar aulas, publicar no feed e acessar o painel.
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center min-w-[72px]">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</p>
                            <p className="mt-0.5 text-2xl font-black text-gray-900">{professores.length}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center min-w-[72px]">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Ativos</p>
                            <p className="mt-0.5 text-2xl font-black text-emerald-700">{ativos}</p>
                        </div>
                        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-center min-w-[72px]">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Admins</p>
                            <p className="mt-0.5 text-2xl font-black text-amber-700">{admins}</p>
                        </div>
                        <button
                            onClick={() => abrirModal()}
                            className="ml-2 inline-flex items-center gap-2 rounded-xl bg-[#CC0000] px-5 py-3 text-sm font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md active:scale-95"
                        >
                            <Plus className="h-4 w-4" /> Novo Professor
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista */}
            {loading ? (
                <LoadingSpinner label="Carregando equipe..." />
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-bold text-red-600">
                    {error}
                </div>
            ) : professores.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
                    <Users className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-3 text-base font-black text-gray-400">Nenhum professor cadastrado</p>
                    <p className="mt-1 text-sm text-gray-400">Clique em &quot;Novo Professor&quot; para adicionar o primeiro.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {professores.map(prof => (
                        <div
                            key={prof.id}
                            className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md ${prof.ativo ? 'border-gray-100' : 'border-gray-200 bg-gray-50/50 opacity-75'}`}
                        >
                            {/* Accent colorido */}
                            <div
                                className="absolute top-0 left-0 h-1 w-full"
                                style={{ background: prof.cor_perfil }}
                            />

                            <div className="flex items-start gap-4">
                                <CorAvatar nome={prof.nome} cor={prof.cor_perfil} />

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="text-base font-black tracking-tight text-gray-900 truncate">
                                            {prof.nome}
                                        </h3>
                                        <RoleBadge role={prof.role} />
                                        {!prof.ativo && (
                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                                                Inativo
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <p className="flex items-center gap-1.5 text-xs font-bold text-gray-400 truncate">
                                            <Mail className="h-3 w-3 shrink-0" /> {prof.email}
                                        </p>
                                        {prof.telefone && (
                                            <p className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                <Phone className="h-3 w-3 shrink-0" /> {prof.telefone}
                                            </p>
                                        )}
                                        {prof.especialidade && (
                                            <p className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                <BookOpen className="h-3 w-3 shrink-0" /> {prof.especialidade}
                                            </p>
                                        )}
                                        {prof.bio && (
                                            <p className="mt-2 text-xs font-medium leading-relaxed text-gray-500 line-clamp-2 border-t border-gray-100 pt-2">
                                                {prof.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 gap-2 flex-wrap">
                                <button
                                    onClick={() => toggleAtivo(prof)}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all ${prof.ativo ? 'text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200' : 'text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'}`}
                                >
                                    {prof.ativo
                                        ? <><ToggleRight className="h-4 w-4" /> Desativar</>
                                        : <><ToggleLeft className="h-4 w-4" /> Ativar</>
                                    }
                                </button>

                                <div className="flex items-center gap-2">
                                    {/* Botão de convite */}
                                    <button
                                        onClick={() => handleConvidar(prof)}
                                        disabled={convidando === prof.id || convidados.has(prof.id)}
                                        title="Enviar e-mail de convite com link de acesso"
                                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-60 ${convidados.has(prof.id)
                                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-600 cursor-default'
                                            : 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100'
                                            }`}
                                    >
                                        {convidando === prof.id ? (
                                            <LoadingSpinner size="sm" />
                                        ) : convidados.has(prof.id) ? (
                                            <><CheckCircle2 className="h-3.5 w-3.5" /> Enviado</>
                                        ) : (
                                            <><Send className="h-3.5 w-3.5" /> Convidar</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => abrirModal(prof)}
                                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-widest text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50"
                                    >
                                        Editar
                                    </button>
                                    {prof.role !== 'super_admin' && (
                                        <button
                                            onClick={() => handleExcluir(prof)}
                                            disabled={excluindo === prof.id}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition-all hover:bg-red-100 hover:border-red-200 disabled:opacity-50"
                                        >
                                            {excluindo === prof.id ? <LoadingSpinner size="sm" /> : <Trash2 className="h-3.5 w-3.5" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Criar/Editar */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-black tracking-tight text-gray-900">
                                    {editandoId ? 'Editar Professor' : 'Novo Professor'}
                                </h2>
                                <p className="text-xs font-bold text-gray-400 mt-0.5">
                                    {editandoId ? 'Atualize os dados do perfil.' : 'Adicione um novo membro à equipe.'}
                                </p>
                            </div>
                            <button onClick={fecharModal} className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {/* Preview do avatar */}
                            {form.nome && (
                                <div className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4">
                                    <CorAvatar nome={form.nome} cor={form.cor_perfil ?? '#CC0000'} />
                                    <div>
                                        <p className="font-black text-gray-900">{form.nome || 'Nome do professor'}</p>
                                        <p className="text-xs font-bold text-gray-400">{form.especialidade || 'Especialidade'}</p>
                                    </div>
                                </div>
                            )}

                            {/* Grids de campos */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-gray-500">
                                        Nome completo <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.nome}
                                        onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                                        placeholder="Ex.: João Silva"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 outline-none ring-0 transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000]/20 placeholder:text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-gray-500">
                                        E-mail <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        placeholder="oi@email.com"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 outline-none ring-0 transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000]/20 placeholder:text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-gray-500">
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={form.telefone}
                                        onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                                        placeholder="(11) 99999-9999"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 outline-none ring-0 transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000]/20 placeholder:text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-gray-500">
                                        Especialidade
                                    </label>
                                    <input
                                        type="text"
                                        value={form.especialidade}
                                        onChange={e => setForm(f => ({ ...f, especialidade: e.target.value }))}
                                        placeholder="Ex.: Boxe técnico, Muay Thai..."
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 outline-none ring-0 transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000]/20 placeholder:text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-gray-500">
                                        Nível de Acesso
                                    </label>
                                    <select
                                        value={form.role}
                                        onChange={e => setForm(f => ({ ...f, role: e.target.value as Professor['role'] }))}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 outline-none ring-0 transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000]/20 cursor-pointer"
                                    >
                                        <option value="professor">Professor</option>
                                        <option value="super_admin">Admin Master</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-gray-500">
                                        Bio profissional
                                    </label>
                                    <textarea
                                        value={form.bio}
                                        onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                                        placeholder="Breve descrição sobre o professor, carreira, conquistas..."
                                        rows={3}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 outline-none ring-0 transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000]/20 placeholder:text-gray-300 resize-none"
                                    />
                                </div>

                                {/* Cor do perfil */}
                                <div className="sm:col-span-2">
                                    <label className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-500">
                                        <Palette className="h-3.5 w-3.5" /> Cor do perfil
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {CORES.map(cor => (
                                            <button
                                                key={cor}
                                                onClick={() => setForm(f => ({ ...f, cor_perfil: cor }))}
                                                className={`h-8 w-8 rounded-xl transition-all hover:scale-110 ${form.cor_perfil === cor ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                                                style={{ background: cor }}
                                                title={cor}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                            <button
                                onClick={fecharModal}
                                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSalvar}
                                disabled={salvando}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#CC0000] px-6 py-2.5 text-sm font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-red-700 disabled:opacity-60"
                            >
                                {salvando ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
                                {editandoId ? 'Salvar Alterações' : 'Cadastrar Professor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
