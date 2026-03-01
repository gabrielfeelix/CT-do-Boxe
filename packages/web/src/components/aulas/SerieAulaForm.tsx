'use client'

import { useMemo, useState } from 'react'
import { serieAulaSchema, type SerieAulaValues } from '@/lib/validations/serie-aula'

interface SerieAulaFormProps {
    initialValues?: Partial<SerieAulaValues>
    submitting?: boolean
    submitLabel?: string
    onSubmit: (values: SerieAulaValues) => Promise<void>
    onCancel?: () => void
}

type FormState = Omit<SerieAulaValues, 'data_fim'> & { data_fim: string }
type Erros = Partial<Record<keyof FormState, string>>

const diasSemana = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
]

const DEFAULT_VALUES: FormState = {
    titulo: 'Boxe Adulto - Grupo',
    dia_semana: 1,
    hora_inicio: '18:30',
    hora_fim: '19:30',
    categoria: 'adulto',
    tipo_aula: 'grupo',
    professor: 'Argel Riboli',
    capacidade_maxima: 16,
    ativo: true,
    data_inicio: new Date().toISOString().slice(0, 10),
    data_fim: '',
}

function toNumber(value: string) {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? 0 : parsed
}

export function SerieAulaForm({
    initialValues,
    submitting = false,
    submitLabel = 'Salvar serie',
    onSubmit,
    onCancel,
}: SerieAulaFormProps) {
    const [values, setValues] = useState<FormState>({
        ...DEFAULT_VALUES,
        ...initialValues,
        data_fim: initialValues?.data_fim ?? '',
    })
    const [errors, setErrors] = useState<Erros>({})

    const duracaoMinutos = useMemo(() => {
        const [inicioHora, inicioMinuto] = values.hora_inicio.split(':').map(Number)
        const [fimHora, fimMinuto] = values.hora_fim.split(':').map(Number)
        return Math.max(0, fimHora * 60 + fimMinuto - (inicioHora * 60 + inicioMinuto))
    }, [values.hora_inicio, values.hora_fim])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const payload: SerieAulaValues = {
            ...values,
            data_fim: values.data_fim ? values.data_fim : null,
        }

        const parsed = serieAulaSchema.safeParse(payload)
        if (!parsed.success) {
            const formErrors: Erros = {}
            for (const issue of parsed.error.issues) {
                const field = issue.path[0] as keyof FormState
                if (!formErrors[field]) formErrors[field] = issue.message
            }
            setErrors(formErrors)
            return
        }

        setErrors({})
        await onSubmit(parsed.data)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-5">
                    <h3 className="text-lg font-bold text-gray-900">Serie recorrente</h3>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                        Defina um horario fixo semanal para gerar aulas automaticamente.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Titulo</label>
                        <input
                            type="text"
                            value={values.titulo}
                            onChange={(event) => setValues((prev) => ({ ...prev, titulo: event.target.value }))}
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                        />
                        {errors.titulo && <p className="mt-1 text-xs font-semibold text-red-600">{errors.titulo}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Dia da semana</label>
                        <select
                            value={values.dia_semana}
                            onChange={(event) =>
                                setValues((prev) => ({ ...prev, dia_semana: toNumber(event.target.value) }))
                            }
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                        >
                            {diasSemana.map((dia) => (
                                <option key={dia.value} value={dia.value}>
                                    {dia.label}
                                </option>
                            ))}
                        </select>
                        {errors.dia_semana && (
                            <p className="mt-1 text-xs font-semibold text-red-600">{errors.dia_semana}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Professor</label>
                        <input
                            type="text"
                            value={values.professor}
                            onChange={(event) => setValues((prev) => ({ ...prev, professor: event.target.value }))}
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
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
                                    categoria: event.target.value as FormState['categoria'],
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
                                    tipo_aula: event.target.value as FormState['tipo_aula'],
                                }))
                            }
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                        >
                            <option value="grupo">Grupo</option>
                            <option value="individual">Individual</option>
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

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Data inicio</label>
                        <input
                            type="date"
                            value={values.data_inicio}
                            onChange={(event) => setValues((prev) => ({ ...prev, data_inicio: event.target.value }))}
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                        />
                        {errors.data_inicio && (
                            <p className="mt-1 text-xs font-semibold text-red-600">{errors.data_inicio}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Data fim (opcional)</label>
                        <input
                            type="date"
                            value={values.data_fim}
                            onChange={(event) => setValues((prev) => ({ ...prev, data_fim: event.target.value }))}
                            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                        />
                        {errors.data_fim && (
                            <p className="mt-1 text-xs font-semibold text-red-600">{errors.data_fim}</p>
                        )}
                    </div>
                </div>

                <label className="mt-4 flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <input
                        type="checkbox"
                        checked={values.ativo}
                        onChange={(event) => setValues((prev) => ({ ...prev, ativo: event.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-[#CC0000] focus:ring-[#CC0000]/30"
                    />
                    <span className="text-sm font-semibold text-gray-700">Serie ativa para gerar novas aulas</span>
                </label>

                <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
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
