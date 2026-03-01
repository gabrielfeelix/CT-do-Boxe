import { CheckCircle2, UserMinus, UsersRound, CalendarCheck2 } from 'lucide-react'
import type { PresencaResumo } from '@/hooks/usePresenca'

interface PresencaStatsProps {
    resumo: PresencaResumo
}

export function PresencaStats({ resumo }: PresencaStatsProps) {
    const cards = [
        {
            label: 'Total de alunos',
            value: resumo.total,
            icon: UsersRound,
            className: 'bg-blue-50 text-blue-700 border-blue-100',
        },
        {
            label: 'Presentes',
            value: resumo.presentes,
            icon: CheckCircle2,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        },
        {
            label: 'Faltas',
            value: resumo.faltas,
            icon: UserMinus,
            className: 'bg-red-50 text-red-700 border-red-100',
        },
        {
            label: 'Taxa de presenca',
            value: `${resumo.taxa_presenca}%`,
            icon: CalendarCheck2,
            className: 'bg-amber-50 text-amber-700 border-amber-100',
        },
    ]

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon
                return (
                    <article
                        key={card.label}
                        className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{card.label}</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
                            </div>
                            <div className={`rounded-lg border p-2.5 ${card.className}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                        </div>
                    </article>
                )
            })}
        </div>
    )
}
