'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck2 } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDate } from '@/lib/utils/formatters'

interface HistoricoFrequenciaProps {
    alunoId: string
}

interface PresencaHistorico {
    id: string
    status: 'agendado' | 'presente' | 'falta' | 'cancelada'
    data_checkin: string | null
    created_at: string
    aula: {
        id: string
        titulo: string
        data: string
        hora_inicio: string
    } | null
}

interface PresencaHistoricoRaw {
    id: string
    status: 'agendado' | 'presente' | 'falta' | 'cancelada'
    data_checkin: string | null
    created_at: string
    aula:
        | {
              id: string
              titulo: string
              data: string
              hora_inicio: string
          }
        | Array<{
        id: string
        titulo: string
        data: string
        hora_inicio: string
    }> | null
}

function sameDay(date: Date, target: Date) {
    return (
        date.getFullYear() === target.getFullYear() &&
        date.getMonth() === target.getMonth() &&
        date.getDate() === target.getDate()
    )
}

function pickAula(
    aula: PresencaHistoricoRaw['aula']
):
    | {
          id: string
          titulo: string
          data: string
          hora_inicio: string
      }
    | null {
    if (!aula) return null
    return Array.isArray(aula) ? aula[0] ?? null : aula
}

export function HistoricoFrequencia({ alunoId }: HistoricoFrequenciaProps) {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [historico, setHistorico] = useState<PresencaHistorico[]>([])
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

    useEffect(() => {
        async function fetchHistorico() {
            setLoading(true)
            const { data, error } = await supabase
                .from('presencas')
                .select('id,status,data_checkin,created_at,aula:aulas(id,titulo,data,hora_inicio)')
                .eq('aluno_id', alunoId)
                .in('status', ['presente', 'falta', 'agendado'])
                .order('created_at', { ascending: false })

            if (error) {
                console.error(error)
                setHistorico([])
                setLoading(false)
                return
            }

            const normalizado = ((data as unknown as PresencaHistoricoRaw[]) ?? []).map((item) => ({
                ...item,
                aula: pickAula(item.aula),
            })) as PresencaHistorico[]

            setHistorico(normalizado)
            setLoading(false)
        }

        fetchHistorico()
    }, [supabase, alunoId])

    const datasPresentes = useMemo(
        () =>
            historico
                .filter((item) => item.status === 'presente' && item.aula?.data)
                .map((item) => new Date(`${item.aula?.data}T00:00:00`)),
        [historico]
    )

    const datasFalta = useMemo(
        () =>
            historico
                .filter((item) => item.status === 'falta' && item.aula?.data)
                .map((item) => new Date(`${item.aula?.data}T00:00:00`)),
        [historico]
    )

    const taxa = useMemo(() => {
        const presentes = historico.filter((item) => item.status === 'presente').length
        const faltas = historico.filter((item) => item.status === 'falta').length
        if (presentes + faltas === 0) return 0
        return Math.round((presentes / (presentes + faltas)) * 100)
    }, [historico])

    const sessoesDoDia = useMemo(() => {
        if (!selectedDate) return []
        return historico.filter((item) => {
            if (!item.aula?.data) return false
            const dataAula = new Date(`${item.aula.data}T00:00:00`)
            return sameDay(dataAula, selectedDate)
        })
    }, [historico, selectedDate])

    if (loading) {
        return <LoadingSpinner label="Carregando frequencia..." />
    }

    return (
        <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Calendario de frequencia</h3>
                        <p className="text-sm font-medium text-gray-500">
                            Presenca real por aula, atualizada automaticamente.
                        </p>
                    </div>
                    <CalendarCheck2 className="h-5 w-5 text-[#CC0000]" />
                </div>

                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={{
                        presente: datasPresentes,
                        falta: datasFalta,
                    }}
                    modifiersClassNames={{
                        presente:
                            'bg-emerald-100 text-emerald-700 data-[selected-single=true]:bg-emerald-600 data-[selected-single=true]:text-white',
                        falta: 'bg-red-100 text-red-700 data-[selected-single=true]:bg-red-600 data-[selected-single=true]:text-white',
                    }}
                    className="rounded-xl border border-gray-100"
                />

                <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        Presente
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        Falta
                    </span>
                </div>
            </section>

            <section className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    <article className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Aulas</p>
                        <p className="mt-1 text-xl font-bold text-gray-900">{historico.length}</p>
                    </article>
                    <article className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Presencas</p>
                        <p className="mt-1 text-xl font-bold text-emerald-700">
                            {historico.filter((item) => item.status === 'presente').length}
                        </p>
                    </article>
                    <article className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Taxa</p>
                        <p className="mt-1 text-xl font-bold text-gray-900">{taxa}%</p>
                    </article>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900">
                        {selectedDate ? `Registros de ${formatDate(selectedDate)}` : 'Registros do dia'}
                    </h4>
                    {sessoesDoDia.length === 0 ? (
                        <p className="mt-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-xs font-medium text-gray-500">
                            Nenhum registro nesta data.
                        </p>
                    ) : (
                        <div className="mt-3 space-y-2">
                            {sessoesDoDia.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 text-sm font-medium text-gray-700"
                                >
                                    <p className="font-semibold text-gray-900">{item.aula?.titulo ?? 'Aula'}</p>
                                    <p className="text-xs text-gray-500">
                                        {item.aula?.hora_inicio?.slice(0, 5) ?? '--:--'} -{' '}
                                        {item.status === 'presente' ? 'Presente' : item.status === 'falta' ? 'Falta' : 'Agendado'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
