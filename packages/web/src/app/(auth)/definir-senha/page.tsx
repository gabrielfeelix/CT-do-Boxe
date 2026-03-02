'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Eye, EyeOff, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react'

export default function DefinirSenhaPage() {
    const [senha, setSenha] = useState('')
    const [confirmar, setConfirmar] = useState('')
    const [loading, setLoading] = useState(false)
    const [showSenha, setShowSenha] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [pronto, setPronto] = useState(false)
    const [nomeUsuario, setNomeUsuario] = useState('')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setNomeUsuario(
                    data.user.user_metadata?.nome_completo ??
                    data.user.email?.split('@')[0] ??
                    'Professor'
                )
            } else {
                // Sem sessão ativa — redireciona para login
                router.push('/login')
            }
        })
    }, [supabase, router])

    const forcas = [
        { label: 'Mín. 8 caracteres', ok: senha.length >= 8 },
        { label: 'Letra maiúscula', ok: /[A-Z]/.test(senha) },
        { label: 'Número', ok: /[0-9]/.test(senha) },
    ]
    const forte = forcas.every(f => f.ok)

    async function handleDefinir(e: React.FormEvent) {
        e.preventDefault()

        if (!forte) {
            toast.error('A senha não atende aos requisitos mínimos.')
            return
        }

        if (senha !== confirmar) {
            toast.error('As senhas não coincidem.')
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.updateUser({ password: senha })

        if (error) {
            toast.error('Erro ao definir a senha. Tente novamente.')
            setLoading(false)
            return
        }

        setPronto(true)
        toast.success('Senha definida com sucesso!')

        setTimeout(() => router.push('/dashboard'), 2000)
    }

    if (pronto) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">Tudo pronto!</h2>
                    <p className="text-gray-500">Redirecionando para o painel...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50/20 p-4">
            {/* Blobs decorativos */}
            <div className="pointer-events-none fixed -top-20 -left-20 h-80 w-80 rounded-full bg-red-400/10 blur-3xl" />
            <div className="pointer-events-none fixed -bottom-20 -right-20 h-80 w-80 rounded-full bg-orange-400/10 blur-3xl" />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
                    {/* Faixa topo */}
                    <div className="bg-gradient-to-r from-[#CC0000] to-red-700 px-8 py-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                <KeyRound className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-red-200">CT Boxe Admin</p>
                                <h1 className="text-xl font-black tracking-tight text-white leading-tight">
                                    Bem-vindo, {nomeUsuario}!
                                </h1>
                            </div>
                        </div>
                        <p className="mt-3 text-sm font-medium text-red-100">
                            Defina sua senha para acessar o painel de treinadores.
                        </p>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleDefinir} className="p-8 space-y-5">
                        {/* Ícone de segurança */}
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                            <p className="text-xs font-bold text-emerald-700">
                                Link de convite verificado — seu acesso está protegido.
                            </p>
                        </div>

                        {/* Campo senha */}
                        <div>
                            <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-gray-500">
                                Nova senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showSenha ? 'text' : 'password'}
                                    value={senha}
                                    onChange={e => setSenha(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 pr-12 text-sm font-medium text-gray-900 outline-none transition-all focus:border-[#CC0000] focus:bg-white focus:ring-2 focus:ring-[#CC0000]/20 placeholder:text-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSenha(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* Indicadores de força */}
                            {senha.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {forcas.map(f => (
                                        <span
                                            key={f.label}
                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${f.ok
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                                                }`}
                                        >
                                            {f.ok ? '✓' : '○'} {f.label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirmar senha */}
                        <div>
                            <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-gray-500">
                                Confirmar senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmar}
                                    onChange={e => setConfirmar(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className={`h-12 w-full rounded-xl border px-4 pr-12 text-sm font-medium text-gray-900 outline-none transition-all focus:ring-2 placeholder:text-gray-300 ${confirmar.length > 0 && confirmar !== senha
                                            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200'
                                            : 'border-gray-200 bg-gray-50 focus:border-[#CC0000] focus:bg-white focus:ring-[#CC0000]/20'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {confirmar.length > 0 && confirmar !== senha && (
                                <p className="mt-1 text-xs font-bold text-red-500">As senhas não coincidem.</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !forte || senha !== confirmar}
                            className="w-full rounded-xl bg-[#CC0000] py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Definindo...' : 'Definir Senha e Acessar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
