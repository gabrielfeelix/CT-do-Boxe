import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
    try {
        const { professorId, email, nome } = await request.json()

        if (!email || !professorId) {
            return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

        // 1. Criar/convidar o usuário no Supabase Auth
        const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            email,
            {
                redirectTo: `${appUrl}/auth/definir-senha`,
                data: {
                    nome_completo: nome,
                    role: 'professor',
                },
            }
        )

        if (inviteError) {
            // Usuário já existe no auth — tenta resend
            if (inviteError.message?.includes('already registered')) {
                return NextResponse.json(
                    { error: 'Este e-mail já possui acesso. Peça para redefinir a senha pela tela de login.' },
                    { status: 409 }
                )
            }
            console.error('[convidar-professor]', inviteError)
            return NextResponse.json({ error: 'Não foi possível enviar o convite.' }, { status: 500 })
        }

        // 2. Vincular o auth_user_id na tabela professores
        if (data.user?.id) {
            await supabaseAdmin
                .from('professores')
                .update({ auth_user_id: data.user.id })
                .eq('id', professorId)
        }

        return NextResponse.json({ ok: true, message: `Convite enviado para ${email}` })
    } catch (err) {
        console.error('[convidar-professor]', err)
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
    }
}
