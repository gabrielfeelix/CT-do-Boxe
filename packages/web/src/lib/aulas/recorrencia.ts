import type { SupabaseClient } from '@supabase/supabase-js'

export interface SerieAulaRow {
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
}

interface AulaExistenteRow {
    serie_id: string | null
    data: string
}

interface AulaInsertRow {
    titulo: string
    data: string
    hora_inicio: string
    hora_fim: string
    professor: string
    capacidade_maxima: number
    status: 'agendada'
    categoria: 'infantil' | 'adulto' | 'todos'
    tipo_aula: 'grupo' | 'individual'
    serie_id: string
}

type SupabaseDbClient = SupabaseClient

export interface GerarAulasRecorrentesParams {
    supabase: SupabaseDbClient
    dataInicio: string
    dataFim: string
    serieId?: string
}

export interface GerarAulasRecorrentesResult {
    criadas: number
    existentes: number
    seriesProcessadas: number
    periodo: {
        dataInicio: string
        dataFim: string
    }
}

export function parseDateOnly(value: string): Date | null {
    const [ano, mes, dia] = value.split('-').map(Number)
    if (!ano || !mes || !dia) return null
    const parsed = new Date(Date.UTC(ano, mes - 1, dia))
    if (Number.isNaN(parsed.getTime())) return null
    return parsed
}

export function formatDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10)
}

export function subtrairUmDia(data: string): string | null {
    const parsed = parseDateOnly(data)
    if (!parsed) return null
    parsed.setUTCDate(parsed.getUTCDate() - 1)
    return formatDateOnly(parsed)
}

function maxDate(a: Date, b: Date): Date {
    return a.getTime() >= b.getTime() ? a : b
}

function minDate(a: Date, b: Date): Date {
    return a.getTime() <= b.getTime() ? a : b
}

function normalizarHora(value: string): string {
    if (value.length === 5) return `${value}:00`
    if (value.length >= 8) return value.slice(0, 8)
    return value
}

function gerarDatasDaSerie(serie: SerieAulaRow, inicio: Date, fim: Date): string[] {
    const cursor = new Date(inicio.getTime())
    const deslocamento = (serie.dia_semana - cursor.getUTCDay() + 7) % 7
    cursor.setUTCDate(cursor.getUTCDate() + deslocamento)

    const datas: string[] = []

    while (cursor.getTime() <= fim.getTime()) {
        datas.push(formatDateOnly(cursor))
        cursor.setUTCDate(cursor.getUTCDate() + 7)
    }

    return datas
}

export async function gerarAulasRecorrentes({
    supabase,
    dataInicio,
    dataFim,
    serieId,
}: GerarAulasRecorrentesParams): Promise<GerarAulasRecorrentesResult> {
    const inicio = parseDateOnly(dataInicio)
    const fim = parseDateOnly(dataFim)

    if (!inicio || !fim || inicio.getTime() > fim.getTime()) {
        throw new Error('Periodo invalido para gerar aulas recorrentes.')
    }

    let seriesQuery = supabase
        .from('series_aulas')
        .select(
            'id,titulo,dia_semana,hora_inicio,hora_fim,categoria,tipo_aula,professor,capacidade_maxima,ativo,data_inicio,data_fim'
        )
        .eq('ativo', true)
        .lte('data_inicio', dataFim)
        .or(`data_fim.is.null,data_fim.gte.${dataInicio}`)
        .order('dia_semana', { ascending: true })
        .order('hora_inicio', { ascending: true })

    if (serieId) {
        seriesQuery = seriesQuery.eq('id', serieId)
    }

    const { data: seriesData, error: seriesError } = await seriesQuery

    if (seriesError) {
        throw new Error('Não foi possível carregar as séries de aulas.')
    }

    const series = (seriesData ?? []) as SerieAulaRow[]

    if (series.length === 0) {
        return {
            criadas: 0,
            existentes: 0,
            seriesProcessadas: 0,
            periodo: { dataInicio, dataFim },
        }
    }

    const seriesIds = series.map((serie) => serie.id)
    const { data: aulasExistentesData, error: aulasExistentesError } = await supabase
        .from('aulas')
        .select('serie_id,data')
        .in('serie_id', seriesIds)
        .gte('data', dataInicio)
        .lte('data', dataFim)

    if (aulasExistentesError) {
        throw new Error('Não foi possível carregar as aulas ja existentes.')
    }

    const aulasExistentes = (aulasExistentesData ?? []) as AulaExistenteRow[]
    const existentesKeys = new Set(
        aulasExistentes
            .filter((aula) => Boolean(aula.serie_id))
            .map((aula) => `${aula.serie_id ?? ''}|${aula.data}`)
    )

    const novasAulas: AulaInsertRow[] = []
    let existentes = 0

    for (const serie of series) {
        const inicioSerie = parseDateOnly(serie.data_inicio)
        const fimSerie = serie.data_fim ? parseDateOnly(serie.data_fim) : null
        if (!inicioSerie) continue

        const inicioEfetivo = maxDate(inicio, inicioSerie)
        const fimEfetivo = fimSerie ? minDate(fim, fimSerie) : fim
        if (inicioEfetivo.getTime() > fimEfetivo.getTime()) continue

        const datas = gerarDatasDaSerie(serie, inicioEfetivo, fimEfetivo)

        for (const data of datas) {
            const key = `${serie.id}|${data}`
            if (existentesKeys.has(key)) {
                existentes += 1
                continue
            }

            novasAulas.push({
                titulo: serie.titulo,
                data,
                hora_inicio: normalizarHora(serie.hora_inicio),
                hora_fim: normalizarHora(serie.hora_fim),
                professor: serie.professor,
                capacidade_maxima: serie.capacidade_maxima,
                status: 'agendada',
                categoria: serie.categoria,
                tipo_aula: serie.tipo_aula,
                serie_id: serie.id,
            })
            existentesKeys.add(key)
        }
    }

    let criadas = 0
    if (novasAulas.length > 0) {
        const chunkSize = 200
        for (let index = 0; index < novasAulas.length; index += chunkSize) {
            const chunk = novasAulas.slice(index, index + chunkSize)
            const { error: insertError } = await supabase.from('aulas').insert(chunk)
            if (insertError) {
                throw new Error('Não foi possível gerar as aulas recorrentes.')
            }
            criadas += chunk.length
        }
    }

    return {
        criadas,
        existentes,
        seriesProcessadas: series.length,
        periodo: { dataInicio, dataFim },
    }
}
