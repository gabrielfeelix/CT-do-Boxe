'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    serieAulaSchema,
    atualizarSerieAulaSchema,
    type AtualizarSerieAulaValues,
    type SerieAulaValues,
} from '@/lib/validations/serie-aula'

export interface SerieAulaResumo {
    id: string
    titulo: string
    dia_semana: number
    hora_inicio: string
    hora_fim: string
    categoria: 'infantil' | 'adulto' | 'todos'
    tipo_aula: 'grupo' | 'individual'
    professor: string
    capacidade_maxima: number
    ativo: boolean
    data_inicio: string
    data_fim: string | null
    created_at: string
    updated_at: string
}

interface UseSeriesAulasOptions {
    ativo?: boolean | 'todos'
}

interface UseSeriesAulasReturn {
    series: SerieAulaResumo[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
    seriesAtivas: SerieAulaResumo[]
    criarSerie: (payload: SerieAulaValues) => Promise<{ data: SerieAulaResumo | null; error: string | null }>
    atualizarSerie: (
        serieId: string,
        payload: AtualizarSerieAulaValues
    ) => Promise<{ data: SerieAulaResumo | null; error: string | null }>
    desativarSerie: (serieId: string, cancelarFuturas?: boolean) => Promise<{ ok: boolean; error: string | null }>
    gerarAulas: (payload?: {
        dataInicio?: string
        dataFim?: string
        serieId?: string
    }) => Promise<{ ok: boolean; error: string | null; criadas?: number }>
}

interface GeracaoResponse {
    data?: {
        criadas: number
        existentes: number
        seriesProcessadas: number
        periodo: {
            dataInicio: string
            dataFim: string
        }
    }
    error?: string
}

function normalizarSerie(row: SerieAulaResumo): SerieAulaResumo {
    return {
        ...row,
        hora_inicio: row.hora_inicio.slice(0, 8),
        hora_fim: row.hora_fim.slice(0, 8),
    }
}

export function useSeriesAulas({ ativo = 'todos' }: UseSeriesAulasOptions = {}): UseSeriesAulasReturn {
    const [series, setSeries] = useState<SerieAulaResumo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchSeries = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            if (ativo !== 'todos') params.set('ativo', String(ativo))

            const response = await fetch(`/api/series-aulas${params.size ? `?${params.toString()}` : ''}`)
            const payload = await response.json()

            if (!response.ok) {
                setError(payload.error ?? 'Não foi possível carregar as séries de aulas.')
                setSeries([])
                return
            }

            const rows = Array.isArray(payload.data) ? (payload.data as SerieAulaResumo[]) : []
            setSeries(rows.map(normalizarSerie))
        } catch (fetchError) {
            console.error(fetchError)
            setError('Não foi possível carregar as séries de aulas.')
            setSeries([])
        } finally {
            setLoading(false)
        }
    }, [ativo])

    useEffect(() => {
        fetchSeries()
    }, [fetchSeries])

    const criarSerie = useCallback(
        async (payload: SerieAulaValues) => {
            const parsed = serieAulaSchema.safeParse(payload)
            if (!parsed.success) {
                return { data: null, error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }
            }

            const response = await fetch('/api/series-aulas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(parsed.data),
            })

            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                return { data: null, error: body.error ?? 'Não foi possível criar a série.' }
            }

            await fetchSeries()
            return { data: normalizarSerie(body.data as SerieAulaResumo), error: null }
        },
        [fetchSeries]
    )

    const atualizarSerie = useCallback(
        async (serieId: string, payload: AtualizarSerieAulaValues) => {
            const parsed = atualizarSerieAulaSchema.safeParse(payload)
            if (!parsed.success) {
                return { data: null, error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }
            }

            const response = await fetch(`/api/series-aulas/${serieId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(parsed.data),
            })

            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                return { data: null, error: body.error ?? 'Não foi possível atualizar a série.' }
            }

            await fetchSeries()
            return { data: normalizarSerie(body.data as SerieAulaResumo), error: null }
        },
        [fetchSeries]
    )

    const desativarSerie = useCallback(
        async (serieId: string, cancelarFuturas = false) => {
            const response = await fetch(
                `/api/series-aulas/${serieId}?cancelar_futuras=${cancelarFuturas ? 'true' : 'false'}`,
                {
                    method: 'DELETE',
                }
            )

            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                return { ok: false, error: body.error ?? 'Não foi possível desativar a série.' }
            }

            await fetchSeries()
            return { ok: true, error: null }
        },
        [fetchSeries]
    )

    const gerarAulas = useCallback(
        async (payload?: { dataInicio?: string; dataFim?: string; serieId?: string }) => {
            const response = await fetch('/api/series-aulas/gerar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data_inicio: payload?.dataInicio,
                    data_fim: payload?.dataFim,
                    serie_id: payload?.serieId,
                }),
            })

            const body = (await response.json().catch(() => ({}))) as GeracaoResponse
            if (!response.ok) {
                return { ok: false, error: body.error ?? 'Não foi possível gerar as aulas.' }
            }

            return { ok: true, error: null, criadas: body.data?.criadas ?? 0 }
        },
        []
    )

    const seriesAtivas = useMemo(() => series.filter((serie) => serie.ativo), [series])

    return {
        series,
        loading,
        error,
        refetch: fetchSeries,
        seriesAtivas,
        criarSerie,
        atualizarSerie,
        desativarSerie,
        gerarAulas,
    }
}
