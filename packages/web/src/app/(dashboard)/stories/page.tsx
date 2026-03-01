'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Video, FolderOpen, PlaySquare, Trash2, Library, Plus } from 'lucide-react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type TrilhaCategoria = {
    id: string
    nome: string
    ordem: number
}

type TrilhaVideo = {
    id: string
    titulo: string
    descricao: string
    categoria_id: string
    video_url: string
    ordem: number
    created_at: string
}

export default function TrilhasPage() {
    const [categorias, setCategorias] = useState<TrilhaCategoria[]>([])
    const [videos, setVideos] = useState<TrilhaVideo[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const [excluindo, setExcluindo] = useState<string | null>(null)
    const [excluindoCat, setExcluindoCat] = useState<string | null>(null)

    async function fetchData() {
        setLoading(true)
        const [resCat, resVid] = await Promise.all([
            supabase.from('trilhas_categorias').select('*').eq('ativo', true).order('ordem', { ascending: true }).order('created_at', { ascending: true }),
            supabase.from('trilhas_videos').select('*').eq('ativo', true).order('ordem', { ascending: true }).order('created_at', { ascending: false })
        ])

        if (!resCat.error) setCategorias(resCat.data as TrilhaCategoria[])
        if (!resVid.error) setVideos(resVid.data as TrilhaVideo[])
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    async function excluirCategoria(id: string) {
        if (!confirm('Excluir permanentemente MÓDULO e TODOS os vídeos contidos nele?')) return
        setExcluindoCat(id)

        // Exclusão lógica da categoria e dos videos vinculados (por id)
        await supabase.from('trilhas_categorias').update({ ativo: false }).eq('id', id)
        await supabase.from('trilhas_videos').update({ ativo: false }).eq('categoria_id', id)

        toast.success('Módulo arquivado com sucesso.')
        fetchData()
        setExcluindoCat(null)
    }

    async function excluirVideo(id: string) {
        if (!confirm('Excluir permanentemente este vídeo da trilha? (Apenas invisível)')) return
        setExcluindo(id)
        const { error } = await supabase.from('trilhas_videos').update({ ativo: false }).eq('id', id)
        if (error) {
            toast.error('Falha ao excluir o vídeo.')
        } else {
            toast.success('Vídeo arquivado da biblioteca.')
            fetchData()
        }
        setExcluindo(null)
    }

    // Agrupamento manual com base nas categorias
    const categoriasMapa = categorias.reduce((acc, cat) => {
        acc[cat.id] = { nome: cat.nome, vids: [] as TrilhaVideo[] }
        return acc
    }, {} as Record<string, { nome: string, vids: TrilhaVideo[] }>)

    // Alocar os vídeos em suas categorias_id
    videos.forEach(video => {
        if (video.categoria_id && categoriasMapa[video.categoria_id]) {
            categoriasMapa[video.categoria_id].vids.push(video)
        }
    })

    const listCat = Object.entries(categoriasMapa).map(([id, payload]) => ({ id, ...payload }))

    return (
        <div className="space-y-8 max-w-[1440px] mx-auto pb-8 animate-in slide-in-from-bottom-2 duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Library className="w-6 h-6 text-[#CC0000]" /> Biblioteca de Vídeos
                    </h2>
                    <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">
                        {loading ? 'Sincronizando...' : `${videos.length} videos em ${categorias.length} Módulos`}
                    </p>
                </div>
                <Link
                    href="/stories/novo"
                    className="bg-gray-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <Plus className="h-4 w-4" /> Adicionar Vídeo
                </Link>
            </div>

            {loading ? <LoadingSpinner label="Buscando currículo..." /> :
                categorias.length === 0 ? (
                    <EmptyState
                        icon={Video}
                        title="Acervo de Aulas Vazio"
                        description="Você não possui nenhum vídeo explicativo ou trilha subida."
                        action={{ label: 'Novo Módulo / Vídeo', onClick: () => window.location.href = '/stories/novo' }}
                    />
                ) : (
                    <div className="space-y-12">
                        {listCat.map((cat) => (
                            <section key={cat.id} className="space-y-5">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-lg bg-gray-100 text-gray-500 hidden sm:block">
                                            <FolderOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 tracking-tight">{cat.nome}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">{cat.vids.length} Aulas neste módulo</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.preventDefault(); excluirCategoria(cat.id) }}
                                        disabled={excluindoCat === cat.id}
                                        className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors shrink-0"
                                    >
                                        {excluindoCat === cat.id ? 'Arquivando...' : 'Remover Módulo'}
                                    </button>
                                </div>

                                {cat.vids.length === 0 ? (
                                    <div className="p-6 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nenhum vídeo neste módulo.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {cat.vids.map(video => (
                                            <div key={video.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden transition-all duration-300 group flex flex-col">

                                                {/* Preview de Media */}
                                                <div className="aspect-video bg-gray-900 relative overflow-hidden shrink-0">
                                                    {/* Pode ser Video Tag the real */}
                                                    <video
                                                        src={video.video_url}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                        controls={false}
                                                        preload="metadata"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                                                        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full text-gray-900 shadow-xl">
                                                            <PlaySquare className="w-6 h-6 fill-gray-900" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="p-5 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-black text-gray-900 line-clamp-2 leading-snug">{video.titulo}</h4>
                                                        {video.descricao && (
                                                            <p className="text-xs font-medium text-gray-500 mt-2 line-clamp-2 leading-relaxed">{video.descricao}</p>
                                                        )}
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            {new Date(video.created_at).toLocaleDateString('pt-BR')}
                                                        </span>
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); excluirVideo(video.id) }}
                                                            disabled={excluindo === video.id}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Remover vídeo"
                                                        >
                                                            {excluindo === video.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                )
            }
        </div>
    )
}
