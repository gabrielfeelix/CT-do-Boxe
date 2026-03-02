'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserPlus, Users, ChevronRight, FileSpreadsheet } from 'lucide-react'
import { useAlunos } from '@/hooks/useAlunos'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AvatarInitials } from '@/components/shared/AvatarInitials'
import { SearchInput } from '@/components/shared/SearchInput'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils/formatters'
import { useRouter } from 'next/navigation'
import { ModalImportacaoLote } from '@/components/alunos/ModalImportacaoLote'

const STATUS_OPTIONS = [
    { value: 'todos', label: 'Todos' },
    { value: 'ativo', label: 'Ativos' },
    { value: 'bloqueado', label: 'Bloqueados' },
    { value: 'inativo', label: 'Inativos' },
    { value: 'cancelado', label: 'Cancelados' },
]

export default function AlunosPage() {
    const router = useRouter()
    const [busca, setBusca] = useState('')
    const [statusFiltro, setStatusFiltro] = useState('todos')
    const [isLoteOpen, setIsLoteOpen] = useState(false)

    const { alunos, loading, error, total, refetch } = useAlunos({
        busca,
        status: statusFiltro,
    })

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto pb-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Alunos</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        {loading ? 'Buscando...' : `${total} aluno${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsLoteOpen(true)}
                        className="flex items-center gap-2 bg-gray-50 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 text-gray-700 hover:text-emerald-700 text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-200"
                        title="Importação em Lote"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Lote
                    </button>
                    <Link
                        href="/alunos/novo"
                        className="flex items-center gap-2 bg-[#CC0000] hover:bg-[#AA0000] text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-red-500/10 transition-all duration-200"
                    >
                        <UserPlus className="h-4 w-4" />
                        Novo Aluno
                    </Link>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 max-w-md">
                    <SearchInput
                        value={busca}
                        onChange={setBusca}
                        placeholder="Buscar por nome, e-mail ou telefone..."
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setStatusFiltro(opt.value)}
                            className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
                ${statusFiltro === opt.value
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50'
                                }
              `}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conteúdo */}
            {loading ? (
                <LoadingSpinner label="Carregando lista de alunos..." />
            ) : error ? (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded-xl p-5 shadow-sm">
                    {error}
                </div>
            ) : alunos.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="Nenhum registro encontrado"
                    description={
                        busca
                            ? `Nenhum resultado pra "${busca}". Tente alterar os filtros ou o termo buscado.`
                            : 'Seu CT ainda não possui nenhum aluno registrado no sistema.'
                    }
                    action={
                        !busca
                            ? { label: 'Ir para Cadastro Automático', onClick: () => router.push('/alunos/novo') }
                            : undefined
                    }
                />
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Aluno
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                    Contato
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                    Cadastro
                                </th>
                                <th className="px-6 py-4" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {alunos.map((aluno) => (
                                <tr
                                    key={aluno.id}
                                    className="hover:bg-gray-50/80 transition-colors duration-200 cursor-pointer group"
                                    onClick={() => router.push(`/alunos/${aluno.id}`)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <AvatarInitials nome={aluno.nome} fotoUrl={aluno.foto_url} size="md" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-tight">
                                                    {aluno.nome}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 sm:hidden font-medium">
                                                    {aluno.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <p className="text-sm font-medium text-gray-700">{aluno.email}</p>
                                        {aluno.telefone && (
                                            <p className="text-xs font-medium text-gray-400 mt-1">{aluno.telefone}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={aluno.status} />
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <p className="text-sm font-medium text-gray-500">
                                            {formatDate(aluno.data_cadastro || aluno.created_at)}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div className="bg-gray-100 p-1.5 rounded-lg text-gray-500 group-hover:bg-[#CC0000] group-hover:text-white transition-colors">
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <ModalImportacaoLote
                isOpen={isLoteOpen}
                onClose={() => setIsLoteOpen(false)}
                onSuccess={refetch}
            />
        </div>
    )
}
