'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [loading, setLoading] = useState(false)
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
        <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">
                    <span className="text-[#CC0000]">CT</span>
                    <span className="text-gray-900"> Boxe</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1">Painel de Gestão</p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Entrar na sua conta
                </h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                            E-mail
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="professor@ctboxe.com.br"
                            required
                            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-colors"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="senha"
                            className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                            Senha
                        </label>
                        <input
                            id="senha"
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-colors"
                        />
                    </div>

                    <div className="flex justify-end">
                        <a
                            href="/recuperar-senha"
                            className="text-sm text-[#CC0000] hover:underline"
                        >
                            Esqueci minha senha
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#CC0000] hover:bg-[#AA0000] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
                CT de Boxe — Equipe Argel Riboli
            </p>
        </div>
    )
}
