import Link from 'next/link'
import { Clock3, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils/formatters'

interface CheckinItem {
    id: string
    data_checkin: string
    aluno: { id: string; nome: string } | null
    aula: { id: string; titulo: string; data: string } | null
}

interface CheckinRow {
    id: string
    data_checkin: string
    aluno: { id: string; nome: string } | Array<{ id: string; nome: string }> | null
    aula: { id: string; titulo: string; data: string } | Array<{ id: string; titulo: string; data: string }> | null
}

async function getUltimosCheckins() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('presencas')
        .select('id,data_checkin,aluno:alunos(id,nome),aula:aulas(id,titulo,data)')
        .eq('status', 'presente')
        .not('data_checkin', 'is', null)
        .order('data_checkin', { ascending: false })
        .limit(5)

    if (error) {
        console.error(error)
        return []
    }

    return ((data as unknown as CheckinRow[]) ?? []).map((item) => ({
        ...item,
        aluno: Array.isArray(item.aluno) ? item.aluno[0] ?? null : item.aluno,
        aula: Array.isArray(item.aula) ? item.aula[0] ?? null : item.aula,
    })) as CheckinItem[]
}

export async function UltimosCheckins() {
    const checkins = await getUltimosCheckins()

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-3">
                <h3 className="border-l-3 border-[#CC0000] pl-2 text-sm font-semibold text-gray-900">Ultimos check-ins</h3>
                <Link
                    href="/presenca"
                    className="group flex items-center text-xs font-semibold text-gray-500 transition-colors hover:text-[#CC0000]"
                >
                    Ver chamada
                    <ChevronRight className="ml-0.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>

            {checkins.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-sm font-medium text-gray-500">
                    Nenhum check-in registrado ainda.
                </p>
            ) : (
                <div className="space-y-2">
                    {checkins.map((item) => (
                        <div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50/70 p-3">
                            <p className="text-sm font-semibold text-gray-900">{item.aluno?.nome ?? 'Aluno'}</p>
                            <p className="mt-0.5 text-xs font-medium text-gray-600">{item.aula?.titulo ?? 'Aula'}</p>
                            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                <Clock3 className="h-3.5 w-3.5" />
                                {formatDate(item.aula?.data ?? item.data_checkin)} -{' '}
                                {new Date(item.data_checkin).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
