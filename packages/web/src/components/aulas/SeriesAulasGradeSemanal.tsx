'use client'

import { Clock3, User } from 'lucide-react'
import type { SerieAulaResumo } from '@/hooks/useSeriesAulas'

interface SeriesAulasGradeSemanalProps {
    series: SerieAulaResumo[]
}

const diasSemana = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sab' },
]

function badgeCategoria(categoria: SerieAulaResumo['categoria']) {
    if (categoria === 'infantil') return 'bg-sky-50 text-sky-700 ring-sky-200'
    if (categoria === 'adulto') return 'bg-gray-100 text-gray-700 ring-gray-200'
    return 'bg-amber-50 text-amber-700 ring-amber-200'
}

function badgeTipo(tipo: SerieAulaResumo['tipo_aula']) {
    return tipo === 'individual' ? 'bg-indigo-50 text-indigo-700 ring-indigo-200' : 'bg-teal-50 text-teal-700 ring-teal-200'
}

export function SeriesAulasGradeSemanal({ series }: SeriesAulasGradeSemanalProps) {
    const seriesAtivas = series.filter((serie) => serie.ativo)
    const agrupado = diasSemana.map((dia) => ({
        ...dia,
        itens: seriesAtivas
            .filter((serie) => serie.dia_semana === dia.value)
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)),
    }))

    return (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Grade semanal de series ativas</h3>
                <p className="mt-1 text-sm font-medium text-gray-500">
                    Visualizacao fixa por dia da semana para acompanhar os horarios recorrentes.
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                {agrupado.map((dia) => (
                    <div key={dia.value} className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{dia.label}</p>
                        {dia.itens.length === 0 ? (
                            <p className="text-xs font-medium text-gray-400">Sem serie ativa</p>
                        ) : (
                            <div className="space-y-2">
                                {dia.itens.map((serie) => (
                                    <article key={serie.id} className="rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
                                        <p className="text-xs font-semibold text-gray-900">{serie.titulo}</p>
                                        <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-gray-600">
                                            <Clock3 className="h-3.5 w-3.5 text-gray-400" />
                                            {serie.hora_inicio.slice(0, 5)} - {serie.hora_fim.slice(0, 5)}
                                        </p>
                                        <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-gray-500">
                                            <User className="h-3.5 w-3.5 text-gray-400" />
                                            {serie.professor}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${badgeCategoria(serie.categoria)}`}
                                            >
                                                {serie.categoria}
                                            </span>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${badgeTipo(serie.tipo_aula)}`}
                                            >
                                                {serie.tipo_aula}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}
