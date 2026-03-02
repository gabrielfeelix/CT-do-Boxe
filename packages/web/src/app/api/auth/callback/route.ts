import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Rota chamada pelo redirect do link de convite do Supabase
// URL: /auth/callback?code=...&type=invite
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const type = searchParams.get('type')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Se for convite, redireciona para definir senha
            if (type === 'invite' || type === 'recovery') {
                return NextResponse.redirect(`${origin}/auth/definir-senha`)
            }
            // Login normal
            return NextResponse.redirect(`${origin}/dashboard`)
        }
    }

    // Falhou — volta pro login
    return NextResponse.redirect(`${origin}/login?error=link_invalido`)
}
