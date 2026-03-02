
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
    const { data, error } = await supabase.from('professores').select('email, role, auth_user_id')
    if (error) {
        console.error('ERRO:', error.message)
    } else {
        console.log('--- Listagem de Professores ---')
        data.forEach(p => console.log(`Email: ${p.email} | Role: ${p.role} | Linked: ${p.auth_user_id ? 'Yes' : 'No'}`))
    }
}

check()
