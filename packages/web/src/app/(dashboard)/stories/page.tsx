'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Video, FolderOpen, PlaySquare, Trash2, Library, Plus } from 'lucide-react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type TrilhaVideo = {
    id: string
    titulo: string
    descricao: string
    categoria: string
    video_url: string
    ordem: number
    created_at: string
}

export default function TrilhasPage() {
    const [videos, setVideos] = useState<TrilhaVideo[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const [excluindo, setExcluindo] = useState<string | null>(null)

    async function fetchVideos() {
        setLoading(true)
        const { data, error } = await supabase
            .from('trilhas_videos')
            .select('*')
            .eq('ativo', true)
            .order('ordem', { ascending: true })
            .order('created_at', { ascending: false })

        if (!error && data) {
            setVideos(data as TrilhaVideo[])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchVideos()
    }, [])

    async function excluirVideo(id: string) {
        if (!confirm('Excluir permanentemente este vídeo da trilha? (Apenas invisível)')) return
        setExcluindo(id)
        const { error } = await supabase.from('trilhas_videos').update({ ativo: false }).eq('id', id)
        if (error) {
            toast.error('Falha ao excluir o vídeo.')
        } else {
            toast.success('Vídeo arquivado da biblioteca.')
            fetchVideos()
        }
        setExcluindo(null)
    }

    // Agrupamento
    const categoriasMapa = videos.reduce((acc, video) => {
        if (!acc[video.categoria]) acc[video.categoria] = []
        acc[video.categoria].push(video)
        return acc
    }, {} as Record<string, TrilhaVideo[]>)

    // Sort logic (if order maps exist, etc)
    const categorias = Object.entries(categoriasMapa)

    return (
        <div className="space-y-8 max-w-[1440px] mx-auto pb-8 animate-in slide-in-from-bottom-2 duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Library className="w-6 h-6 text-[#CC0000]" /> Biblioteca de Vídeos
                    </h2>
                    <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">
                        {loading ? 'Sincronizando...' : `${videos.length} videos em ${categorias.length} Trilhas`}
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
                videos.length === 0 ? (
                    <EmptyState
                        icon={Video}
                        title="Acervo de Aulas Vazio"
                        description="Você não possui nenhum vídeo explicativo ou trilha subida."
                        action={{ label: 'Novo Vídeo Explicativo', onClick: () => window.location.href = '/stories/novo' }}
                    />
                ) : (
                    <div className="space-y-12">
                        {categorias.map(([catName, vids]) => (
                            <section key={catName} className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-gray-100 text-gray-500 hidden sm:block">
                                        <FolderOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight">{catName}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">{vids.length} Aulas cadastradas</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {vids.map(video => (
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
                            </section>
                        ))}
                    </div>
                )
            }
        </div>
    )
}
