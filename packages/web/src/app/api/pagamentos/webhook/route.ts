import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'

const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Mercado Pago envia notificações de tipo "payment"
        if (body.type !== 'payment') {
            return NextResponse.json({ received: true })
        }

        const paymentId = body.data?.id
        if (!paymentId) return NextResponse.json({ received: true })

        // Busca os dados reais do pagamento no MP
        const payment = new Payment(mpClient)
        const mpPayment = await payment.get({ id: paymentId })

        if (mpPayment.status !== 'approved') {
            return NextResponse.json({ received: true })
        }

        const supabase = await createClient()

        // Atualiza pagamento no Supabase
        const { data: pagamento } = await supabase
            .from('pagamentos')
            .update({
                status: 'pago',
                mercadopago_status: 'approved',
                data_pagamento: new Date().toISOString(),
            })
            .eq('mercadopago_id', paymentId.toString())
            .select('aluno_id, contrato_id')
            .single()

        // Se pagamento aprovado, garante que aluno está ativo
        if (pagamento?.aluno_id) {
            await supabase
                .from('alunos')
                .update({ status: 'ativo' })
                .eq('id', pagamento.aluno_id)
                .eq('status', 'bloqueado') // só desbloqueia se estava bloqueado por inadimplência
        }

        return NextResponse.json({ received: true })
    } catch (err) {
        console.error('Webhook MP erro:', err)
        return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
    }
}

// MP também envia GET para verificar disponibilidade
export async function GET() {
    return NextResponse.json({ status: 'webhook ativo' })
}
