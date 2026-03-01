'use client'

import { CalendarDays, Clock3 } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatters'
import type { AulaResumo } from '@/hooks/useAulas'

interface AulaCalendarioProps {
    aulas: AulaResumo[]
}

export function AulaCalendario({ aulas }: AulaCalendarioProps) {
    if (aulas.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Agenda da semana</h3>
                <p className="mt-3 text-sm font-medium text-gray-500">Nenhuma aula programada para este periodo.</p>
            </div>
        )
    }

    const agrupado = aulas.reduce<Record<string, AulaResumo[]>>((acc, aula) => {
        if (!acc[aula.data]) acc[aula.data] = []
        acc[aula.data].push(aula)
        return acc
    }, {})

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#CC0000]" />
                <h3 className="text-sm font-semibold text-gray-900">Agenda da semana</h3>
            </div>

            <div className="space-y-4">
                {Object.entries(agrupado).map(([data, itens]) => (
                    <div key={data}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            {formatDate(data)}
                        </p>
                        <div className="space-y-2">
                            {itens.map((aula) => (
                                <div
                                    key={aula.id}
                                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{aula.titulo}</p>
                                        <p className="text-xs font-medium text-gray-500">{aula.professor}</p>
                                    </div>
                                    <p className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                                        <Clock3 className="h-3.5 w-3.5 text-gray-400" />
                                        {aula.hora_inicio.slice(0, 5)} - {aula.hora_fim.slice(0, 5)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
