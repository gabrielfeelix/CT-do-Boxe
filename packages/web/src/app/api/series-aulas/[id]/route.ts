import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { atualizarSerieAulaSchema } from '@/lib/validations/serie-aula'

interface RouteContext {
    params: Promise<{ id: string }>
}

export async function GET(_: NextRequest, context: RouteContext) {
    const { id } = await context.params
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('series_aulas')
        .select(
            'id,titulo,dia_semana,hora_inicio,hora_fim,categoria,tipo_aula,professor,capacidade_maxima,ativo,data_inicio,data_fim,created_at,updated_at'
        )
        .eq('id', id)
        .single()

    if (error) {
        return NextResponse.json({ error: 'Serie de aula nao encontrada.' }, { status: 404 })
    }

    return NextResponse.json({ data }, { status: 200 })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    const { id } = await context.params
    const supabase = await createClient()
    const body = await request.json()
    const parsed = atualizarSerieAulaSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }, { status: 400 })
    }

    const payload: Record<string, unknown> = { ...parsed.data }
    if (Object.prototype.hasOwnProperty.call(parsed.data, 'data_fim')) {
        payload.data_fim = parsed.data.data_fim ?? null
    }

    const { data, error } = await supabase.from('series_aulas').update(payload).eq('id', id).select('*').single()

    if (error) {
        return NextResponse.json({ error: 'Não foi possível atualizar a serie de aulas.' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const { id } = await context.params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const cancelarFuturas = searchParams.get('cancelar_futuras') === 'true'
    const hoje = new Date().toISOString().slice(0, 10)

    const { error: disableError } = await supabase
        .from('series_aulas')
        .update({ ativo: false, data_fim: hoje })
        .eq('id', id)

    if (disableError) {
        return NextResponse.json({ error: 'Não foi possível desativar a série.' }, { status: 500 })
    }

    if (cancelarFuturas) {
        const { error: aulasError } = await supabase
            .from('aulas')
            .update({ status: 'cancelada' })
            .eq('serie_id', id)
            .gte('data', hoje)

        if (aulasError) {
            return NextResponse.json(
                { error: 'A serie foi desativada, mas nao foi possivel cancelar as aulas futuras.' },
                { status: 500 }
            )
        }
    }

    return NextResponse.json({ ok: true }, { status: 200 })
}
