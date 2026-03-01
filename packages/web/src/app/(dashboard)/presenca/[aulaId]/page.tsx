'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock3, User } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils/formatters'
import { useAula } from '@/hooks/useAulas'
import { usePresencaAula, type PresencaStatus } from '@/hooks/usePresenca'
import { PresencaStats } from '@/components/presenca/PresencaStats'
import { ListaPresenca } from '@/components/presenca/ListaPresenca'
import { CheckinManual } from '@/components/presenca/CheckinManual'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function PresencaAulaPage() {
    const router = useRouter()
    const params = useParams<{ aulaId: string }>()
    const aulaId = params.aulaId

    const { aula, loading: loadingAula, error: errorAula } = useAula(aulaId)
    const { registros, resumo, loading, error, marcarPresenca, checkinManual } = usePresencaAula(aulaId)
    const [saving, setSaving] = useState(false)

    async function handleMarcar(alunoId: string, status: PresencaStatus) {
        setSaving(true)
        const resultado = await marcarPresenca(alunoId, status)
        setSaving(false)

        if (!resultado.ok) {
            toast.error(resultado.error ?? 'Não foi possível atualizar a presenca.')
            return
        }

        toast.success('Presenca atualizada.')
    }

    async function handleCheckin(alunoId: string) {
        setSaving(true)
        const resultado = await checkinManual(alunoId)
        setSaving(false)

        if (!resultado.ok) {
            toast.error(resultado.error ?? 'Não foi possível registrar o check-in.')
            return
        }

        toast.success('Check-in manual registrado.')
    }

    if (loadingAula) {
        return <LoadingSpinner label="Carregando aula..." />
    }

    if (errorAula || !aula) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {errorAula ?? 'Aula nao encontrada.'}
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-[1440px] space-y-6 pb-8">
            <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900"
            >
                <span className="rounded-md border border-gray-200 bg-white p-1.5">
                    <ArrowLeft className="h-4 w-4" />
                </span>
                Voltar
            </button>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{aula.titulo}</h2>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm font-medium text-gray-600">
                            <p className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {formatDate(aula.data)}
                            </p>
                            <p className="flex items-center gap-1.5">
                                <Clock3 className="h-4 w-4 text-gray-400" />
                                {aula.hora_inicio.slice(0, 5)} - {aula.hora_fim.slice(0, 5)}
                            </p>
                            <p className="flex items-center gap-1.5">
                                <User className="h-4 w-4 text-gray-400" />
                                {aula.professor}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/aulas/${aula.id}`}
                        className="inline-flex h-10 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                        Ver detalhes da aula
                    </Link>
                </div>
            </section>

            <PresencaStats resumo={resumo} />

            {loading ? (
                <LoadingSpinner label="Carregando chamada..." />
            ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
            ) : (
                <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
                    <ListaPresenca registros={registros} loading={saving} onMarcar={handleMarcar} />
                    <CheckinManual registros={registros} loading={saving} onCheckin={handleCheckin} />
                </div>
            )}
        </div>
    )
}
