import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy'): string {
    return format(new Date(date), pattern, { locale: ptBR })
}

export function formatDateTime(date: string | Date): string {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatRelativeTime(date: string | Date): string {
    return formatDistanceToNow(new Date(date), { locale: ptBR, addSuffix: true })
}

export function formatPhone(phone: string): string {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}

export function formatCPF(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toUpperCase()
}
