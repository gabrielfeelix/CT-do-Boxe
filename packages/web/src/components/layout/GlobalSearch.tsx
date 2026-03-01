'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, FileText, UserCheck, Users, Loader2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type SearchResult = {
    id: string
    title: string
    subtitle: string
    type: 'aluno' | 'candidato' | 'contrato' | 'aula' | 'financeiro' | 'plano'
    href: string
    icon: React.ElementType
    date?: string
}

export function GlobalSearch() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    // Atalho Cmd+K / Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus()
        }
        if (!open) {
            setQuery('')
            setResults([])
        }
    }, [open])

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([])
            return
        }

        const timer = setTimeout(async () => {
            setLoading(true)
            const q = `%${query}%`

            // 1. Buscar Alunos
            const { data: alunos } = await supabase
                .from('alunos')
                .select('id, nome, email, status')
                .ilike('nome', q)
                .limit(3)

            // 2. Buscar Candidatos
            const { data: candidatos } = await supabase
                .from('candidatos')
                .select('id, nome, email, status')
                .ilike('nome', q)
                .limit(3)

            // 3. Buscar Planos
            const { data: planos } = await supabase
                .from('planos')
                .select('id, nome, tipo')
                .ilike('nome', q)
                .limit(2)

            // Format results
            const formatted: SearchResult[] = [
                ...(alunos?.map(a => ({
                    id: a.id,
                    title: a.nome,
                    subtitle: a.email,
                    type: 'aluno' as const,
                    href: `/alunos/${a.id}`,
                    icon: Users
                })) || []),
                ...(candidatos?.map(c => ({
                    id: c.id,
                    title: c.nome,
                    subtitle: c.status === 'aguardando' ? 'Processo seletivo' : c.email,
                    type: 'candidato' as const,
                    href: `/candidatos/${c.id}`,
                    icon: UserCheck
                })) || []),
                ...(planos?.map(p => ({
                    id: p.id,
                    title: p.nome,
                    subtitle: `Plano ${p.tipo.toUpperCase()}`,
                    type: 'plano' as const,
                    href: `/configuracoes/planos`,
                    icon: FileText
                })) || [])
            ]

            setResults(formatted)
            setLoading(false)
        }, 400)

        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query])

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 text-sm text-gray-400 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors duration-200"
            >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Buscar...</span>
                <span className="hidden sm:inline bg-white px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm ml-2 border border-gray-200">⌘K</span>
            </button>
        )
    }

    const groups = results.reduce((acc, result) => {
        if (!acc[result.type]) acc[result.type] = []
        acc[result.type].push(result)
        return acc
    }, {} as Record<string, SearchResult[]>)

    const labels: Record<string, string> = {
        aluno: 'Alunos',
        candidato: 'Processo Seletivo',
        plano: 'Planos',
        contrato: 'Contratos',
    }

    return (
        <>
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" onClick={() => setOpen(false)} />
            <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-4 duration-200 flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
                    <Search className="h-5 w-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Busque alunos, candidatos, planos..."
                        className="flex-1 bg-transparent text-gray-900 text-lg outline-none placeholder:text-gray-300 font-medium"
                    />
                    {loading && <Loader2 className="h-5 w-5 text-[#CC0000] animate-spin" />}
                    <kbd className="hidden sm:inline-block bg-gray-100 text-gray-400 px-2 py-1 rounded text-xs font-bold font-mono">ESC</kbd>
                </div>

                <div className="overflow-y-auto p-2" style={{ maxHeight: 'calc(80vh - 70px)' }}>
                    {query.length > 0 && query.length < 2 && (
                        <p className="text-center text-sm text-gray-400 py-8">Digite pelo menos 2 caracteres...</p>
                    )}

                    {query.length >= 2 && !loading && results.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <Search className="h-8 w-8 mx-auto mb-3 text-gray-300 opacity-50" />
                            <p className="font-semibold text-gray-900">Nenhum resultado encontrado</p>
                            <p className="text-sm mt-1">Nenhum dado com &quot;{query}&quot; foi localizado.</p>
                        </div>
                    )}

                    {Object.entries(groups).map(([type, items]) => (
                        <div key={type} className="mb-4 last:mb-0">
                            <h3 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">{labels[type] || type}</h3>
                            {items.map(res => (
                                <button
                                    key={res.id}
                                    onClick={() => { setOpen(false); router.push(res.href) }}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-gray-100 text-[#CC0000] rounded-lg flex items-center justify-center group-hover:bg-red-50 group-hover:scale-110 transition-all shrink-0">
                                            <res.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-[#CC0000] transition-colors line-clamp-1">{res.title}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{res.subtitle}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:translate-x-1 group-hover:text-[#CC0000] transition-all" />
                                </button>
                            ))}
                        </div>
                    ))}

                    {!query && (
                        <div className="py-6 text-center">
                            <p className="text-sm text-gray-400 font-medium">Use ferramentas rápidas</p>
                            <div className="flex gap-2 justify-center mt-4">
                                <button onClick={() => { setOpen(false); router.push('/contratos/novo') }} className="px-4 py-2 bg-gray-50 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors">Novo Contrato</button>
                                <button onClick={() => { setOpen(false); router.push('/candidatos') }} className="px-4 py-2 bg-gray-50 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors">Candidatos</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
