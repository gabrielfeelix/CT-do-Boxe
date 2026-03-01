'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PenSquare, Heart, MessageCircle, Trash2, EyeOff, LayoutTemplate } from 'lucide-react'
import { useFeed } from '@/hooks/useFeed'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

function tempoRelativo(data: string): string {
    const diff = Date.now() - new Date(data).getTime()
    const min = Math.floor(diff / 60000)
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(diff / 86400000)
    if (min < 60) return `${min}min atrás`
    if (h < 24) return `${h} h atrás`
    return `${d}d atrás`
}

export default function FeedPage() {
    const { posts, loading, refetch } = useFeed()
    const supabase = createClient()
    const [excluindo, setExcluindo] = useState<string | null>(null)

    async function excluirPost(id: string, conteudo: string) {
        const preview = conteudo.slice(0, 40) + (conteudo.length > 40 ? '...' : '')
        if (!confirm(`Tem certeza que deseja excluir esta publicação?\n\n"${preview}"`)) return

        setExcluindo(id)
        const { error } = await supabase.from('posts').delete().eq('id', id)
        if (error) toast.error('Falha de sincronia ao excluir.')
        else { toast.success('Publicação excluída com sucesso.'); refetch() }
        setExcluindo(null)
    }

    async function togglePublicado(id: string, publicadoAtual: boolean) {
        const { error } = await supabase.from('posts').update({ publicado: !publicadoAtual }).eq('id', id)
        if (error) toast.error('Erro de I/O na Engine Supabase.')
        else {
            toast.success(publicadoAtual ? 'Publicação removida do app' : 'Publicação disponibilizada no app')
            refetch()
        }
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12 animate-in slide-in-from-bottom-2 duration-500">

            {/* Premium Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <LayoutTemplate className="w-6 h-6 text-[#CC0000]" /> Mural do CT
                    </h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {loading ? 'Carregando publicações...' : `${posts.length} comunicado${posts.length !== 1 ? 's' : ''} indexado${posts.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <Link
                    href="/feed/novo"
                    className="bg-gray-900 hover:bg-black text-white text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 max-w-fit"
                >
                    <PenSquare className="h-4 w-4" /> Publicar Comunicado
                </Link>
            </div>

            {loading ? <LoadingSpinner label="Puxando fios da linha do tempo..." /> :
                posts.length === 0 ? (
                    <EmptyState
                        icon={PenSquare}
                        title="Sua Linha do Tempo está Vazia"
                        description="Compartilhe com seus alunos! Lance o primeiro comunicado e traga vida ao app."
                        action={{ label: 'Criar Minha Primeira Postagem', onClick: () => window.location.href = '/feed/novo' }}
                    />
                ) : (
                    <div className="space-y-6">
                        {posts.map(post => (
                            <div
                                key={post.id}
                                className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 relative ${!post.publicado ? 'bg-gray-50/50 border-dashed opacity-80' : 'hover:shadow'}`}
                            >
                                {!post.publicado && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#CC0000] bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg flex items-center shadow-sm backdrop-blur-sm gap-1.5">
                                            <EyeOff className="h-3 w-3" /> Arquivado
                                        </span>
                                    </div>
                                )}

                                {post.imagem_url && (
                                    <div className="w-full aspect-video sm:aspect-[21/9] relative overflow-hidden bg-gray-100 group">
                                        <img src={post.imagem_url} alt="Feed media" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                )}

                                <div className="p-6 sm:p-8">
                                    {/* Header do post */}
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white text-sm font-black shadow-inner shrink-0 relative">
                                            AR
                                            {post.publicado && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                                        </div>
                                        <div>
                                            <p className="text-sm sm:text-base font-black text-gray-900 tracking-tight leading-none mb-1">{post.autor}</p>
                                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">{tempoRelativo(post.created_at)}</p>
                                        </div>
                                    </div>

                                    {/* Conteúdo */}
                                    <p className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{post.conteudo}</p>

                                    {/* Stats + Ações Reais */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 pt-5 border-t border-gray-100 gap-4">

                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2 group cursor-default">
                                                <div className="p-2 bg-gray-50 rounded-full group-hover:bg-red-50 transition-colors border border-gray-100">
                                                    <Heart className={`h-4 w-4 ${post.total_curtidas > 0 ? 'text-[#CC0000] fill-[#CC0000]' : 'text-gray-400'}`} />
                                                </div>
                                                <span className="text-xs font-black text-gray-600">{post.total_curtidas} <span className="hidden sm:inline-block text-gray-400 font-bold ml-1">Curtidas</span></span>
                                            </div>
                                            <div className="flex items-center gap-2 group cursor-default">
                                                <div className="p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 transition-colors border border-gray-100">
                                                    <MessageCircle className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                </div>
                                                <span className="text-xs font-black text-gray-600">{post.total_comentarios} <span className="hidden sm:inline-block text-gray-400 font-bold ml-1">Interações</span></span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 justify-between sm:justify-end">
                                            <button
                                                onClick={() => togglePublicado(post.id, post.publicado)}
                                                className={`text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border transition-all flex-1 sm:flex-none text-center ${post.publicado ? 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 shadow-sm' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 shadow-sm'}`}
                                            >
                                                {post.publicado ? 'Arquivar' : 'Re-publicar'}
                                            </button>
                                            <button
                                                onClick={() => excluirPost(post.id, post.conteudo)}
                                                disabled={excluindo === post.id}
                                                className="p-2.5 bg-gray-50 text-gray-400 border border-gray-100 hover:text-[#CC0000] hover:bg-red-50 hover:border-red-100 rounded-xl transition-all shadow-sm flex-shrink-0"
                                                title="Apagar Matriz"
                                            >
                                                {excluindo === post.id ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        </div>
    )
}
