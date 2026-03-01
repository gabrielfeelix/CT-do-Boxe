'use client'

import Link from 'next/link'
import { Calendar, Clock3, Users, UserCheck, UserX, Ban, MoreHorizontal } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatters'
import type { AulaResumo } from '@/hooks/useAulas'

interface AulaCardProps {
    aula: AulaResumo
    onCancelar?: (aula: AulaResumo) => void
}

function statusConfig(status: AulaResumo['status']) {
    if (status === 'agendada') {
        return {
            label: 'Agendada',
            className: 'bg-blue-50 text-blue-700 ring-blue-200',
        }
    }

    if (status === 'realizada') {
        return {
            label: 'Realizada',
            className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        }
    }

    return {
        label: 'Cancelada',
        className: 'bg-red-50 text-red-700 ring-red-200',
    }
}

function categoriaConfig(categoria: AulaResumo['categoria']) {
    if (categoria === 'infantil') {
        return {
            label: 'Infantil',
            className: 'bg-purple-50 text-purple-700 ring-purple-200',
        }
    }

    if (categoria === 'adulto') {
        return {
            label: 'Adulto',
            className: 'bg-gray-100 text-gray-700 ring-gray-200',
        }
    }

    return {
        label: 'Todos',
        className: 'bg-amber-50 text-amber-700 ring-amber-200',
    }
}

function tipoAulaConfig(tipo: AulaResumo['tipo_aula']) {
    if (tipo === 'individual') {
        return {
            label: 'Personal',
            className: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
        }
    }

    return {
        label: 'Grupo',
        className: 'bg-teal-50 text-teal-700 ring-teal-200',
    }
}

export function AulaCard({ aula, onCancelar }: AulaCardProps) {
    const status = statusConfig(aula.status)
    const categoria = categoriaConfig(aula.categoria)
    const tipoAula = tipoAulaConfig(aula.tipo_aula)
    const ocupacao = aula.capacidade_maxima > 0 ? Math.round((aula.total_agendados / aula.capacidade_maxima) * 100) : 0

    return (
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Aula</p>
                    <h3 className="mt-1 text-lg font-bold text-gray-900">{aula.titulo}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${categoria.className}`}>
                            {categoria.label}
                        </span>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${tipoAula.className}`}>
                            {tipoAula.label}
                        </span>
                    </div>
                </div>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${status.className}`}>
                    {status.label}
                </span>
            </div>

            <div className="grid gap-2 text-sm text-gray-700">
                <p className="flex items-center gap-2 font-medium">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(aula.data)}
                </p>
                <p className="flex items-center gap-2 font-medium">
                    <Clock3 className="h-4 w-4 text-gray-400" />
                    {aula.hora_inicio.slice(0, 5)} - {aula.hora_fim.slice(0, 5)}
                </p>
                <p className="flex items-center gap-2 font-medium">
                    <Users className="h-4 w-4 text-gray-400" />
                    {aula.professor}
                </p>
            </div>

            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-600">
                    <span>Ocupacao</span>
                    <span>{aula.total_agendados}/{aula.capacidade_maxima}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                        className={`h-full rounded-full transition-all ${
                            ocupacao >= 100 ? 'bg-red-500' : ocupacao >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(ocupacao, 100)}%` }}
                    />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <p className="flex items-center gap-1 font-semibold text-emerald-700">
                        <UserCheck className="h-3.5 w-3.5" />
                        {aula.total_presentes} presentes
                    </p>
                    <p className="flex items-center gap-1 font-semibold text-red-700">
                        <UserX className="h-3.5 w-3.5" />
                        {aula.total_faltas} faltas
                    </p>
                    <p className="flex items-center gap-1 font-semibold text-gray-700">
                        <Ban className="h-3.5 w-3.5" />
                        {aula.vagas_disponiveis} vagas livres
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                    href={`/aulas/${aula.id}`}
                    className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                    Ver detalhes
                </Link>
                <Link
                    href={`/presenca/${aula.id}`}
                    className="inline-flex h-9 items-center rounded-lg bg-[#CC0000] px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#AA0000]"
                >
                    Lista de presenca
                </Link>
                {aula.status === 'agendada' && onCancelar && (
                    <button
                        type="button"
                        className="inline-flex h-9 items-center rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                        onClick={() => onCancelar(aula)}
                    >
                        <MoreHorizontal className="mr-1.5 h-3.5 w-3.5" />
                        Cancelar
                    </button>
                )}
            </div>
        </article>
    )
}
