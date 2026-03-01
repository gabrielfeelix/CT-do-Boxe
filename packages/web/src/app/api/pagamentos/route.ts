import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
})

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const body = await req.json()
        const { aluno_id, contrato_id, valor, descricao, email_pagador, nome_pagador, cpf_pagador } = body

        if (!aluno_id || !valor || !email_pagador) {
            return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
        }

        const payment = new Payment(mpClient)

        // Cria cobrança PIX no Mercado Pago
        const mpResponse = await payment.create({
            body: {
                transaction_amount: parseFloat(valor),
                description: descricao || 'Mensalidade CT Boxe',
                payment_method_id: 'pix',
                payer: {
                    email: email_pagador,
                    first_name: nome_pagador?.split(' ')[0] || '',
                    last_name: nome_pagador?.split(' ').slice(1).join(' ') || '',
                    identification: cpf_pagador ? { type: 'CPF', number: cpf_pagador.replace(/\D/g, '') } : undefined,
                },
                notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pagamentos/webhook`,
            },
        })

        const pixData = mpResponse.point_of_interaction?.transaction_data

        // Salva pagamento no Supabase
        const dataVencimento = new Date()
        dataVencimento.setDate(dataVencimento.getDate() + 3) // vence em 3 dias

        const { data: pagamento, error } = await supabase
            .from('pagamentos')
            .insert({
                aluno_id,
                contrato_id: contrato_id || null,
                valor: parseFloat(valor),
                status: 'pendente',
                metodo: 'pix',
                data_vencimento: dataVencimento.toISOString().split('T')[0],
                mercadopago_id: mpResponse.id?.toString(),
                mercadopago_status: mpResponse.status,
                qr_code: pixData?.qr_code_base64 || null,
                pix_copia_cola: pixData?.qr_code || null,
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({
            pagamento_id: pagamento.id,
            qr_code_base64: pixData?.qr_code_base64,
            pix_copia_cola: pixData?.qr_code,
            mercadopago_id: mpResponse.id,
            status: mpResponse.status,
        })
    } catch (err) {
        console.error('Erro ao gerar cobrança MP:', err)
        return NextResponse.json({ error: 'Erro ao gerar cobrança.' }, { status: 500 })
    }
}
