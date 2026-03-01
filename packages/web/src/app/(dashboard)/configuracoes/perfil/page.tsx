'use client'

import { useEffect, useState } from 'react'
import { KeyRound, Mail, Save, ShieldCheck, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { createClient } from '@/lib/supabase/client'

interface PerfilForm {
    nome: string
    telefone: string
    cargo: string
    email: string
}

const EMPTY_FORM: PerfilForm = {
    nome: '',
    telefone: '',
    cargo: 'Professor',
    email: '',
}

export default function PerfilPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [salvandoPerfil, setSalvandoPerfil] = useState(false)
    const [salvandoSenha, setSalvandoSenha] = useState(false)
    const [perfil, setPerfil] = useState<PerfilForm>(EMPTY_FORM)
    const [novaSenha, setNovaSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')

    useEffect(() => {
        async function fetchPerfil() {
            setLoading(true)

            const {
                data: { user },
                error,
            } = await supabase.auth.getUser()

            if (error || !user) {
                toast.error('Não foi possível carregar o perfil.')
                setLoading(false)
                return
            }

            setPerfil({
                nome: user.user_metadata?.full_name ?? '',
                telefone: user.user_metadata?.phone ?? '',
                cargo: user.user_metadata?.role_label ?? 'Professor',
                email: user.email ?? '',
            })

            setLoading(false)
        }

        fetchPerfil()
    }, [supabase])

    async function handleSalvarPerfil(event: React.FormEvent) {
        event.preventDefault()
        setSalvandoPerfil(true)

        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: perfil.nome.trim(),
                phone: perfil.telefone.trim(),
                role_label: perfil.cargo.trim(),
            },
        })

        setSalvandoPerfil(false)

        if (error) {
            toast.error('Erro ao salvar os dados do perfil.')
            return
        }

        toast.success('Perfil atualizado com sucesso.')
    }

    async function handleSalvarSenha(event: React.FormEvent) {
        event.preventDefault()

        if (!novaSenha || !confirmarSenha) {
            toast.error('Preencha os campos de senha.')
            return
        }

        if (novaSenha.length < 8) {
            toast.error('A nova senha precisa ter ao menos 8 caracteres.')
            return
        }

        if (novaSenha !== confirmarSenha) {
            toast.error('As senhas nao conferem.')
            return
        }

        setSalvandoSenha(true)

        const { error } = await supabase.auth.updateUser({
            password: novaSenha,
        })

        setSalvandoSenha(false)

        if (error) {
            toast.error('Não foi possível atualizar a senha.')
            return
        }

        setNovaSenha('')
        setConfirmarSenha('')
        toast.success('Senha atualizada.')
    }

    if (loading) return <LoadingSpinner label="Carregando perfil..." />

    const fieldClass =
        'h-10 w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3 text-sm font-medium text-gray-800 outline-none transition-all focus:border-[#CC0000] focus:bg-white focus:ring-2 focus:ring-[#CC0000]/20'

    return (
        <div className="mx-auto max-w-4xl space-y-6 pb-8">
            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-gray-900">
                            <UserRound className="h-6 w-6 text-[#CC0000]" />
                            Perfil do Administrador
                        </h2>
                        <p className="mt-1 text-sm font-medium text-gray-500">
                            Defina identidade publica e dados de contato usados no painel.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Conta protegida
                    </div>
                </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
                <form onSubmit={handleSalvarPerfil} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-black tracking-tight text-gray-900">Dados do perfil</h3>
                    <p className="mt-1 text-sm font-medium text-gray-500">Estas informacoes podem aparecer em telas e comunicacoes.</p>

                    <div className="mt-5 space-y-4">
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Nome publico</span>
                            <input
                                value={perfil.nome}
                                onChange={(event) => setPerfil((prev) => ({ ...prev, nome: event.target.value }))}
                                className={fieldClass}
                                placeholder="Ex: Argel Riboli"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">E-mail de acesso</span>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input value={perfil.email} className={`${fieldClass} pl-9`} disabled />
                            </div>
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Telefone</span>
                            <input
                                value={perfil.telefone}
                                onChange={(event) => setPerfil((prev) => ({ ...prev, telefone: event.target.value }))}
                                className={fieldClass}
                                placeholder="(00) 00000-0000"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Cargo exibido</span>
                            <input
                                value={perfil.cargo}
                                onChange={(event) => setPerfil((prev) => ({ ...prev, cargo: event.target.value }))}
                                className={fieldClass}
                                placeholder="Professor"
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={salvandoPerfil}
                        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#CC0000] px-4 text-sm font-bold text-white transition-colors hover:bg-[#AA0000] disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {salvandoPerfil ? 'Salvando...' : 'Salvar perfil'}
                    </button>
                </form>

                <form onSubmit={handleSalvarSenha} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-black tracking-tight text-gray-900">Seguranca de acesso</h3>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                        Atualize sua senha regularmente para manter a conta protegida.
                    </p>

                    <div className="mt-5 space-y-4">
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Nova senha</span>
                            <input
                                type="password"
                                value={novaSenha}
                                onChange={(event) => setNovaSenha(event.target.value)}
                                className={fieldClass}
                                placeholder="Minimo 8 caracteres"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Confirmar nova senha</span>
                            <input
                                type="password"
                                value={confirmarSenha}
                                onChange={(event) => setConfirmarSenha(event.target.value)}
                                className={fieldClass}
                                placeholder="Repita a senha"
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={salvandoSenha}
                        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-60"
                    >
                        <KeyRound className="h-4 w-4" />
                        {salvandoSenha ? 'Atualizando...' : 'Atualizar senha'}
                    </button>
                </form>
            </div>
        </div>
    )
}
