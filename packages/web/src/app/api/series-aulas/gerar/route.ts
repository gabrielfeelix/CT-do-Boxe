import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { gerarAulasRecorrentes, parseDateOnly } from '@/lib/aulas/recorrencia'

function calcularPeriodoPadrao() {
    const inicio = new Date()
    const fim = new Date(inicio.getTime())
    fim.setDate(fim.getDate() + 35)
    return {
        dataInicio: inicio.toISOString().slice(0, 10),
        dataFim: fim.toISOString().slice(0, 10),
    }
}

function isDataValida(value: string) {
    return parseDateOnly(value) !== null
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const periodoPadrao = calcularPeriodoPadrao()
    const dataInicio = searchParams.get('data_inicio') ?? periodoPadrao.dataInicio
    const dataFim = searchParams.get('data_fim') ?? periodoPadrao.dataFim
    const serieId = searchParams.get('serie_id') ?? undefined

    if (!isDataValida(dataInicio) || !isDataValida(dataFim)) {
        return NextResponse.json({ error: 'Periodo invalido.' }, { status: 400 })
    }

    try {
        const supabase = await createClient()
        const result = await gerarAulasRecorrentes({
            supabase,
            dataInicio,
            dataFim,
            serieId,
        })

        return NextResponse.json({ data: result }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Não foi possível gerar as aulas recorrentes.' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}))
    const periodoPadrao = calcularPeriodoPadrao()
    const dataInicio = body.data_inicio ?? periodoPadrao.dataInicio
    const dataFim = body.data_fim ?? periodoPadrao.dataFim
    const serieId = body.serie_id ?? undefined

    if (!isDataValida(dataInicio) || !isDataValida(dataFim)) {
        return NextResponse.json({ error: 'Periodo invalido.' }, { status: 400 })
    }

    try {
        const supabase = await createClient()
        const result = await gerarAulasRecorrentes({
            supabase,
            dataInicio,
            dataFim,
            serieId,
        })

        return NextResponse.json({ data: result }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Não foi possível gerar as aulas recorrentes.' }, { status: 500 })
    }
}
