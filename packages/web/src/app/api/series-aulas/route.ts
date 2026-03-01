import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { serieAulaSchema } from '@/lib/validations/serie-aula'

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const ativo = searchParams.get('ativo')
    const categoria = searchParams.get('categoria')
    const tipoAula = searchParams.get('tipo_aula')

    let query = supabase
        .from('series_aulas')
        .select(
            'id,titulo,dia_semana,hora_inicio,hora_fim,categoria,tipo_aula,professor,capacidade_maxima,ativo,data_inicio,data_fim,created_at,updated_at',
            { count: 'exact' }
        )
        .order('dia_semana', { ascending: true })
        .order('hora_inicio', { ascending: true })

    if (ativo === 'true') query = query.eq('ativo', true)
    if (ativo === 'false') query = query.eq('ativo', false)
    if (categoria && categoria !== 'todos') query = query.eq('categoria', categoria)
    if (tipoAula && tipoAula !== 'todos') query = query.eq('tipo_aula', tipoAula)

    const { data, error, count } = await query

    if (error) {
        return NextResponse.json({ error: 'Não foi possível carregar as séries de aulas.' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [], count: count ?? 0 }, { status: 200 })
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const body = await request.json()
    const parsed = serieAulaSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }, { status: 400 })
    }

    const payload = {
        ...parsed.data,
        data_fim: parsed.data.data_fim ?? null,
    }

    const { data, error } = await supabase.from('series_aulas').insert(payload).select('*').single()

    if (error) {
        return NextResponse.json({ error: 'Não foi possível criar a serie de aulas.' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
}
