'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, PenSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NovoPostPage() {
    const router = useRouter()
    const supabase = createClient()

    const [conteudo, setConteudo] = useState('')
    const [imagemUrl, setImagemUrl] = useState('')
    const [preview, setPreview] = useState(false)
    const [salvando, setSalvando] = useState(false)

    const limite = 2000
    const restantes = limite - conteudo.length

    async function handlePublicar() {
        if (!conteudo.trim()) { toast.error('O texto do comunicado está vazio.'); return }
        if (conteudo.length > limite) { toast.error(`Limite de caracteres excedido (${limite} máx)`); return }

        setSalvando(true)

        const { error } = await supabase.from('posts').insert({
            conteudo: conteudo.trim(),
            imagem_url: imagemUrl.trim() || null,
            autor: 'Argel Riboli',
            publicado: true,
        })

        if (error) {
            toast.error('Falha na ponte com Supabase. Tente novamente.')
            setSalvando(false)
            return
        }

        toast.success('Comunicado publicado com sucesso!')
        router.push('/feed')
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in slide-in-from-bottom-2 duration-500">
            <button onClick={() => router.back()} className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors w-fit">
                <div className="bg-white border border-gray-200 p-1.5 rounded-md group-hover:border-gray-300 transition-colors shadow-sm">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                ← Feed
            </button>

            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 mb-1">
                    <PenSquare className="w-6 h-6 text-[#CC0000]" /> Novo comunicado
                </h2>
                <p className="text-sm font-bold text-gray-400 tracking-wide uppercase">Publique novidades para a comunidade do CT.</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-800 to-[#CC0000]" />

                <div className="p-6 sm:p-8 space-y-5">
                    {/* Header / Autor Mock */}
                    <div className="flex items-center gap-4 pb-5 border-b border-gray-50">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white text-sm font-black shadow-inner">
                            AR
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Argel Riboli</p>
                            <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Professor do CT</p>
                        </div>
                    </div>

                    {/* Editor Canvas */}
                    <div className="rounded-2xl border border-gray-200 bg-gray-50/50 overflow-hidden relative focus-within:ring-2 focus-within:ring-[#CC0000]/20 focus-within:border-[#CC0000] focus-within:bg-white transition-all space-y-2 pb-0">
                        {preview ? (
                            <div className="bg-white pb-6 rounded-b-2xl">
                                {imagemUrl && (
                                    <div className="w-full aspect-video sm:aspect-[21/9] relative overflow-hidden bg-gray-100 mb-6">
                                        <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="min-h-[150px] px-6 text-sm sm:text-base text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">
                                    {conteudo || <span className="text-gray-400 italic font-bold">A tela está em branco...</span>}
                                </div>
                            </div>
                        ) : (
                            <>
                                <textarea
                                    value={conteudo}
                                    onChange={e => setConteudo(e.target.value)}
                                    placeholder="Mande sua mensagem! Pode ser um aviso de falta, um evento no fds, ou até uma promo relâmpago 🥊..."
                                    rows={8}
                                    className="w-full px-6 pt-6 pb-2 text-sm sm:text-base text-gray-800 placeholder:text-gray-400 resize-none bg-transparent focus:outline-none leading-relaxed font-medium"
                                    autoFocus
                                />
                                <div className="px-6 pb-4">
                                    <input
                                        type="url"
                                        placeholder="Passe uma URL de imagem (Opcional)"
                                        value={imagemUrl}
                                        onChange={e => setImagemUrl(e.target.value)}
                                        className="w-full text-xs font-bold text-gray-600 bg-gray-100/80 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000] transition-all"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Metrics & Preview Switch */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border flex items-center gap-2 w-fit ${restantes < 50 ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                            <span className="relative flex h-2 w-2">
                                {restantes < 50 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${restantes < 50 ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                            </span>
                            {restantes} Unidades
                        </span>

                        <button
                            onClick={() => setPreview(p => !p)}
                            className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl transition-colors shadow-sm w-full sm:w-auto"
                        >
                            <Eye className="h-4 w-4" />
                            {preview ? 'Voltar Edição' : 'Testar Visualização'}
                        </button>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="bg-gray-50/80 p-6 sm:px-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => router.back()}
                        className="flex-1 py-3.5 text-xs font-black text-gray-500 uppercase tracking-widest bg-white border border-gray-200 hover:border-gray-300 hover:text-gray-800 hover:shadow-sm rounded-xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handlePublicar}
                        disabled={salvando || !conteudo.trim()}
                        className="flex-[2] py-3.5 text-sm font-black text-white uppercase tracking-widest bg-[#CC0000] hover:bg-[#AA0000] border-[#AA0000] disabled:opacity-50 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        {salvando ? 'Publicando...' : 'Publicar comunicado'}
                    </button>
                </div>
            </div>
        </div>
    )
}
