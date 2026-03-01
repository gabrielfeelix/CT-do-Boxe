/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Aluno } from '@/types'

interface UseAlunosOptions {
    busca?: string
    status?: string
    limit?: number
}

interface UseAlunosReturn {
    alunos: Aluno[]
    loading: boolean
    error: string | null
    total: number
    refetch: () => void
}

export function useAlunos({
    busca = '',
    status = '',
    limit = 50,
}: UseAlunosOptions = {}): UseAlunosReturn {
    const [alunos, setAlunos] = useState<Aluno[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [total, setTotal] = useState(0)
    const supabase = createClient()

    const fetch = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            let query = supabase
                .from('alunos')
                .select('*', { count: 'exact' })
                .order('nome', { ascending: true })
                .limit(limit)

            if (busca.trim()) {
                query = query.or(
                    `nome.ilike.%${busca}%,email.ilike.%${busca}%,telefone.ilike.%${busca}%`
                )
            }

            if (status && status !== 'todos') {
                query = query.eq('status', status)
            }

            const { data, error: err, count } = await query

            if (err) throw err

            setAlunos((data as Aluno[]) ?? [])
            setTotal(count ?? 0)
        } catch (e) {
            setError('Erro ao carregar alunos. Tente novamente.')
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [busca, status, limit])

    useEffect(() => {
        fetch()
    }, [fetch])

    return { alunos, loading, error, total, refetch: fetch }
}

// Hook para buscar um único aluno pelo ID
export function useAluno(id: string) {
    const [aluno, setAluno] = useState<Aluno | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetch = useCallback(async () => {
        if (!id) return
        setLoading(true)

        const { data, error: err } = await supabase
            .from('alunos')
            .select('*')
            .eq('id', id)
            .single()

        if (err) {
            setError('Aluno não encontrado.')
        } else {
            setAluno(data as Aluno)
        }

        setLoading(false)
    }, [id])

    useEffect(() => {
        fetch()
    }, [fetch])

    return { aluno, loading, error, refetch: fetch }
}
