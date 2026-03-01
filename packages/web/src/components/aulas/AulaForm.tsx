'use client'

import { useMemo, useState } from 'react'
import { aulaFormSchema, type AulaFormValues } from '@/lib/validations/aula'

interface AulaFormProps {
    initialValues?: Partial<AulaFormValues>
    submitting?: boolean
    submitLabel?: string
    onSubmit: (values: AulaFormValues) => Promise<void>
    onCancel?: () => void
}

type Erros = Partial<Record<keyof AulaFormValues, string>>

const DEFAULT_VALUES: AulaFormValues = {
    titulo: '',
    data: new Date().toISOString().slice(0, 10),
    hora_inicio: '19:00',
    hora_fim: '20:00',
    professor: 'Argel Riboli',
    capacidade_maxima: 16,
    categoria: 'adulto',
    tipo_aula: 'grupo',
}

function toNumber(value: string) {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? 0 : parsed
}

export function AulaForm({
    initialValues,
    submitting = false,
    submitLabel = 'Salvar aula',
    onSubmit,
    onCancel,
}: AulaFormProps) {
    const [values, setValues] = useState<AulaFormValues>({ ...DEFAULT_VALUES, ...initialValues })
    const [errors, setErrors] = useState<Erros>({})

    const duracaoMinutos = useMemo(() => {
        const inicio = values.hora_inicio.split(':').map(Number)
        const fim = values.hora_fim.split(':').map(Number)
        if (inicio.length !== 2 || fim.length !== 2) return 0
        return Math.max(0, fim[0] * 60 + fim[1] - (inicio[0] * 60 + inicio[1]))
    }, [values.hora_inicio, values.hora_fim])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = aulaFormSchema.safeParse(values)
        if (!parsed.success) {
            const formErrors: Erros = {}
            for (const issue of parsed.error.issues) {
                const field = issue.path[0] as keyof AulaFormValues
                if (!formErrors[field]) {
                    formErrors[field] = issue.message
                }
            }
            setErrors(formErrors)
            return
        }

        setErrors({})
        await onSubmit(parsed.data)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h3 className="text-lg font-bold text-gray-900">Dados da aula</h3>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                        Defina horario, professor e capacidade para liberar a chamada.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Titulo da aula</label>
                        <input
                            type="text"
                            value={values.titulo}
                            onChange={(event) => setValues((prev) => ({ ...prev, titulo: event.target.value }))}
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                            placeholder="Ex.: Tecnica de base e deslocamento"
                        />
                        {errors.titulo && <p className="mt-1 text-xs font-semibold text-red-600">{errors.titulo}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Data</label>
                        <input
                            type="date"
                            value={values.data}
                            onChange={(event) => setValues((prev) => ({ ...prev, data: event.target.value }))}
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                        />
                        {errors.data && <p className="mt-1 text-xs font-semibold text-red-600">{errors.data}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Professor</label>
                        <input
                            type="text"
                            value={values.professor}
                            onChange={(event) => setValues((prev) => ({ ...prev, professor: event.target.value }))}
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                            placeholder="Nome do professor"
                        />
                        {errors.professor && (
                            <p className="mt-1 text-xs font-semibold text-red-600">{errors.professor}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Categoria</label>
                        <select
                            value={values.categoria}
                            onChange={(event) =>
                                setValues((prev) => ({
                                    ...prev,
                                    categoria: event.target.value as AulaFormValues['categoria'],
                                }))
                            }
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                        >
                            <option value="infantil">Infantil</option>
                            <option value="adulto">Adulto</option>
                            <option value="todos">Todos</option>
                        </select>
                        {errors.categoria && (
                            <p className="mt-1 text-xs font-semibold text-red-600">{errors.categoria}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Tipo de aula</label>
                        <select
                            value={values.tipo_aula}
                            onChange={(event) =>
                                setValues((prev) => ({
                                    ...prev,
                                    tipo_aula: event.target.value as AulaFormValues['tipo_aula'],
                                }))
                            }
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                        >
                            <option value="grupo">Grupo</option>
                            <option value="individual">Individual (Personal)</option>
                        </select>
                        {errors.tipo_aula && (
                            <p className="mt-1 text-xs font-semibold text-red-600">{errors.tipo_aula}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Inicio</label>
                        <input
                            type="time"
                            value={values.hora_inicio}
                            onChange={(event) => setValues((prev) => ({ ...prev, hora_inicio: event.target.value }))}
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                        />
                        {errors.hora_inicio && (
                            <p className="mt-1 text-xs font-semibold text-red-600">{errors.hora_inicio}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Termino</label>
                        <input
                            type="time"
                            value={values.hora_fim}
                            onChange={(event) => setValues((prev) => ({ ...prev, hora_fim: event.target.value }))}
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                        />
                        {errors.hora_fim && <p className="mt-1 text-xs font-semibold text-red-600">{errors.hora_fim}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Capacidade maxima</label>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={values.capacidade_maxima}
                            onChange={(event) =>
                                setValues((prev) => ({ ...prev, capacidade_maxima: toNumber(event.target.value) }))
                            }
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                        />
                        {errors.capacidade_maxima && (
                            <p className="mt-1 text-xs font-semibold text-red-600">{errors.capacidade_maxima}</p>
                        )}
                    </div>
                </div>

                <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
                    Duracao prevista: <span className="font-semibold text-gray-900">{duracaoMinutos} minutos</span>
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-[#CC0000] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#AA0000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? 'Salvando...' : submitLabel}
                </button>
            </div>
        </form>
    )
}
