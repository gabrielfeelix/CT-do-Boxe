/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Avaliacao } from '@/types'

export function useAvaliacoesAluno(alunoId: string) {
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetch = useCallback(async () => {
        if (!alunoId) return
        setLoading(true)
        const { data } = await supabase
            .from('avaliacoes')
            .select('*')
            .eq('aluno_id', alunoId)
            .order('data_avaliacao', { ascending: false })
        setAvaliacoes((data as Avaliacao[]) ?? [])
        setLoading(false)
    }, [alunoId])

    useEffect(() => { fetch() }, [fetch])
    return { avaliacoes, loading, refetch: fetch }
}

export function useAvaliacao(id: string) {
    const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetch = useCallback(async () => {
        if (!id) return
        setLoading(true)
        const { data } = await supabase.from('avaliacoes').select('*').eq('id', id).single()
        setAvaliacao(data as Avaliacao)
        setLoading(false)
    }, [id])

    useEffect(() => { fetch() }, [fetch])
    return { avaliacao, loading, refetch: fetch }
}

// Lista de avaliações pendentes (agendadas) — para dashboard
export function useAvaliacoesPendentes() {
    const [avaliacoes, setAvaliacoes] = useState<Array<Avaliacao & { aluno?: { nome?: string; email?: string; foto_url?: string } }>>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetch() {
            const { data } = await supabase
                .from('avaliacoes')
                .select('*, aluno:alunos(nome, email, foto_url)')
                .eq('status', 'agendada')
                .order('data_avaliacao', { ascending: true })
                .limit(10)
            setAvaliacoes(data ?? [])
            setLoading(false)
        }
        fetch()
    }, [])

    return { avaliacoes, loading }
}

// Lista de avaliações concluídas — para histórico
export function useAvaliacoesConcluidas() {
    const [avaliacoes, setAvaliacoes] = useState<Array<Avaliacao & { aluno?: { nome?: string; email?: string; foto_url?: string } }>>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetch() {
            const { data } = await supabase
                .from('avaliacoes')
                .select('*, aluno:alunos(nome, email, foto_url)')
                .eq('status', 'concluida')
                .order('data_avaliacao', { ascending: false })
                .limit(10)
            setAvaliacoes(data ?? [])
            setLoading(false)
        }
        fetch()
    }, [])

    return { avaliacoes, loading }
}
