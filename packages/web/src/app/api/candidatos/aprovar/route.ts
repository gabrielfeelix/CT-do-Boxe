import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
    try {
        // Verifica que o requisitante é um admin autenticado
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
        }

        const body = await req.json()
        const { candidato_id, senha_temporaria } = body

        if (!candidato_id || !senha_temporaria) {
            return NextResponse.json({ error: 'candidato_id e senha_temporaria são obrigatórios.' }, { status: 400 })
        }

        // Busca o candidato
        const { data: candidato, error: erroCandidato } = await supabaseAdmin
            .from('candidatos')
            .select('*')
            .eq('id', candidato_id)
            .single()

        if (erroCandidato || !candidato) {
            return NextResponse.json({ error: 'Candidato não encontrado.' }, { status: 404 })
        }

        if (candidato.status !== 'aguardando') {
            return NextResponse.json({ error: 'Candidato já foi processado.' }, { status: 400 })
        }

        // 1. Cria conta no Supabase Auth (requer service_role)
        const { data: novoUser, error: erroAuth } = await supabaseAdmin.auth.admin.createUser({
            email: candidato.email,
            password: senha_temporaria,
            email_confirm: true, // confirma o email automaticamente
            user_metadata: {
                nome: candidato.nome,
                role: 'aluno',
            },
        })

        if (erroAuth) {
            // Usuário pode já existir
            if (erroAuth.message?.includes('already been registered')) {
                return NextResponse.json({ error: 'Já existe uma conta com este e-mail.' }, { status: 409 })
            }
            throw erroAuth
        }

        // 2. Cria registro na tabela alunos
        const { data: novoAluno, error: erroAluno } = await supabaseAdmin
            .from('alunos')
            .insert({
                id: novoUser.user.id, // mesmo ID do Auth para facilitar joins
                nome: candidato.nome,
                email: candidato.email,
                telefone: candidato.telefone,
                data_nascimento: candidato.data_nascimento,
                status: 'inativo',
            })
            .select()
            .single()

        if (erroAluno) throw erroAluno

        // 3. Atualiza o candidato como aprovado
        const { error: erroUpdate } = await supabaseAdmin
            .from('candidatos')
            .update({
                status: 'aprovado',
                data_decisao: new Date().toISOString(),
                aluno_id: novoAluno.id,
            })
            .eq('id', candidato_id)

        if (erroUpdate) throw erroUpdate

        // 4. Cria avaliação física de entrada agendada para +3 dias
        const dataAvaliacao = new Date()
        dataAvaliacao.setDate(dataAvaliacao.getDate() + 3)
        const dataAvaliacaoISO = dataAvaliacao.toISOString().slice(0, 10)

        await supabaseAdmin.from('avaliacoes').insert({
            aluno_id: novoAluno.id,
            tipo: 'entrada',
            status: 'agendada',
            data_avaliacao: dataAvaliacaoISO,
            resultado: 'pendente',
        })

        return NextResponse.json({
            sucesso: true,
            aluno_id: novoAluno.id,
            data_avaliacao: dataAvaliacaoISO,
            mensagem: `Conta criada para ${candidato.nome}. Aluno inativo até avaliação física em ${dataAvaliacaoISO}.`,
        })
    } catch (err) {
        console.error('Erro ao aprovar candidato:', err)
        return NextResponse.json({ error: (err as Error).message || 'Erro interno.' }, { status: 500 })
    }
}
