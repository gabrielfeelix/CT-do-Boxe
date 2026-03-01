import { z } from 'zod'

const today = new Date()
today.setHours(0, 0, 0, 0)

function isValidDate(value: string) {
    const parsed = new Date(value)
    return !Number.isNaN(parsed.getTime())
}

function toMinutes(time: string) {
    const [hour, minute] = time.split(':').map(Number)
    return hour * 60 + minute
}

export const aulaFormSchema = z
    .object({
        titulo: z
            .string()
            .trim()
            .min(3, 'O titulo precisa ter ao menos 3 caracteres.')
            .max(80, 'O titulo pode ter no maximo 80 caracteres.'),
        data: z
            .string()
            .refine(isValidDate, 'Data invalida.')
            .refine((value) => new Date(value) >= today, 'Não é possível criar aula em data passada.'),
        hora_inicio: z
            .string()
            .regex(/^\d{2}:\d{2}$/, 'Horario de inicio invalido.'),
        hora_fim: z
            .string()
            .regex(/^\d{2}:\d{2}$/, 'Horario de termino invalido.'),
        professor: z
            .string()
            .trim()
            .min(3, 'O nome do professor precisa ter ao menos 3 caracteres.')
            .max(60, 'O nome do professor pode ter no maximo 60 caracteres.'),
        capacidade_maxima: z.coerce.number().int('A capacidade maxima deve ser um numero inteiro.').min(1).max(100),
        categoria: z.enum(['infantil', 'adulto', 'todos']),
        tipo_aula: z.enum(['grupo', 'individual']),
    })
    .superRefine((value, ctx) => {
        if (toMinutes(value.hora_fim) <= toMinutes(value.hora_inicio)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['hora_fim'],
                message: 'O horario de termino deve ser maior que o horario de inicio.',
            })
        }
    })

export const atualizarAulaSchema = z
    .object({
        titulo: z.string().trim().min(3).max(80).optional(),
        data: z
            .string()
            .refine(isValidDate, 'Data invalida.')
            .refine((value) => new Date(value) >= today, 'Não é possível criar aula em data passada.')
            .optional(),
        hora_inicio: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        hora_fim: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        professor: z.string().trim().min(3).max(60).optional(),
        capacidade_maxima: z.coerce.number().int().min(1).max(100).optional(),
        categoria: z.enum(['infantil', 'adulto', 'todos']).optional(),
        tipo_aula: z.enum(['grupo', 'individual']).optional(),
        status: z.enum(['agendada', 'realizada', 'cancelada']).optional(),
    })
    .superRefine((value, ctx) => {
        if (value.hora_inicio && value.hora_fim && toMinutes(value.hora_fim) <= toMinutes(value.hora_inicio)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['hora_fim'],
                message: 'O horario de termino deve ser maior que o horario de inicio.',
            })
        }
    })

export type AulaFormValues = z.infer<typeof aulaFormSchema>
export type AtualizarAulaValues = z.infer<typeof atualizarAulaSchema>
