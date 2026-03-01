import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { atualizarAulaSchema } from '@/lib/validations/aula'
import { parseDateOnly, subtrairUmDia } from '@/lib/aulas/recorrencia'

interface RouteContext {
    params: Promise<{ id: string }>
}

export async function GET(_: NextRequest, context: RouteContext) {
    const { id } = await context.params
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('aulas')
        .select(
            'id,titulo,data,hora_inicio,hora_fim,professor,capacidade_maxima,status,categoria,tipo_aula,serie_id,created_at,updated_at,presencas(id,aluno_id,status,data_checkin,aluno:alunos(id,nome,email))'
        )
        .eq('id', id)
        .single()

    if (error) {
        return NextResponse.json({ error: 'Aula nao encontrada.' }, { status: 404 })
    }

    return NextResponse.json({ data }, { status: 200 })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    const { id } = await context.params
    const supabase = await createClient()
    const body = await request.json()
    const parsed = atualizarAulaSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }, { status: 400 })
    }

    const { data, error } = await supabase.from('aulas').update(parsed.data).eq('id', id).select('*').single()

    if (error) {
        return NextResponse.json({ error: 'Não foi possível atualizar a aula.' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const { id } = await context.params
    const supabase = await createClient()
    let scope: 'single' | 'future' = 'single'

    try {
        const body = await request.json()
        if (body?.scope === 'future') {
            scope = 'future'
        }
    } catch {
        scope = 'single'
    }

    const { data: aula, error: aulaError } = await supabase
        .from('aulas')
        .select('id,data,serie_id')
        .eq('id', id)
        .single()

    if (aulaError || !aula) {
        return NextResponse.json({ error: 'Aula nao encontrada.' }, { status: 404 })
    }

    if (scope === 'future' && aula.serie_id) {
        const { error: updateAulasError } = await supabase
            .from('aulas')
            .update({ status: 'cancelada' })
            .eq('serie_id', aula.serie_id)
            .gte('data', aula.data)

        if (updateAulasError) {
            return NextResponse.json({ error: 'Não foi possível cancelar as aulas futuras.' }, { status: 500 })
        }

        const { data: serie } = await supabase
            .from('series_aulas')
            .select('id,data_inicio,data_fim,ativo')
            .eq('id', aula.serie_id)
            .single()

        if (serie) {
            const dataAnterior = subtrairUmDia(aula.data)
            const dataInicioSerie = parseDateOnly(serie.data_inicio)
            const dataAnteriorDate = dataAnterior ? parseDateOnly(dataAnterior) : null
            const desativarSerie =
                !dataAnteriorDate ||
                !dataInicioSerie ||
                dataAnteriorDate.getTime() < dataInicioSerie.getTime()

            const payload = desativarSerie
                ? { ativo: false, data_fim: dataAnterior ?? aula.data }
                : { data_fim: dataAnterior }

            await supabase.from('series_aulas').update(payload).eq('id', serie.id)
        }

        return NextResponse.json({ ok: true, scope: 'future' }, { status: 200 })
    }

    const { error } = await supabase.from('aulas').update({ status: 'cancelada' }).eq('id', id)

    if (error) {
        return NextResponse.json({ error: 'Não foi possível cancelar a aula.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, scope: 'single' }, { status: 200 })
}
