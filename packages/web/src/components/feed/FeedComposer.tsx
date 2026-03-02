'use client'

import { useState, useRef } from 'react'
import { Image as ImageIcon, Send, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface FeedComposerProps {
    onSuccess: () => void
    professorAtual: {
        nome: string
        cor_perfil: string
    } | null
}

export function FeedComposer({ onSuccess, professorAtual }: FeedComposerProps) {
    const [conteudo, setConteudo] = useState('')
    const [imagem, setImagem] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [enviando, setEnviando] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const iniciais = professorAtual?.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? 'CT'

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Imagem muito grande (máx 5MB)')
                return
            }
            setImagem(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    async function handleEnviar() {
        if (!conteudo.trim() && !imagem) return
        if (!professorAtual) {
            toast.error('Perfil de professor não identificado.')
            return
        }

        setEnviando(true)
        try {
            let imagem_url = ''

            if (imagem) {
                const fileExt = imagem.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `feed/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('feed')
                    .upload(filePath, imagem)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('feed')
                    .getPublicUrl(filePath)

                imagem_url = publicUrl
            }

            const { error } = await supabase.from('posts').insert({
                conteudo,
                imagem_url,
                autor: professorAtual.nome,
                publicado: true,
                total_curtidas: 0,
                total_comentarios: 0
            })

            if (error) throw error

            toast.success('Publicado no feed!')
            setConteudo('')
            setImagem(null)
            setPreviewUrl(null)
            onSuccess()
        } catch (err: any) {
            console.error(err)
            toast.error('Falha ao publicar.')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex gap-4">
                <div
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-md shrink-0"
                    style={{ background: professorAtual?.cor_perfil ?? '#CC0000' }}
                >
                    {iniciais}
                </div>
                <div className="flex-1">
                    <textarea
                        value={conteudo}
                        onChange={(e) => setConteudo(e.target.value)}
                        placeholder={`O que está acontecendo no CT, ${professorAtual?.nome.split(' ')[0]}?`}
                        className="w-full min-h-[100px] bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#CC0000]/10 transition-all resize-none text-gray-900 placeholder:text-gray-400"
                    />

                    {previewUrl && (
                        <div className="mt-4 relative inline-block group">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-h-60 rounded-2xl border border-gray-100 shadow-sm"
                            />
                            <button
                                onClick={() => { setImagem(null); setPreviewUrl(null); }}
                                className="absolute top-2 right-2 p-1.5 bg-gray-900/80 text-white rounded-full hover:bg-black transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all text-sm font-bold"
                        >
                            <ImageIcon className="h-5 w-5 text-emerald-500" />
                            Foto/Vídeo
                        </button>

                        <button
                            disabled={enviando || (!conteudo.trim() && !imagem)}
                            onClick={handleEnviar}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-sm ${enviando || (!conteudo.trim() && !imagem)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-[#CC0000] text-white hover:bg-[#AA0000] shadow-[#CC0000]/20 hover:shadow-lg'
                                }`}
                        >
                            {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Publicar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
