'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type PresencaStatus = 'agendado' | 'presente' | 'falta' | 'cancelada'

interface AlunoBasico {
    id: string
    nome: string
    email?: string
    telefone?: string
    foto_url?: string
    status?: string
    ultimo_treino?: string | null
    total_treinos?: number
}

interface PresencaRow {
    id: string
    aula_id: string
    aluno_id: string
    status: PresencaStatus
    data_checkin: string | null
    created_at: string
    updated_at: string
    aluno: AlunoBasico | AlunoBasico[] | null
}

export interface PresencaRegistro {
    id: string
    aula_id: string
    aluno_id: string
    status: PresencaStatus
    data_checkin: string | null
    created_at: string
    updated_at: string
    aluno: AlunoBasico | null
    persistido: boolean
}

export interface PresencaResumo {
    total: number
    presentes: number
    faltas: number
    agendados: number
    cancelados: number
    taxa_presenca: number
}

function calcularResumo(registros: PresencaRegistro[]): PresencaResumo {
    const total = registros.length
    const presentes = registros.filter((item) => item.status === 'presente').length
    const faltas = registros.filter((item) => item.status === 'falta').length
    const agendados = registros.filter((item) => item.status === 'agendado').length
    const cancelados = registros.filter((item) => item.status === 'cancelada').length
    const considerados = presentes + faltas
    const taxa = considerados === 0 ? 0 : Math.round((presentes / considerados) * 100)

    return {
        total,
        presentes,
        faltas,
        agendados,
        cancelados,
        taxa_presenca: taxa,
    }
}

function normalizeRow(item: PresencaRow): PresencaRegistro {
    const aluno = Array.isArray(item.aluno) ? item.aluno[0] ?? null : item.aluno
    return {
        id: item.id,
        aula_id: item.aula_id,
        aluno_id: item.aluno_id,
        status: item.status,
        data_checkin: item.data_checkin,
        created_at: item.created_at,
        updated_at: item.updated_at,
        aluno,
        persistido: true,
    }
}

export function usePresencaAula(aulaId: string) {
    const supabase = createClient()
    const [registros, setRegistros] = useState<PresencaRegistro[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPresenca = useCallback(async () => {
        if (!aulaId) {
            setRegistros([])
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const [presencasResult, alunosResult] = await Promise.all([
                supabase
                    .from('presencas')
                    .select(
                        'id,aula_id,aluno_id,status,data_checkin,created_at,updated_at,aluno:alunos(id,nome,email,telefone,foto_url,status,ultimo_treino,total_treinos)'
                    )
                    .eq('aula_id', aulaId),
                supabase
                    .from('alunos')
                    .select('id,nome,email,telefone,foto_url,status,ultimo_treino,total_treinos')
                    .eq('status', 'ativo')
                    .order('nome', { ascending: true }),
            ])

            if (presencasResult.error) throw presencasResult.error
            if (alunosResult.error) throw alunosResult.error

            const persistidos = ((presencasResult.data as unknown as PresencaRow[]) ?? []).map(normalizeRow)
            const mapPersistidos = new Map(persistidos.map((item) => [item.aluno_id, item]))
            const alunosAtivos = (alunosResult.data as AlunoBasico[]) ?? []

            const sinteticos: PresencaRegistro[] = alunosAtivos
                .filter((aluno) => !mapPersistidos.has(aluno.id))
                .map((aluno) => ({
                    id: `novo-${aulaId}-${aluno.id}`,
                    aula_id: aulaId,
                    aluno_id: aluno.id,
                    status: 'agendado',
                    data_checkin: null,
                    created_at: '',
                    updated_at: '',
                    aluno,
                    persistido: false,
                }))

            const todos = [...persistidos, ...sinteticos].sort((a, b) =>
                (a.aluno?.nome ?? '').localeCompare(b.aluno?.nome ?? '')
            )

            setRegistros(todos)
        } catch (fetchError) {
            console.error(fetchError)
            setError('Não foi possível carregar a lista de presenca.')
            setRegistros([])
        } finally {
            setLoading(false)
        }
    }, [supabase, aulaId])

    useEffect(() => {
        fetchPresenca()
    }, [fetchPresenca])

    const atualizarTotaisAluno = useCallback(
        async ({
            alunoId,
            statusAnterior,
            statusNovo,
        }: {
            alunoId: string
            statusAnterior: PresencaStatus | null
            statusNovo: PresencaStatus
        }) => {
            const virouPresente = statusNovo === 'presente' && statusAnterior !== 'presente'
            const deixouPresente = statusNovo !== 'presente' && statusAnterior === 'presente'

            if (!virouPresente && !deixouPresente) return

            const { data: alunoAtual, error: alunoError } = await supabase
                .from('alunos')
                .select('total_treinos')
                .eq('id', alunoId)
                .single()

            if (alunoError) {
                console.error(alunoError)
                return
            }

            const totalAtual = Number(alunoAtual.total_treinos ?? 0)
            const totalNovo = virouPresente ? totalAtual + 1 : Math.max(0, totalAtual - 1)

            const payload: Record<string, unknown> = { total_treinos: totalNovo }
            if (virouPresente) {
                payload.ultimo_treino = new Date().toISOString().slice(0, 10)
            }

            const { error: updateAlunoError } = await supabase.from('alunos').update(payload).eq('id', alunoId)
            if (updateAlunoError) {
                console.error(updateAlunoError)
            }
        },
        [supabase]
    )

    const marcarPresenca = useCallback(
        async (alunoId: string, status: PresencaStatus) => {
            if (!aulaId) return { ok: false, error: 'Aula invalida.' }

            const { data: existente, error: existenteError } = await supabase
                .from('presencas')
                .select('id,status')
                .eq('aula_id', aulaId)
                .eq('aluno_id', alunoId)
                .maybeSingle()

            if (existenteError) {
                console.error(existenteError)
                return { ok: false, error: 'Não foi possível atualizar a presenca.' }
            }

            const dataCheckin = status === 'presente' ? new Date().toISOString() : null
            const payload = {
                aula_id: aulaId,
                aluno_id: alunoId,
                status,
                data_checkin: dataCheckin,
            }

            let writeError: unknown = null

            if (existente) {
                const { error: updateError } = await supabase
                    .from('presencas')
                    .update({
                        status: payload.status,
                        data_checkin: payload.data_checkin,
                    })
                    .eq('id', existente.id)
                if (updateError) writeError = updateError
            } else {
                const { error: insertError } = await supabase.from('presencas').insert(payload)
                if (insertError) writeError = insertError
            }

            if (writeError) {
                console.error(writeError)
                return { ok: false, error: 'Não foi possível salvar a presenca.' }
            }

            await atualizarTotaisAluno({
                alunoId,
                statusAnterior: (existente?.status as PresencaStatus | null) ?? null,
                statusNovo: status,
            })

            await fetchPresenca()
            return { ok: true, error: null }
        },
        [supabase, aulaId, fetchPresenca, atualizarTotaisAluno]
    )

    const checkinManual = useCallback(
        async (alunoId: string) => {
            return marcarPresenca(alunoId, 'presente')
        },
        [marcarPresenca]
    )

    const resumo = useMemo(() => calcularResumo(registros), [registros])

    return {
        registros,
        resumo,
        loading,
        error,
        refetch: fetchPresenca,
        marcarPresenca,
        checkinManual,
    }
}

export function useAlunosEmRisco(diasSemTreinar = 10) {
    const supabase = createClient()
    const [alunos, setAlunos] = useState<Array<AlunoBasico & { dias_sem_treinar: number }>>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchAlunosEmRisco() {
            setLoading(true)

            const { data, error } = await supabase
                .from('alunos')
                .select('id,nome,email,telefone,foto_url,status,ultimo_treino,total_treinos')
                .eq('status', 'ativo')
                .order('nome', { ascending: true })

            if (error) {
                console.error(error)
                setAlunos([])
                setLoading(false)
                return
            }

            const hoje = new Date()
            hoje.setHours(0, 0, 0, 0)

            const emRisco = ((data as AlunoBasico[]) ?? [])
                .map((aluno) => {
                    if (!aluno.ultimo_treino) {
                        return { ...aluno, dias_sem_treinar: 999 }
                    }

                    const ultimoTreino = new Date(aluno.ultimo_treino)
                    ultimoTreino.setHours(0, 0, 0, 0)
                    const diffMs = hoje.getTime() - ultimoTreino.getTime()
                    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                    return { ...aluno, dias_sem_treinar: diffDias }
                })
                .filter((aluno) => aluno.dias_sem_treinar >= diasSemTreinar)
                .sort((a, b) => b.dias_sem_treinar - a.dias_sem_treinar)

            setAlunos(emRisco)
            setLoading(false)
        }

        fetchAlunosEmRisco()
    }, [supabase, diasSemTreinar])

    return { alunos, loading }
}
