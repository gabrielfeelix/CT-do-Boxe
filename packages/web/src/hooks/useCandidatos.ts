/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Candidato } from '@/types'

interface UseCandidatosOptions {
    status?: string
}

export function useCandidatos({ status = '' }: UseCandidatosOptions = {}) {
    const [candidatos, setCandidatos] = useState<Candidato[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [pendentes, setPendentes] = useState(0)
    const supabase = createClient()

    const fetch = useCallback(async () => {
        setLoading(true)

        let query = supabase
            .from('candidatos')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })

        if (status && status !== 'todos') {
            query = query.eq('status', status)
        }

        const { data, count } = await query
        setCandidatos((data as Candidato[]) ?? [])
        setTotal(count ?? 0)

        // Conta pendentes separadamente (para o badge)
        const { count: countPendentes } = await supabase
            .from('candidatos')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'aguardando')

        setPendentes(countPendentes ?? 0)
        setLoading(false)
    }, [status])

    useEffect(() => { fetch() }, [fetch])

    return { candidatos, loading, total, pendentes, refetch: fetch }
}

export function useCandidato(id: string) {
    const [candidato, setCandidato] = useState<Candidato | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetch = useCallback(async () => {
        if (!id) return
        setLoading(true)
        const { data } = await supabase.from('candidatos').select('*').eq('id', id).single()
        setCandidato(data as Candidato)
        setLoading(false)
    }, [id])

    useEffect(() => { fetch() }, [fetch])

    return { candidato, loading, refetch: fetch }
}
