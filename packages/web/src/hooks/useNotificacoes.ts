'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notificacao } from '@/types'

interface NotificacaoAluno {
    nome?: string | null
    email?: string | null
}

export interface NotificacaoItem extends Notificacao {
    aluno?: NotificacaoAluno | null
}

export function useNotificacoes() {
    const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetch = useCallback(async () => {
        setLoading(true)
        setError(null)

        const { data, error: queryError } = await supabase
            .from('notificacoes')
            .select('id,titulo,subtitulo,mensagem,tipo,lida,aluno_id,acao,link,created_at,updated_at,aluno:alunos(nome,email)')
            .order('created_at', { ascending: false })

        if (queryError) {
            setError('Não foi possível carregar as notificacoes.')
            setNotificacoes([])
            setLoading(false)
            return
        }

        setNotificacoes((data as NotificacaoItem[]) ?? [])
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetch()
        }, 0)

        return () => clearTimeout(timer)
    }, [fetch])

    const naoLidas = useMemo(() => notificacoes.filter((item) => !item.lida).length, [notificacoes])

    async function marcarComoLida(id: string, lida: boolean) {
        const { error: updateError } = await supabase
            .from('notificacoes')
            .update({ lida })
            .eq('id', id)

        if (updateError) return false

        setNotificacoes((prev) =>
            prev.map((item) => (item.id === id ? { ...item, lida } : item))
        )

        return true
    }

    async function marcarTodasComoLidas() {
        const { error: updateError } = await supabase
            .from('notificacoes')
            .update({ lida: true })
            .eq('lida', false)

        if (updateError) return false

        setNotificacoes((prev) => prev.map((item) => ({ ...item, lida: true })))
        return true
    }

    async function removerNotificacao(id: string) {
        const { error: deleteError } = await supabase.from('notificacoes').delete().eq('id', id)
        if (deleteError) return false

        setNotificacoes((prev) => prev.filter((item) => item.id !== id))
        return true
    }

    return {
        notificacoes,
        loading,
        error,
        naoLidas,
        refetch: fetch,
        marcarComoLida,
        marcarTodasComoLidas,
        removerNotificacao,
    }
}
