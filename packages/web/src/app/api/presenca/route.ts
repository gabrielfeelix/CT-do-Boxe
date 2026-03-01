import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const presencaSchema = z.object({
    aula_id: z.string().uuid('Aula invalida.'),
    aluno_id: z.string().uuid('Aluno invalido.'),
    status: z.enum(['agendado', 'presente', 'falta', 'cancelada']),
})

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const aulaId = searchParams.get('aula_id')

    if (!aulaId) {
        return NextResponse.json({ error: 'Informe o parametro aula_id.' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('presencas')
        .select('id,aula_id,aluno_id,status,data_checkin,created_at,updated_at,aluno:alunos(id,nome,email)')
        .eq('aula_id', aulaId)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: 'Não foi possível carregar a lista de presenca.' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [] }, { status: 200 })
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const body = await request.json()
    const parsed = presencaSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }, { status: 400 })
    }

    const { aula_id, aluno_id, status } = parsed.data

    const { data: existente, error: fetchError } = await supabase
        .from('presencas')
        .select('id')
        .eq('aula_id', aula_id)
        .eq('aluno_id', aluno_id)
        .maybeSingle()

    if (fetchError) {
        return NextResponse.json({ error: 'Não foi possível atualizar a presenca.' }, { status: 500 })
    }

    const payload = {
        aula_id,
        aluno_id,
        status,
        data_checkin: status === 'presente' ? new Date().toISOString() : null,
    }

    const result = existente
        ? await supabase.from('presencas').update(payload).eq('id', existente.id).select('*').single()
        : await supabase.from('presencas').insert(payload).select('*').single()

    if (result.error) {
        return NextResponse.json({ error: 'Não foi possível salvar a presenca.' }, { status: 500 })
    }

    return NextResponse.json({ data: result.data }, { status: 200 })
}
