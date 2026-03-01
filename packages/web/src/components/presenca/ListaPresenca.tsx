'use client'

import { CheckCircle2, Clock3, UserMinus, XCircle } from 'lucide-react'
import type { PresencaRegistro, PresencaStatus } from '@/hooks/usePresenca'

interface ListaPresencaProps {
    registros: PresencaRegistro[]
    loading?: boolean
    onMarcar: (alunoId: string, status: PresencaStatus) => Promise<void>
}

function statusPill(status: PresencaStatus) {
    if (status === 'presente') {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    }
    if (status === 'falta') {
        return 'bg-red-50 text-red-700 ring-red-200'
    }
    if (status === 'cancelada') {
        return 'bg-gray-100 text-gray-600 ring-gray-200'
    }
    return 'bg-blue-50 text-blue-700 ring-blue-200'
}

function statusLabel(status: PresencaStatus) {
    if (status === 'presente') return 'Presente'
    if (status === 'falta') return 'Falta'
    if (status === 'cancelada') return 'Cancelada'
    return 'Agendado'
}

export function ListaPresenca({ registros, loading = false, onMarcar }: ListaPresencaProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full border-collapse text-left">
                <thead className="bg-gray-50/80">
                    <tr className="border-b border-gray-100">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Aluno</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Check-in</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Acoes
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {registros.map((registro) => (
                        <tr key={registro.id} className="hover:bg-gray-50/70">
                            <td className="px-4 py-3">
                                <p className="text-sm font-semibold text-gray-900">{registro.aluno?.nome ?? 'Aluno removido'}</p>
                                <p className="text-xs font-medium text-gray-500">{registro.aluno?.email ?? '-'}</p>
                            </td>
                            <td className="px-4 py-3">
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusPill(
                                        registro.status
                                    )}`}
                                >
                                    {statusLabel(registro.status)}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-600">
                                {registro.data_checkin
                                    ? new Date(registro.data_checkin).toLocaleTimeString('pt-BR', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      })
                                    : '-'}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex flex-wrap justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onMarcar(registro.aluno_id, 'presente')}
                                        disabled={loading}
                                        className="inline-flex h-8 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                        Presente
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onMarcar(registro.aluno_id, 'falta')}
                                        disabled={loading}
                                        className="inline-flex h-8 items-center rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <UserMinus className="mr-1 h-3.5 w-3.5" />
                                        Falta
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onMarcar(registro.aluno_id, 'agendado')}
                                        disabled={loading}
                                        className="inline-flex h-8 items-center rounded-lg border border-blue-200 bg-blue-50 px-2.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Clock3 className="mr-1 h-3.5 w-3.5" />
                                        Pendente
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onMarcar(registro.aluno_id, 'cancelada')}
                                        disabled={loading}
                                        className="inline-flex h-8 items-center rounded-lg border border-gray-200 bg-gray-100 px-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <XCircle className="mr-1 h-3.5 w-3.5" />
                                        Cancelar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
