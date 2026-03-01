'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

export default function RecuperarSenhaPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [enviado, setEnviado] = useState(false)
    const supabase = createClient()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback`,
        })

        if (error) {
            toast.error('Erro ao enviar e-mail. Tente novamente.')
            setLoading(false)
            return
        }

        setEnviado(true)
        setLoading(false)
    }

    if (enviado) {
        return (
            <div className="w-full max-w-sm text-center">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="text-4xl mb-4">📬</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        E-mail enviado!
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                    </p>
                    <Link
                        href="/login"
                        className="text-sm text-[#CC0000] hover:underline"
                    >
                        Voltar para o login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-sm">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">
                    <span className="text-[#CC0000]">CT</span>
                    <span className="text-gray-900"> Boxe</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1">Recuperar acesso</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Esqueceu sua senha?
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                    Digite seu e-mail e enviaremos um link para redefinição.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#CC0000] hover:bg-[#AA0000] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                    >
                        {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
                        ← Voltar para o login
                    </Link>
                </div>
            </div>
        </div>
    )
}
