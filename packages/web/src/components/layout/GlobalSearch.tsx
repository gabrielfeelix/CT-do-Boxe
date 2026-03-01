'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, FileText, UserCheck, Users, Loader2, FileSignature } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type SearchResult = {
    id: string
    title: string
    subtitle: string
    type: 'aluno' | 'candidato' | 'contrato' | 'plano'
    href: string
    icon: React.ElementType
}

export function GlobalSearch() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    // Atalho Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Click outside para fechar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([])
            return
        }

        const timer = setTimeout(async () => {
            setLoading(true)
            const q = `%${query}%`

            const [
                { data: alunos },
                { data: candidatos },
                { data: contratos },
                { data: planos }
            ] = await Promise.all([
                supabase.from('alunos').select('id, nome, email, status').ilike('nome', q).limit(3),
                supabase.from('candidatos').select('id, nome, email, status').ilike('nome', q).limit(3),
                supabase.from('contratos').select('id, status, aluno:aluno_id(nome)').ilike('aluno.nome', q).limit(3),
                supabase.from('planos').select('id, nome, tipo').ilike('nome', q).limit(2)
            ])

            const formatted: SearchResult[] = []

            if (alunos) {
                formatted.push(...alunos.map(a => ({
                    id: a.id,
                    title: a.nome,
                    subtitle: a.status === 'ativo' ? 'Aluno Ativo' : 'Aluno Inativo',
                    type: 'aluno' as const,
                    href: `/alunos/${a.id}`,
                    icon: Users
                })))
            }

            if (candidatos) {
                formatted.push(...candidatos.map(c => ({
                    id: c.id,
                    title: c.nome,
                    subtitle: c.status === 'aguardando' ? 'Processo Seletivo' : c.status,
                    type: 'candidato' as const,
                    href: `/candidatos/${c.id}`,
                    icon: UserCheck
                })))
            }

            if (contratos) {
                formatted.push(...contratos.map(c => ({
                    id: c.id,
                    title: (c.aluno as any)?.nome || 'Contrato Sem Nome',
                    subtitle: `Status: ${c.status}`,
                    type: 'contrato' as const,
                    href: `/contratos/${c.id}`,
                    icon: FileSignature
                })))
            }

            if (planos) {
                formatted.push(...planos.map(p => ({
                    id: p.id,
                    title: p.nome,
                    subtitle: `Plano ${p.tipo.toUpperCase()}`,
                    type: 'plano' as const,
                    href: `/configuracoes/planos`,
                    icon: FileText
                })))
            }

            setResults(formatted)
            setLoading(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [query, supabase])

    const groups = results.reduce((acc, result) => {
        if (!acc[result.type]) acc[result.type] = []
        acc[result.type].push(result)
        return acc
    }, {} as Record<string, SearchResult[]>)

    const labels: Record<string, string> = {
        aluno: 'Alunos',
        candidato: 'Candidatos',
        contrato: 'Contratos',
        plano: 'Planos',
    }

    return (
        <div ref={wrapperRef} className="relative w-full max-w-sm ml-auto z-50">
            {/* Input Wrapper */}
            <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setOpen(true)
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder="Buscar (Cmd+K)"
                    className="w-full h-10 pl-9 pr-10 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-all font-medium text-gray-800 placeholder:text-gray-400 shadow-sm"
                />
                {loading && (
                    <Loader2 className="absolute right-3 w-4 h-4 text-gray-400 animate-spin" />
                )}
            </div>

            {/* Dropdown Modal */}
            {open && (query.length > 0 || results.length > 0) && (
                <div className="absolute top-full mt-2 left-0 w-[400px] max-w-[calc(100vw-48px)] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden transform origin-top right-0 sm:right-auto sm:left-auto">
                    <div className="max-h-[60vh] overflow-y-auto overscroll-contain px-2 py-3 custom-scrollbar">

                        {query.length > 0 && query.length < 2 && (
                            <p className="text-center text-xs text-gray-400 py-6 font-medium">Digite mais caracteres...</p>
                        )}

                        {query.length >= 2 && !loading && results.length === 0 && (
                            <div className="text-center py-8">
                                <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm font-bold text-gray-900">Sem resultados</p>
                                <p className="text-xs text-gray-500 mt-0.5">Nenhum dado encontrado para &quot;{query}&quot;.</p>
                            </div>
                        )}

                        {Object.entries(groups).map(([type, items]) => (
                            <div key={type} className="mb-3 last:mb-0">
                                <h4 className="px-3 pb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {labels[type] || type}
                                </h4>
                                <div className="space-y-1">
                                    {items.map((item) => {
                                        const Icon = item.icon
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    setOpen(false)
                                                    setQuery('')
                                                    router.push(item.href)
                                                }}
                                                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group text-left"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 text-[#CC0000] flex items-center justify-center shrink-0 group-hover:bg-[#CC0000] group-hover:text-white transition-colors">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-[#CC0000] transition-colors truncate">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs font-medium text-gray-400 truncate">
                                                        {item.subtitle}
                                                    </p>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Clean */}
                    <div className="bg-gray-50 border-t border-gray-100 p-2.5 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pesquisa Global KITAMO</p>
                    </div>
                </div>
            )}
        </div>
    )
}
