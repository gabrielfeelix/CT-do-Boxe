/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PagamentoCompleto } from '@/types'

export function useInadimplentes() {
    const [inadimplentes, setInadimplentes] = useState<PagamentoCompleto[]>([])
    const [loading, setLoading] = useState(true)
    const [totalEmAberto, setTotalEmAberto] = useState(0)
    const supabase = createClient()

    const fetch = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase
            .from('pagamentos')
            .select(`*, aluno:alunos(nome, email, telefone)`)
            .eq('status', 'vencido')
            .order('data_vencimento', { ascending: true })

        const lista = (data as PagamentoCompleto[]) ?? []
        setInadimplentes(lista)
        setTotalEmAberto(lista.reduce((acc, p) => acc + p.valor, 0))
        setLoading(false)
    }, [])

    useEffect(() => { fetch() }, [fetch])

    return { inadimplentes, loading, totalEmAberto, refetch: fetch }
}

export function usePagamentosDoMes() {
    const [pagamentos, setPagamentos] = useState<PagamentoCompleto[]>([])
    const [loading, setLoading] = useState(true)
    const [totalPago, setTotalPago] = useState(0)
    const [totalPendente, setTotalPendente] = useState(0)
    const supabase = createClient()

    const fetch = useCallback(async () => {
        setLoading(true)

        const inicioMes = new Date()
        inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0)

        const { data } = await supabase
            .from('pagamentos')
            .select(`*, aluno:alunos(nome, email)`)
            .gte('created_at', inicioMes.toISOString())
            .order('created_at', { ascending: false })

        const lista = (data as PagamentoCompleto[]) ?? []
        setPagamentos(lista)
        setTotalPago(lista.filter(p => p.status === 'pago').reduce((acc, p) => acc + p.valor, 0))
        setTotalPendente(lista.filter(p => p.status === 'pendente').reduce((acc, p) => acc + p.valor, 0))
        setLoading(false)
    }, [])

    useEffect(() => { fetch() }, [fetch])

    return { pagamentos, loading, totalPago, totalPendente, refetch: fetch }
}
