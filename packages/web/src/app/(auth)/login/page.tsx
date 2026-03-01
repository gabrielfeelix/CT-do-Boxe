'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
        })

        if (error) {
            toast.error('E-mail ou senha incorretos.')
            setLoading(false)
            return
        }

        toast.success('Login realizado com sucesso!')
        router.push('/dashboard')
        router.refresh()
    }

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side - Brand & Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 border-r border-gray-800 flex-col justify-between p-12 overflow-hidden">
                {/* Background Pattern - very subtle */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

                {/* Brand Red Accent Bar */}
                <div className="absolute top-0 left-0 w-2 h-full bg-[#CC0000]" />

                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        <span className="text-[#CC0000]">CT</span> Boxe
                    </h1>
                    <p className="text-slate-400 font-medium tracking-wide text-sm mt-3 uppercase">
                        Sistema de Gestão Esportiva
                    </p>
                </div>

                <div className="relative z-10 max-w-sm">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                        <ShieldCheck className="h-8 w-8 text-[#CC0000] mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2 leading-tight">Painel de Acesso Restrito</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Controle total sobre alunos, pagamentos, avaliações e grade de aulas em um ambiente limpo, focado em performance.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 text-slate-500 text-sm font-medium">
                    &copy; {new Date().getFullYear()} Equipe Argel Riboli
                </div>
            </div>

            {/* Right Side - Clean Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
                {/* Mobile Header (Hidden on LG) */}
                <div className="lg:hidden absolute top-8 left-8">
                    <h1 className="text-2xl font-black">
                        <span className="text-[#CC0000]">CT</span>
                        <span className="text-gray-900"> Boxe</span>
                    </h1>
                </div>

                <div className="w-full max-w-sm xl:max-w-md animate-in fade-in zoom-in-95 duration-500">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                            Acessar conta
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">
                            Digite suas credenciais corporativas abaixo.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700">
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nome@ctboxe.com.br"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-all shadow-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="senha" className="block text-sm font-bold text-gray-700">
                                    Senha
                                </label>
                                <a href="/recuperar-senha" className="text-sm font-semibold text-[#CC0000] hover:text-[#AA0000] transition-colors">
                                    Recuperar acesso
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    id="senha"
                                    type={showPassword ? 'text' : 'password'}
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-md focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#CC0000] hover:bg-[#AA0000] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-sm hover:shadow transition-all mt-4 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Autenticando...
                                </>
                            ) : (
                                'Entrar no Sistema'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
