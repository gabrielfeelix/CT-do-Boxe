import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

        const { candidato_id, motivo } = await req.json()
        if (!candidato_id) return NextResponse.json({ error: 'candidato_id obrigatório.' }, { status: 400 })

        const { error } = await supabaseAdmin
            .from('candidatos')
            .update({
                status: 'reprovado',
                motivo_reprovacao: motivo || null,
                data_decisao: new Date().toISOString(),
            })
            .eq('id', candidato_id)
            .eq('status', 'aguardando') // só reprova quem ainda está aguardando

        if (error) throw error

        return NextResponse.json({ sucesso: true })
    } catch (err) {
        console.error('Erro ao reprovar candidato:', err)
        return NextResponse.json({ error: (err as Error).message || 'Erro interno.' }, { status: 500 })
    }
}
