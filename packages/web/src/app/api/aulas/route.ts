import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aulaFormSchema } from '@/lib/validations/aula'

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const categoria = searchParams.get('categoria')
    const dataInicio = searchParams.get('data_inicio')
    const dataFim = searchParams.get('data_fim')
    const limit = Number(searchParams.get('limit') ?? 100)

    let query = supabase
        .from('aulas')
        .select(
            'id,titulo,data,hora_inicio,hora_fim,professor,capacidade_maxima,status,categoria,tipo_aula,serie_id,created_at,updated_at,presencas(status)',
            {
                count: 'exact',
            }
        )
        .order('data', { ascending: true })
        .order('hora_inicio', { ascending: true })
        .limit(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 100)

    if (status && status !== 'todos') query = query.eq('status', status)
    if (categoria && categoria !== 'todos') query = query.eq('categoria', categoria)
    if (dataInicio) query = query.gte('data', dataInicio)
    if (dataFim) query = query.lte('data', dataFim)

    const { data, error, count } = await query

    if (error) {
        return NextResponse.json({ error: 'Não foi possível carregar as aulas.' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [], count: count ?? 0 }, { status: 200 })
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const body = await request.json()
    const parsed = aulaFormSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }, { status: 400 })
    }

    const { data, error } = await supabase.from('aulas').insert(parsed.data).select('*').single()

    if (error) {
        return NextResponse.json({ error: 'Não foi possível criar a aula.' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
}
