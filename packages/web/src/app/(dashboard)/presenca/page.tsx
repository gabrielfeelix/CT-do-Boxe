'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { CalendarCheck2, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatters'
import { useAulas } from '@/hooks/useAulas'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'

export default function PresencaPage() {
    const hoje = new Date().toISOString().slice(0, 10)
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() + 7)

    const { aulas, loading, error } = useAulas({
        status: 'agendada',
        dataInicio: hoje,
        dataFim: dataLimite.toISOString().slice(0, 10),
        limit: 50,
    })

    const proximasAulas = useMemo(
        () =>
            aulas.sort((a, b) => {
                const first = new Date(`${a.data}T${a.hora_inicio}`).getTime()
                const second = new Date(`${b.data}T${b.hora_inicio}`).getTime()
                return first - second
            }),
        [aulas]
    )

    return (
        <div className="mx-auto max-w-[1440px] space-y-6 pb-8">
            <header className="border-b border-gray-100 pb-5">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Presenca</h2>
                <p className="mt-1 text-sm font-medium text-gray-500">
                    Abra uma aula para registrar chamada e realizar check-ins manuais.
                </p>
            </header>

            {loading ? (
                <LoadingSpinner label="Carregando aulas para chamada..." />
            ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
            ) : proximasAulas.length === 0 ? (
                <EmptyState
                    icon={CalendarCheck2}
                    title="Nenhuma aula agendada para os proximos dias"
                    description="Cadastre uma aula para iniciar a chamada de presenca."
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {proximasAulas.map((aula) => (
                        <article
                            key={aula.id}
                            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{formatDate(aula.data)}</p>
                                <h3 className="mt-1 text-lg font-bold text-gray-900">{aula.titulo}</h3>
                            </div>

                            <div className="space-y-1 text-sm font-medium text-gray-600">
                                <p>
                                    Horario: {aula.hora_inicio.slice(0, 5)} - {aula.hora_fim.slice(0, 5)}
                                </p>
                                <p>Professor: {aula.professor}</p>
                                <p>
                                    Confirmacoes: {aula.total_agendados}/{aula.capacidade_maxima}
                                </p>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <Link
                                    href={`/presenca/${aula.id}`}
                                    className="inline-flex h-9 items-center rounded-lg bg-[#CC0000] px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#AA0000]"
                                >
                                    Abrir chamada
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}
