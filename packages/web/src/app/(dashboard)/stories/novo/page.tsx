'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, ShieldAlert, MonitorSmartphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NovoStoryPage() {
    const router = useRouter()
    const supabase = createClient()

    const [legenda, setLegenda] = useState('')
    const [imagemUrl, setImagemUrl] = useState('')
    const [duracaoHoras, setDuracaoHoras] = useState('24')
    const [salvando, setSalvando] = useState(false)

    // Upload Supabase Storage
    const [uploadando, setUploadando] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 10 * 1024 * 1024) { toast.error('Limite excedido: Foto/Arte deve ter pesagem menor que 10MB.'); return }
        if (!file.type.startsWith('image/')) { toast.error('Falha de Tipo: O arquivo deve ser primariamente imagem.'); return }

        setUploadando(true)

        const ext = file.name.split('.').pop()
        const path = `stories/${Date.now()}.${ext}`

        const { error } = await supabase.storage
            .from('ct-boxe-media')
            .upload(path, file, { upsert: true })

        if (error) {
            toast.error('Erro de I/O de Storage no Supabase. Cheque se a política ct-boxe-media não quebrou.')
            setUploadando(false)
            return
        }

        const { data: urlData } = supabase.storage.from('ct-boxe-media').getPublicUrl(path)
        setImagemUrl(urlData.publicUrl)
        setPreviewUrl(urlData.publicUrl)
        setUploadando(false)
        toast.success('Assets decodificados com sucesso pro Storage!')
    }

    async function handlePublicar() {
        if (!imagemUrl && !legenda.trim()) {
            toast.error('Operação Inocua: Arte (imagem) ou conteúdo em texto vazios.')
            return
        }

        setSalvando(true)

        const expiraEm = new Date()
        expiraEm.setHours(expiraEm.getHours() + parseInt(duracaoHoras))

        const { error } = await supabase.from('stories').insert({
            imagem_url: imagemUrl || null,
            legenda: legenda.trim() || null,
            autor: 'Argel Riboli',
            expira_em: expiraEm.toISOString(),
            ativo: true,
        })

        if (error) {
            toast.error('Erro ao compilar o banco de Stories.')
            setSalvando(false)
            return
        }

        toast.success('Engine engatilhada: O Story está caindo em D-0 para os atletas!')
        router.push('/stories')
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in slide-in-from-bottom-2 duration-500">

            <button onClick={() => router.back()} className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors w-fit">
                <div className="bg-white border border-gray-200 p-1.5 rounded-md group-hover:border-gray-300 transition-colors shadow-sm">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                Radar de Stories
            </button>

            <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 mb-1">
                    <MonitorSmartphone className="w-6 h-6 text-[#CC0000]" /> Studio de Gravação / Arte
                </h2>
                <p className="text-sm font-bold text-gray-400 tracking-wide uppercase">Crie seu outdoor orgânico na palma da mão do seu aluno.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Lado Esquerdo - Controles */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6 self-start relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-gray-200 to-gray-400" />

                    {/* Upload Engine */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert className="w-3.5 h-3.5" /> Midia Principal
                        </label>

                        {!previewUrl && (
                            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#CC0000] hover:bg-red-50/50 transition-all bg-gray-50/50 group">
                                {uploadando ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#CC0000]" />
                                        <span className="text-xs font-black text-[#CC0000] uppercase tracking-widest">Enviando Blocos...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-center">
                                        <div className="p-3 bg-white rounded-full border border-gray-100 shadow-sm group-hover:bg-[#CC0000] group-hover:text-white group-hover:border-[#CC0000] transition-colors text-gray-400">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black text-gray-900">Arraste a Arte ou Tire Foto</span>
                                            <span className="block text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">JPG, PNG, WebP · Máscara Vertical Preferível</span>
                                        </div>
                                    </div>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploadando} />
                            </label>
                        )}
                        {previewUrl && (
                            <div className="flex justify-between items-center bg-gray-50 border border-gray-200 p-3 rounded-xl">
                                <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Mídia Alocada no Cache</span>
                                <button onClick={() => { setPreviewUrl(null); setImagemUrl('') }} className="text-[10px] font-black uppercase text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md border border-red-200 transition-colors">Destruir / Refazer</button>
                            </div>
                        )}
                    </div>

                    {/* Legenda */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between items-end">
                            Sobreposição de Texto
                            <span className={`text-[10px] font-bold ${legenda.length > 130 ? 'text-red-500' : 'text-gray-300'}`}>{legenda.length}/150 char</span>
                        </label>
                        <textarea
                            value={legenda}
                            onChange={e => setLegenda(e.target.value)}
                            placeholder="Exemplo para engajar a glória: Quem veio, treinou pra frente! 🥊🔥"
                            rows={3}
                            maxLength={150}
                            className="w-full p-4 text-sm font-medium border border-gray-200 bg-gray-50/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-all focus:bg-white"
                        />
                    </div>

                    {/* Timers */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Timer de Exibição Pública (TTL)</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { value: '6', label: '6h' },
                                { value: '12', label: '12h' },
                                { value: '24', label: '24H MAX' },
                                { value: '48', label: '48h EXT' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setDuracaoHoras(opt.value)}
                                    className={`
                      py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all cursor-pointer
                      ${duracaoHoras === opt.value
                                            ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                                            : 'border-gray-100 text-gray-400 bg-gray-50 hover:bg-gray-100'}
                    `}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Lado Direito - Mockup Device Premium */}
                <div className="flex flex-col items-center justify-start sticky top-8">
                    <div className="w-full flex justify-between items-end mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#CC0000] bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" /> Live Preview
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Escala Original 9:16</span>
                    </div>

                    <div className="w-[320px] sm:w-[350px] aspect-[9/16] bg-black rounded-[40px] border-[8px] border-gray-900 shadow-2xl relative overflow-hidden ring-1 ring-gray-900/10">
                        {/* O entalhe / island do celular fake */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-30" />

                        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center px-2">
                            <div className="flex gap-1.5">
                                <div className="w-8 h-1 bg-white/40 rounded-full shrink-0" />
                                <div className="w-8 h-1 bg-white/40 rounded-full shrink-0" />
                            </div>
                            <span className="text-[10px] font-black text-white/50 tracking-widest drop-shadow-md">X</span>
                        </div>

                        <div className="w-full h-full bg-gray-800 relative">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview arte" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-700">
                                    <MonitorSmartphone className="h-12 w-12 mb-2 opacity-50" />
                                    <p className="text-xs font-black uppercase tracking-widest opacity-30">Tela Cega</p>
                                </div>
                            )}

                            {/* Overlay do Gradient Sempre (Para texto não sumir) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

                            {legenda && (
                                <div className="absolute bottom-16 left-6 right-6 z-20 pointer-events-none">
                                    <p className="text-white text-sm sm:text-base font-semibold drop-shadow-lg leading-snug">
                                        {legenda}
                                    </p>
                                </div>
                            )}

                            {/* Footer Fake do Celular (Interação Usuario) */}
                            <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center gap-3">
                                <div className="flex-1 h-10 border border-white/20 bg-white/10 backdrop-blur-md rounded-full px-4 flex items-center text-[10px] text-white/40 font-black uppercase tracking-widest">
                                    Reagir (Fake)...
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-[320px] sm:w-[350px] mt-6 flex gap-3">
                        <button onClick={() => router.back()} className="flex-1 py-3.5 text-xs font-black text-gray-500 uppercase tracking-widest bg-white border border-gray-200 hover:border-gray-300 hover:text-gray-800 rounded-xl transition-all">
                            Cancelar
                        </button>
                        <button
                            onClick={handlePublicar}
                            disabled={salvando || uploadando || (!imagemUrl && !legenda.trim())}
                            className="flex-[2] py-3.5 text-sm font-black text-white uppercase tracking-widest bg-gray-900 hover:bg-black disabled:opacity-50 disabled:bg-gray-800 rounded-xl transition-all shadow-md active:scale-[0.98]"
                        >
                            {salvando ? 'Salvando...' : 'Carregar na Nuvem'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
