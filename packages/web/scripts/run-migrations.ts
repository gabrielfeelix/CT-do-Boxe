/**
 * Script para executar migrations no Supabase
 * Uso: npx tsx scripts/run-migrations.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseKey || supabaseKey === 'your-supabase-service-role-key') {
  console.error('Configure SUPABASE_SERVICE_ROLE_KEY no .env.local.')
  console.log('\nPassos:')
  console.log('1. Acesse: https://supabase.com/dashboard/project/reqhddvgquiomxvqvcdn/settings/api')
  console.log('2. Copie a service_role key (secret).')
  console.log('3. Cole em .env.local -> SUPABASE_SERVICE_ROLE_KEY=...')
  console.log('4. Rode novamente: npx tsx scripts/run-migrations.ts\n')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

async function runMigration(filename: string, description: string) {
  console.log(`\n${description}`)
  console.log('-'.repeat(50))

  try {
    const sqlPath = resolve(__dirname, '../migrations', filename)
    const sql = readFileSync(sqlPath, 'utf-8')

    const { error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      console.log('exec_sql nao disponivel. Execute manualmente no Supabase SQL Editor.')
      console.log(`Arquivo: migrations/${filename}`)
      return { success: false, manual: true as const }
    }

    console.log('Migration aplicada com sucesso.')
    return { success: true as const }
  } catch (error: unknown) {
    console.error('Erro ao executar migration:')
    console.error(`  ${getErrorMessage(error)}`)
    return { success: false as const, error }
  }
}

async function main() {
  console.log('='.repeat(50))
  console.log('EXECUTANDO MIGRATIONS - CT BOXE')
  console.log('='.repeat(50))

  const migrations = [
    { file: '001_add_categoria_aulas.sql', desc: 'Adicionar categorizacao as aulas' },
    { file: '002_add_recorrencia_planos.sql', desc: 'Adicionar renovacao automatica aos planos' },
    { file: '003_create_series_aulas.sql', desc: 'Criar tabela series_aulas' },
    { file: '004_insert_planos_iniciais.sql', desc: 'Inserir planos iniciais de recorrencia' },
    { file: '005_add_aluno_treino_stats.sql', desc: 'Adicionar colunas de historico de treino em alunos' },
    { file: '006_insert_planos_base.sql', desc: 'Remover planos mensal/trimestral/semestral/anual' },
  ]

  let allSuccess = true
  let needsManual = false

  for (const migration of migrations) {
    const result = await runMigration(migration.file, migration.desc)
    if (!result.success) allSuccess = false
    if ('manual' in result && result.manual) needsManual = true
  }

  console.log('\n' + '='.repeat(50))
  console.log('RESUMO')
  console.log('='.repeat(50))

  if (needsManual) {
    console.log('Acao manual necessaria.')
    console.log('\nExecute as migrations manualmente:')
    console.log('1. Acesse: https://supabase.com/dashboard/project/reqhddvgquiomxvqvcdn/editor')
    console.log('2. Va em SQL Editor -> New query.')
    console.log('3. Cole e execute cada migration em migrations/ na ordem.')
    console.log('\nArquivos:')
    migrations.forEach((migration) => console.log(`  - migrations/${migration.file}`))
  } else if (allSuccess) {
    console.log('Todas as migrations executadas com sucesso.')
  } else {
    console.log('Algumas migrations falharam.')
    console.log('Verifique os erros acima.')
  }

  console.log('='.repeat(50) + '\n')
  process.exit(allSuccess && !needsManual ? 0 : 1)
}

main().catch((error) => {
  console.error('\nErro fatal:', error)
  process.exit(1)
})
