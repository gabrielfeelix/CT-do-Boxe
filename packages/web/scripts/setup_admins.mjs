
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Configuração do Supabase ausente (.env.local)')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const ADMINS = [
    { email: 'gab.feelix@gmail.com', password: 'Ctdoboxe123', nome: 'Gabriel Felix' },
    { email: 'admin@ctdoboxe.com.br', password: 'Ctdoboxe123', nome: 'Admin Master CT' }
]

async function setup() {
    console.log('--- Iniciando Setup de Administradores ---')

    for (const admin of ADMINS) {
        console.log(`\nProcessando: ${admin.email}...`)

        // 1. Verificar se usuário já existe no Auth
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) {
            console.error('Erro ao listar usuários:', listError.message)
            continue
        }

        let user = users.find(u => u.email === admin.email)

        if (!user) {
            console.log('Usuário não encontrado no auth. Criando...')
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: admin.email,
                password: admin.password,
                email_confirm: true,
                user_metadata: { nome_completo: admin.nome, role: 'super_admin' }
            })

            if (createError) {
                console.error(`Erro ao criar ${admin.email}:`, createError.message)
                continue
            }
            user = newUser.user
            console.log('✅ Usuário auth criado.')
        } else {
            console.log('Usuário auth já existe. Garantindo senha e metadados...')
            const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
                password: admin.password,
                user_metadata: { nome_completo: admin.nome, role: 'super_admin' }
            })
            if (updateError) console.error('Erro ao atualizar senha/meta:', updateError.message)
            else console.log('✅ Auth atualizado.')
        }

        // 2. Garantir entrada na tabela professores
        const { data: prof, error: fetchProfError } = await supabase
            .from('professores')
            .select('id')
            .eq('email', admin.email)
            .maybeSingle()

        if (fetchProfError) {
            console.error('Erro ao buscar na tabela professores:', fetchProfError.message)
            continue
        }

        if (!prof) {
            console.log('Professor não existe na tabela. Inserindo...')
            const { error: insertError } = await supabase
                .from('professores')
                .insert({
                    nome: admin.nome,
                    email: admin.email,
                    auth_user_id: user.id,
                    role: 'super_admin',
                    especialidade: 'Administrador Master',
                    ativo: true
                })
            if (insertError) console.error('Erro ao inserir professor:', insertError.message)
            else console.log('✅ Entrada inserida na tabela professores.')
        } else {
            console.log('Professor já existe na tabela. Sincronizando auth_user_id e role...')
            const { error: updateProfError } = await supabase
                .from('professores')
                .update({
                    auth_user_id: user.id,
                    role: 'super_admin',
                    ativo: true
                })
                .eq('email', admin.email)
            if (updateProfError) console.error('Erro ao atualizar professor:', updateProfError.message)
            else console.log('✅ Sincronização concluída.')
        }
    }

    console.log('\n--- Setup concluído ---')
}

setup()
