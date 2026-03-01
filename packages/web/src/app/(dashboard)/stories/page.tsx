'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ImagePlus, Eye, Trash2, Clock, PlaySquare } from 'lucide-react'
import { useStories } from '@/hooks/useFeed'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

function formatarExpiracao(expiraEm: string): string {
    const diff = new Date(expiraEm).getTime() - Date.now()
    const horas = Math.floor(diff / 3600000)
    const min = Math.floor((diff % 3600000) / 60000)
    if (horas > 0) return `${horas}h${min > 0 ? ` ${min}m` : ''}`
    return `${min}m`
}

export default function StoriesPage() {
    const { stories, loading, refetch } = useStories()
    const supabase = createClient()
    const [excluindo, setExcluindo] = useState<string | null>(null)

    async function excluirStory(id: string) {
        if (!confirm('Deseja abater este story da nuvem? Ele desaparecerá na hora.')) return
        setExcluindo(id)
        const { error } = await supabase.from('stories').update({ ativo: false }).eq('id', id)
        if (error) toast.error('Ops. Quedas no DB não deixaram excluir.')
        else { toast.success('Míssil de exclusão enviado. Story abatido!'); refetch() }
        setExcluindo(null)
    }

    return (
        <div className="space-y-6 max-w-[1440px] mx-auto pb-8 animate-in slide-in-from-bottom-2 duration-500">

            {/* Premium Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <PlaySquare className="w-6 h-6 text-[#CC0000]" /> Stories Ativos
                    </h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {loading ? 'Calculando ciclo de vida...' : `Painel de controle rotativo • ${stories.length} no ar`}
                    </p>
                </div>
                <Link
                    href="/stories/novo"
                    className="bg-[#CC0000] hover:bg-[#AA0000] text-white text-sm font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 max-w-fit"
                >
                    <ImagePlus className="h-4 w-4" /> Subir Novidade
                </Link>
            </div>

            {/* Info Card Estilizado */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 border border-blue-200/60 rounded-2xl p-5 shadow-sm flex items-start sm:items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 blur-[80px] opacity-20 pointer-events-none" />
                <div className="bg-blue-100 p-2.5 rounded-full shrink-0 relative z-10 hidden sm:block">
                    <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="relative z-10">
                    <h4 className="text-sm font-black text-blue-900 tracking-tight flex items-center gap-1.5 uppercase">
                        <span className="block sm:hidden"><Clock className="w-4 h-4" /></span> Motor Efêmero
                    </h4>
                    <p className="text-xs font-bold text-blue-800/80 mt-1 leading-relaxed">
                        Stories rodam autonomamente. Após expirarem o seu timer configurado de 24h, o sistema limpa a tela dos seus alunos.
                    </p>
                </div>
            </div>

            {loading ? <LoadingSpinner label="Carregando stories..." /> :
                stories.length === 0 ? (
                    <EmptyState
                        icon={ImagePlus}
                        title="Sua vitrine de stories está nua"
                        description="Use isso para avisos hyper-focados e visuais, como fotos do treino anterior."
                        action={{ label: 'Engatilhar Upload', onClick: () => window.location.href = '/stories/novo' }}
                    />
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                        {stories.map(story => (
                            <div key={story.id} className="bg-white rounded-[24px] border-[5px] border-white shadow-md hover:shadow-xl hover:-translate-y-1 overflow-hidden transition-all duration-300 group relative">

                                {/* Timer Badge Global */}
                                <div className="absolute top-2 right-2 z-20">
                                    <div className="bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#CC0000] border border-white/10 flex items-center gap-1 shadow-lg">
                                        <Clock className="w-3 h-3" /> {formatarExpiracao(story.expira_em)}
                                    </div>
                                </div>

                                {/* Media Container Aspecto Tiktak/Reels 9:16 */}
                                <div className="aspect-[9/16] bg-gray-900 relative overflow-hidden rounded-[16px]">
                                    {story.imagem_url ? (
                                        <img src={story.imagem_url} alt="Story render" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-800 bg-gray-950">
                                            <ImagePlus className="h-10 w-10 opacity-50" />
                                        </div>
                                    )}

                                    {/* Gradient Overlay for Legibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-black/30 opacity-80" />

                                    {/* Top Bar Views */}
                                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 text-white/90 text-xs font-bold bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm border border-white/5">
                                        <Eye className="h-3.5 w-3.5" /> {story.total_visualizacoes}
                                    </div>

                                    {/* Legenda Content */}
                                    {story.legenda && (
                                        <div className="absolute bottom-12 left-0 right-0 p-4 z-10 pointer-events-none">
                                            <p className="text-white text-xs sm:text-sm font-medium line-clamp-3 leading-snug drop-shadow-md pb-2">{story.legenda}</p>
                                        </div>
                                    )}

                                    {/* Actions Bar On Hover (or always bottom mobile) */}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
                                        <button
                                            onClick={(e) => { e.preventDefault(); excluirStory(story.id) }}
                                            disabled={excluindo === story.id}
                                            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-black uppercase tracking-widest text-white bg-red-600/90 hover:bg-red-500 backdrop-blur-md rounded-xl transition-colors pointer-events-auto border border-white/20 shadow-lg"
                                        >
                                            {excluindo === story.id ? '💣...' : <><Trash2 className="h-3.5 w-3.5" /> Forcar Queda</>}
                                        </button>
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
