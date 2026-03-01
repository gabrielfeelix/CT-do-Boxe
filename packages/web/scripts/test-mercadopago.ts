/**
 * Script de teste - Mercado Pago API
 *
 * Testa:
 * 1. Criar cobranca PIX
 * 2. Criar plano de assinatura
 * 3. Verificar configuracao
 *
 * Uso: npx tsx scripts/test-mercadopago.ts
 */

import { config } from 'dotenv'
import { MercadoPagoConfig, Payment, PreApprovalPlan } from 'mercadopago'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

const testAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''

if (!testAccessToken || testAccessToken === 'your-mercadopago-access-token') {
  console.error('Configure MERCADOPAGO_ACCESS_TOKEN no .env.local primeiro.')
  console.log('\nPassos:')
  console.log('1. Acesse: https://www.mercadopago.com.br/developers')
  console.log('2. Login -> Suas integracoes -> Credenciais de teste')
  console.log('3. Copie o TEST-ACCESS-TOKEN')
  console.log('4. Cole em .env.local -> MERCADOPAGO_ACCESS_TOKEN=TEST-...')
  console.log('5. Rode novamente: npx tsx scripts/test-mercadopago.ts\n')
  process.exit(1)
}

const client = new MercadoPagoConfig({
  accessToken: testAccessToken,
  options: {
    timeout: 5000,
  },
})

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

function getErrorCause(error: unknown): unknown {
  if (typeof error === 'object' && error !== null && 'cause' in error) {
    return (error as { cause?: unknown }).cause
  }
  return undefined
}

console.log('Iniciando testes do Mercado Pago...\n')

async function testarCobrancaPix() {
  console.log('TESTE 1: Criar cobranca PIX')
  console.log('-'.repeat(50))

  try {
    const payment = new Payment(client)

    const response = await payment.create({
      body: {
        transaction_amount: 100.5,
        description: 'Teste - Mensalidade CT Boxe',
        payment_method_id: 'pix',
        payer: {
          email: 'teste@exemplo.com',
          first_name: 'Joao',
          last_name: 'Silva',
          identification: {
            type: 'CPF',
            number: '12345678909',
          },
        },
      },
    })

    console.log('Cobranca PIX criada com sucesso.')
    console.log(`  ID: ${response.id}`)
    console.log(`  Status: ${response.status}`)
    console.log(`  Valor: R$ ${response.transaction_amount}`)

    if (response.point_of_interaction?.transaction_data) {
      const pixData = response.point_of_interaction.transaction_data
      console.log(`  QR Code: ${pixData.qr_code ? 'Gerado' : 'Nao disponivel'}`)
      console.log(`  Pix Copia e Cola: ${pixData.qr_code?.substring(0, 50)}...`)
    }

    return { success: true, data: response }
  } catch (error: unknown) {
    console.error('Erro ao criar cobranca PIX:')
    console.error(`  Mensagem: ${getErrorMessage(error)}`)
    const cause = getErrorCause(error)
    if (cause) {
      console.error(`  Detalhes: ${JSON.stringify(cause, null, 2)}`)
    }
    return { success: false, error }
  }
}

async function testarPlanoAssinatura() {
  console.log('\nTESTE 2: Criar plano de assinatura mensal')
  console.log('-'.repeat(50))

  try {
    const planClient = new PreApprovalPlan(client)

    const response = await planClient.create({
      body: {
        reason: 'Teste - Plano Mensal CT Boxe',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 195.9,
          currency_id: 'BRL',
        },
        back_url: 'https://www.mercadopago.com.br',
      },
    })

    console.log('Plano de assinatura criado com sucesso.')
    console.log(`  ID: ${response.id}`)
    console.log(`  Status: ${response.status}`)
    console.log(`  Valor mensal: R$ ${response.auto_recurring?.transaction_amount}`)
    console.log(
      `  Frequencia: ${response.auto_recurring?.frequency} ${response.auto_recurring?.frequency_type}`
    )

    return { success: true, data: response }
  } catch (error: unknown) {
    console.error('Erro ao criar plano de assinatura:')
    console.error(`  Mensagem: ${getErrorMessage(error)}`)
    const cause = getErrorCause(error)
    if (cause) {
      console.error(`  Detalhes: ${JSON.stringify(cause, null, 2)}`)
    }
    return { success: false, error }
  }
}

async function verificarConfiguracao() {
  console.log('\nTESTE 3: Verificar configuracao')
  console.log('-'.repeat(50))

  console.log(`Access Token configurado: ${testAccessToken.substring(0, 20)}...`)
  console.log(`Ambiente: ${testAccessToken.startsWith('TEST-') ? 'TESTE (Sandbox)' : 'PRODUCAO'}`)
  console.log('SDK Mercado Pago: Instalado')

  return { success: true }
}

async function runAllTests() {
  console.log('='.repeat(50))
  console.log('TESTES DO MERCADO PAGO - CT BOXE')
  console.log('='.repeat(50) + '\n')

  const results = {
    configuracao: await verificarConfiguracao(),
    pix: await testarCobrancaPix(),
    assinatura: await testarPlanoAssinatura(),
  }

  console.log('\n' + '='.repeat(50))
  console.log('RESUMO DOS TESTES')
  console.log('='.repeat(50))
  console.log(`Configuracao: ${results.configuracao.success ? 'OK' : 'FALHOU'}`)
  console.log(`Cobranca PIX: ${results.pix.success ? 'OK' : 'FALHOU'}`)
  console.log(`Plano Assinatura: ${results.assinatura.success ? 'OK' : 'FALHOU'}`)
  console.log('='.repeat(50) + '\n')

  const allPassed = results.configuracao.success && results.pix.success && results.assinatura.success

  if (allPassed) {
    console.log('Todos os testes passaram.')
    console.log('Voce esta pronto para integrar o Mercado Pago no sistema.\n')
  } else {
    console.log('Alguns testes falharam.')
    console.log('Verifique os erros acima antes de continuar.\n')
  }

  process.exit(allPassed ? 0 : 1)
}

runAllTests().catch((error) => {
  console.error('\nErro fatal:', error)
  process.exit(1)
})
