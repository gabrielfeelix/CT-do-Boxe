'use client'

import { useState } from 'react'
import { Plus, Pencil, ToggleLeft, ToggleRight, Settings2 } from 'lucide-react'
import { usePlanos } from '@/hooks/useContratos'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { PlanoCompleto, TipoPlano } from '@/types'

const TIPO_LABELS: Record<TipoPlano, string> = {
    mensal: 'Mensal',
    trimestral: 'Trimestral',
    semestral: 'Semestral',
    anual: 'Anual',
}

const EMPTY_FORM = { nome: '', tipo: 'mensal' as TipoPlano, valor: '', descricao: '' }

export default function PlanosPage() {
    const { planos, loading, refetch } = usePlanos()
    const [showForm, setShowForm] = useState(false)
    const [editando, setEditando] = useState<PlanoCompleto | null>(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [salvando, setSalvando] = useState(false)
    const supabase = createClient()

    function abrirNovo() {
        setEditando(null)
        setForm(EMPTY_FORM)
        setShowForm(true)
    }

    function abrirEditar(plano: PlanoCompleto) {
        setEditando(plano)
        setForm({ nome: plano.nome, tipo: plano.tipo, valor: plano.valor.toString(), descricao: plano.descricao ?? '' })
        setShowForm(true)
    }

    async function handleSalvar(e: React.FormEvent) {
        e.preventDefault()
        if (!form.nome || !form.valor) { toast.error('Preencha nome e valor.'); return }
        setSalvando(true)

        const payload = {
            nome: form.nome.trim(),
            tipo: form.tipo,
            valor: parseFloat(form.valor.replace(',', '.')),
            descricao: form.descricao || null,
        }

        const { error } = editando
            ? await supabase.from('planos').update(payload).eq('id', editando.id)
            : await supabase.from('planos').insert(payload)

        if (error) { toast.error('Erro ao salvar plano.') }
        else {
            toast.success(editando ? 'Plano atualizado!' : 'Plano criado!')
            setShowForm(false)
            refetch()
        }
        setSalvando(false)
    }

    async function toggleAtivo(plano: PlanoCompleto) {
        const { error } = await supabase
            .from('planos').update({ ativo: !plano.ativo }).eq('id', plano.id)
        if (error) toast.error('Erro ao atualizar.')
        else { toast.success(plano.ativo ? 'Plano desativado.' : 'Plano ativado.'); refetch() }
    }

    const fieldClass = "w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] focus:bg-white transition-all shadow-sm hover:border-gray-300"

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Settings2 className="w-6 h-6 text-gray-400" /> Planos e Preços
                    </h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">Gerencie os pacotes de assinatura e valores do seu CT.</p>
                </div>
                <button
                    onClick={abrirNovo}
                    className="flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#AA0000] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                >
                    <Plus className="h-4 w-4" /> Novo plano
                </button>
            </div>

            {/* Formulário */}
            {showForm && (
                <form onSubmit={handleSalvar} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8 space-y-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#CC0000] to-orange-500" />

                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {editando ? 'Editar pacote de assinatura' : 'Criar novo pacote de assinatura'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Nome do Plano</label>
                            <input className={fieldClass} value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Mensal Básico" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Recorrência</label>
                            <select className={fieldClass} value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value as TipoPlano }))}>
                                {Object.entries(TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Valor Total (R$)</label>
                            <input className={fieldClass} value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} placeholder="180,00" required />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Descrição Curta (Benefícios)</label>
                            <input className={fieldClass} value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Acesso completo por 30 dias" />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-3">
                        <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 px-4 text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">
                            Cancelar
                        </button>
                        <button type="submit" disabled={salvando} className="flex-1 py-2.5 px-4 text-sm font-bold text-white bg-gray-900 hover:bg-black disabled:opacity-60 rounded-xl transition-all duration-200 shadow-sm">
                            {salvando ? 'Salvando...' : 'Salvar Plano'}
                        </button>
                    </div>
                </form>
            )}

            {/* Lista */}
            {loading ? <LoadingSpinner label="Buscando planos ativos..." /> : (
                <div className="grid grid-cols-1 gap-4">
                    {planos.map(plano => (
                        <div key={plano.id} className={`bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:shadow-md ${!plano.ativo ? 'opacity-50 grayscale select-none' : ''}`}>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{plano.nome}</h3>
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#CC0000] bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                                        {TIPO_LABELS[plano.tipo]}
                                    </span>
                                    {!plano.ativo && <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Desativado</span>}
                                </div>
                                {plano.descricao ? (
                                    <p className="text-sm font-medium text-gray-500 truncate">{plano.descricao}</p>
                                ) : (
                                    <p className="text-sm italic text-gray-400">Sem descrição cadastrada.</p>
                                )}
                            </div>

                            <div className="flex items-center sm:justify-end gap-5 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                                <p className="text-2xl font-black text-gray-900 flex-1 sm:flex-none">
                                    R$ <span className="tracking-tight">{plano.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </p>

                                <div className="flex items-center gap-1.5 shrink-0 bg-gray-50 p-1 rounded-lg">
                                    <button onClick={() => abrirEditar(plano)} className="p-2 text-gray-500 hover:text-[#CC0000] hover:bg-white rounded-md transition-colors shadow-sm" title="Editar">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => toggleAtivo(plano)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-colors shadow-sm" title={plano.ativo ? 'Desativar' : 'Ativar'}>
                                        {plano.ativo ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {planos.length === 0 && !showForm && (
                        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
                            <p className="text-sm font-medium text-gray-500">Você ainda não tem pacotes de assinatura cadastrados.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
