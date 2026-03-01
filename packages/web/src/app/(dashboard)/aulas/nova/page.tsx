'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { AulaForm } from '@/components/aulas/AulaForm'
import { useAulas } from '@/hooks/useAulas'
import type { AulaFormValues } from '@/lib/validations/aula'

export default function NovaAulaPage() {
    const router = useRouter()
    const { criarAula } = useAulas()
    const [saving, setSaving] = useState(false)

    async function handleSubmit(values: AulaFormValues) {
        setSaving(true)
        const { data, error } = await criarAula(values)
        setSaving(false)

        if (error) {
            toast.error(error)
            return
        }

        toast.success('Aula criada com sucesso.')
        if (data) {
            router.push(`/aulas/${data.id}`)
            return
        }

        router.push('/aulas')
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6 pb-8">
            <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900"
            >
                <span className="rounded-md border border-gray-200 bg-white p-1.5">
                    <ArrowLeft className="h-4 w-4" />
                </span>
                Voltar para aulas
            </button>

            <header className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Nova aula</h2>
                <p className="text-sm font-medium text-gray-500">
                    Cadastre o treino do dia para liberar a chamada de presenca.
                </p>
            </header>

            <AulaForm
                submitting={saving}
                submitLabel="Criar aula"
                onSubmit={handleSubmit}
                onCancel={() => router.push('/aulas')}
            />
        </div>
    )
}
