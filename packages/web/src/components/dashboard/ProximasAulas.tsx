import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils/formatters'

interface AulaRow {
    id: string
    titulo: string
    data: string
    hora_inicio: string
    capacidade_maxima: number
    presencas?: Array<{ status: string }> | null
}

async function getProximasAulas() {
    const supabase = await createClient()
    const hoje = new Date().toISOString().slice(0, 10)

    const { data, error } = await supabase
        .from('aulas')
        .select('id,titulo,data,hora_inicio,capacidade_maxima,presencas(status)')
        .eq('status', 'agendada')
        .gte('data', hoje)
        .order('data', { ascending: true })
        .order('hora_inicio', { ascending: true })
        .limit(5)

    if (error) {
        console.error(error)
        return []
    }

    return (data as AulaRow[]) ?? []
}

export async function ProximasAulas() {
    const aulas = await getProximasAulas()

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="border-l-3 border-[#CC0000] pl-2 text-sm font-semibold text-gray-900">Proximas aulas</h3>
                <Link
                    href="/aulas"
                    className="group flex items-center text-xs font-semibold text-gray-500 transition-colors hover:text-[#CC0000]"
                >
                    Ver todas
                    <ChevronRight className="ml-0.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>

            {aulas.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-sm font-medium text-gray-500">
                    Nenhuma aula agendada.
                </p>
            ) : (
                <div className="space-y-1">
                    {aulas.map((aula) => {
                        const agendados = (aula.presencas ?? []).filter(
                            (item) => item.status === 'agendado' || item.status === 'presente'
                        ).length
                        const lotada = agendados >= aula.capacidade_maxima
                        return (
                            <Link
                                key={aula.id}
                                href={`/presenca/${aula.id}`}
                                className="flex items-center justify-between rounded-lg border border-transparent p-3 transition-colors hover:border-gray-100 hover:bg-gray-50"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{aula.titulo}</p>
                                    <p className="mt-0.5 text-xs font-medium text-gray-500">
                                        {formatDate(aula.data)} - {aula.hora_inicio.slice(0, 5)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 shadow-sm">
                                        {agendados}/{aula.capacidade_maxima}
                                    </p>
                                    <span
                                        className={`mt-1 inline-flex rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                            lotada ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                        }`}
                                    >
                                        {lotada ? 'Lotada' : 'Disponivel'}
                                    </span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
