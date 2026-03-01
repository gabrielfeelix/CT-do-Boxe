'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Video as VideoIcon, Layers, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function NovoVideoTrilhaPage() {
    const router = useRouter()
    const supabase = createClient()

    const [titulo, setTitulo] = useState('')
    const [descricao, setDescricao] = useState('')
    const [categoria, setCategoria] = useState('')
    const [novaCategoria, setNovaCategoria] = useState('')
    const [videoUrl, setVideoUrl] = useState('')
    const [ordem, setOrdem] = useState(0)
    const [salvando, setSalvando] = useState(false)
    const [dbCategorias, setDbCategorias] = useState<{ id: string, nome: string }[]>([])

    // Upload Supabase Storage
    const [uploadando, setUploadando] = useState(false)



    useEffect(() => {
        async function fetchCats() {
            const { data } = await supabase.from('trilhas_categorias').select('id, nome').eq('ativo', true).order('ordem', { ascending: true })
            if (data) setDbCategorias(data)
        }
        fetchCats()
    }, [])

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 200 * 1024 * 1024) {
            toast.error('Limite excedido: Vídeo deve ser menor que 200MB.')
            return
        }
        if (!file.type.startsWith('video/')) {
            toast.error('Falha de Tipo: O arquivo deve ser primariamente um vídeo (.mp4, .mov).')
            return
        }

        setUploadando(true)

        const ext = file.name.split('.').pop()
        const path = `trilhas/${Date.now()}.${ext}`

        const { error } = await supabase.storage
            .from('ct-boxe-media')
            .upload(path, file, { upsert: true })

        if (error) {
            toast.error('Erro de I/O de Storage no Supabase.')
            setUploadando(false)
            return
        }

        const { data: urlData } = supabase.storage.from('ct-boxe-media').getPublicUrl(path)
        setVideoUrl(urlData.publicUrl)
        setUploadando(false)
        toast.success('Vídeo pareado no servidor com sucesso!')
    }

    async function handleSalvar() {
        if (!videoUrl || !titulo.trim() || (!categoria && !novaCategoria.trim())) {
            toast.error('Preencha os dados obrigatórios: Título, Categoria e Vídeo.')
            return
        }

        setSalvando(true)
        let finalCatId = categoria

        // Se escolheu 'nova', cria a categoria primeiro
        if (categoria === 'nova') {
            const { data: newCat, error: errCat } = await supabase.from('trilhas_categorias').insert({
                nome: novaCategoria.trim(),
                ativo: true
            }).select('id').single()

            if (errCat || !newCat) {
                toast.error('Erro ao registrar nova categoria de módulo.')
                setSalvando(false)
                return
            }
            finalCatId = newCat.id
        }

        const { error } = await supabase.from('trilhas_videos').insert({
            titulo: titulo.trim(),
            descricao: descricao.trim() || null,
            categoria_id: finalCatId, // Relacao ForeignKey
            video_url: videoUrl,
            ordem: ordem,
            ativo: true,
        })

        if (error) {
            toast.error('Erro ao injetar vídeo na trilha.')
            setSalvando(false)
            return
        }

        toast.success('Vídeo arquivado na biblioteca para acesso dos alunos!')
        router.push('/stories')
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in slide-in-from-bottom-2 duration-500">

            <button onClick={() => router.back()} className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors w-fit">
                <div className="bg-white border border-gray-200 p-1.5 rounded-md group-hover:border-gray-300 transition-colors shadow-sm">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                Voltar à Trilha
            </button>

            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 mb-1">
                    <VideoIcon className="w-6 h-6 text-[#CC0000]" /> Novo Vídeo Explicativo
                </h2>
                <p className="text-sm font-bold text-gray-400 tracking-wide uppercase mt-1">
                    Adicione material permanente para a biblioteca técnica dos alunos.
                </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">

                {/* Left Panel */}
                <div className="p-6 sm:p-8 flex-1 space-y-6 bg-gray-50/30">
                    <div>
                        <label className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <FileText className="w-4 h-4 text-gray-400" /> Título e Descrição
                        </label>
                        <div className="space-y-4">
                            <input
                                value={titulo}
                                onChange={e => setTitulo(e.target.value)}
                                placeholder="Dê um título forte (ex: Como enrolar a bandagem 3m)"
                                className="w-full p-4 text-sm font-bold text-gray-900 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-all shadow-sm"
                            />
                            <textarea
                                value={descricao}
                                onChange={e => setDescricao(e.target.value)}
                                placeholder="Detalhes ou passos do vídeo (opcional)"
                                rows={4}
                                className="w-full p-4 text-sm font-medium text-gray-600 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-all shadow-sm resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <label className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <Layers className="w-4 h-4 text-gray-400" /> Categoria / Módulo
                        </label>
                        <select
                            value={categoria}
                            onChange={e => setCategoria(e.target.value)}
                            className="w-full p-4 text-sm font-bold text-gray-900 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-all shadow-sm appearance-none mb-3"
                        >
                            <option value="">Selecione um Módulo</option>
                            {dbCategorias.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nome}</option>
                            ))}
                            <option value="nova">+ Criar Novo Módulo</option>
                        </select>

                        {categoria === 'nova' && (
                            <input
                                value={novaCategoria}
                                onChange={e => setNovaCategoria(e.target.value)}
                                placeholder="Nome do novo Módulo"
                                className="w-full p-4 text-sm font-bold text-gray-900 border border-[#CC0000] bg-red-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] transition-all shadow-sm"
                            />
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="p-6 sm:p-8 flex-1 space-y-6 relative flex flex-col justify-between">
                    <div>
                        <label className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <Upload className="w-4 h-4 text-gray-400" /> Motor de Upload de Vídeo
                        </label>

                        {!videoUrl ? (
                            <label className="flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#CC0000] hover:bg-red-50/50 transition-all bg-gray-50 group">
                                {uploadando ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#CC0000]" />
                                        <span className="text-xs font-black text-[#CC0000] uppercase tracking-widest">Compilando Vídeo...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-center p-6">
                                        <div className="p-4 bg-white rounded-full border border-gray-100 shadow-sm group-hover:bg-[#CC0000] group-hover:text-white group-hover:border-[#CC0000] transition-colors text-gray-400">
                                            <Upload className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black text-gray-900">Selecionar arquivo de vídeo</span>
                                            <span className="block text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">MP4 ou MOV • Landscape(Deitado) Preferível</span>
                                        </div>
                                    </div>
                                )}
                                <input type="file" accept="video/mp4,video/quicktime" className="hidden" onChange={handleUpload} disabled={uploadando} />
                            </label>
                        ) : (
                            <div className="aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-lg relative border border-gray-200 group">
                                <video src={videoUrl} controls className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                                <button
                                    onClick={() => setVideoUrl('')}
                                    className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded shadow-sm hover:bg-red-500 transition-colors z-20"
                                >
                                    Remover
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={handleSalvar}
                            disabled={salvando || uploadando || !videoUrl || !titulo}
                            className="w-full py-4 text-sm font-black text-white uppercase tracking-widest bg-gray-900 hover:bg-black disabled:opacity-50 disabled:bg-gray-800 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {salvando ? <LoadingSpinner size="sm" /> : 'Arquivar Publicamente'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
