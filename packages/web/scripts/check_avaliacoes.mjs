
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function check() {
    const { data, error } = await supabase.from('avaliacoes').select('*').limit(1)
    if (error) {
        console.error('ERRO:', error.message)
    } else {
        const columns = data.length > 0 ? Object.keys(data[0]) : 'Tabela vazia ou sem colunas no select'
        console.log('--- Colunas da Tabela Avaliacoes ---')
        console.log(columns)
    }
}

check()
