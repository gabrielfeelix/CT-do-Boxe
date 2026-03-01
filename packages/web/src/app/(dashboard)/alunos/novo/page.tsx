'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCheck, ClipboardList, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Situacao = 'matriculado' | 'avaliacao' | null
type Etapa = 'situacao' | 'dados' | 'proximo'

interface DadosForm {
    nome: string
    email: string
    telefone: string
    cpf: string
    data_nascimento: string
    observacoes: string
    // Se avaliação: data de agendamento
    data_avaliacao: string
}

const EMPTY: DadosForm = {
    nome: '', email: '', telefone: '', cpf: '', data_nascimento: '', observacoes: '',
    data_avaliacao: new Date(Date.now() + 86400000).toISOString().split('T')[0], // amanhã
}

function formatarTelefone(v: string) {
    const n = v.replace(/\D/g, '').slice(0, 11)
    return n.length <= 10
        ? n.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim()
        : n.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim()
}

function formatarCPF(v: string) {
    const n = v.replace(/\D/g, '').slice(0, 11)
    return n.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4').trim()
}

export default function NovoAlunoPage() {
    const router = useRouter()
    const supabase = createClient()

    const [etapa, setEtapa] = useState<Etapa>('situacao')
    const [situacao, setSituacao] = useState<Situacao>(null)
    const [form, setForm] = useState<DadosForm>(EMPTY)
    const [salvando, setSalvando] = useState(false)
    const [alunoSalvo, setAlunoSalvo] = useState<{ id: string; nome: string } | null>(null)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    }

    function selecionarSituacao(s: Situacao) {
        setSituacao(s)
        setEtapa('dados')
    }

    async function handleSalvar(e: React.FormEvent) {
        e.preventDefault()
        if (!form.nome.trim() || !form.email.trim()) {
            toast.error('Nome e e-mail são obrigatórios.')
            return
        }

        setSalvando(true)

        // 1. Cria o aluno
        const { data: novoAluno, error: erroAluno } = await supabase
            .from('alunos')
            .insert({
                nome: form.nome.trim(),
                email: form.email.trim().toLowerCase(),
                telefone: form.telefone || null,
                cpf: form.cpf || null,
                data_nascimento: form.data_nascimento || null,
                observacoes: form.observacoes || null,
                status: situacao === 'matriculado' ? 'ativo' : 'inativo', // inativo até passar na avaliação
            })
            .select()
            .single()

        if (erroAluno) {
            if (erroAluno.code === '23505') toast.error('Já existe um aluno com este e-mail.')
            else toast.error('Erro ao cadastrar aluno.')
            setSalvando(false)
            return
        }

        // 2. Se avaliação: cria registro de avaliação agendada
        if (situacao === 'avaliacao' && form.data_avaliacao) {
            await supabase.from('avaliacoes').insert({
                aluno_id: novoAluno.id,
                tipo: 'entrada',
                status: 'agendada',
                data_avaliacao: form.data_avaliacao,
                resultado: 'pendente',
            })
        }

        setAlunoSalvo({ id: novoAluno.id, nome: novoAluno.nome })
        toast.success(`${form.nome.split(' ')[0]} cadastrado com sucesso!`)
        setSalvando(false)
        setEtapa('proximo')
    }

    const fieldClass = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-colors"

    // ─── Etapa 1: Situação ───────────────────────────────────────────────────────
    if (etapa === 'situacao') {
        return (
            <div className="max-w-2xl space-y-5">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Voltar
                </button>

                <div>
                    <h2 className="text-xl font-bold text-gray-900">Cadastrar aluno</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Primeiro, me diga a situação deste aluno.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Já está matriculado */}
                    <button
                        onClick={() => selecionarSituacao('matriculado')}
                        className="group bg-white border-2 border-gray-200 hover:border-[#CC0000] hover:bg-red-50 rounded-xl p-6 text-left transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors">
                                <UserCheck className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">Já está matriculado</p>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                    Aluno aprovado, pagamento feito, acesso liberado imediatamente. Você pode criar o contrato na sequência.
                                </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#CC0000] transition-colors mt-0.5 shrink-0" />
                        </div>
                    </button>

                    {/* Precisa de avaliação */}
                    <button
                        onClick={() => selecionarSituacao('avaliacao')}
                        className="group bg-white border-2 border-gray-200 hover:border-[#CC0000] hover:bg-red-50 rounded-xl p-6 text-left transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                                <ClipboardList className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">Precisa de avaliação</p>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                    Candidato a aluno. Será cadastrado como inativo e terá uma avaliação física agendada antes de ser liberado.
                                </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#CC0000] transition-colors mt-0.5 shrink-0" />
                        </div>
                    </button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                    Candidatos que se inscrevem pelo app aparecem em{' '}
                    <Link href="/candidatos" className="text-[#CC0000] hover:underline">Processo Seletivo</Link>.
                    Use este fluxo para cadastros presenciais.
                </p>
            </div>
        )
    }

    // ─── Etapa 3: Próximo passo ──────────────────────────────────────────────────
    if (etapa === 'proximo' && alunoSalvo) {
        return (
            <div className="max-w-lg space-y-5">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center space-y-5">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-green-100 text-green-600">
                        <UserCheck className="h-7 w-7" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{alunoSalvo.nome.split(' ')[0]} cadastrado!</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {situacao === 'avaliacao'
                                ? 'Avaliação física agendada. O aluno terá acesso ao app após ser aprovado.'
                                : 'Aluno está ativo. O que deseja fazer agora?'
                            }
                        </p>
                    </div>

                    <div className="space-y-2">
                        {situacao === 'matriculado' && (
                            <button
                                onClick={() => router.push(`/contratos/novo?aluno_id=${alunoSalvo.id}`)}
                                className="w-full py-3 text-sm font-semibold text-white bg-[#CC0000] hover:bg-[#AA0000] rounded-lg transition-colors"
                            >
                                Criar contrato e gerar PIX →
                            </button>
                        )}
                        {situacao === 'avaliacao' && (
                            <button
                                onClick={() => router.push(`/avaliacoes/${alunoSalvo.id}/nova`)}
                                className="w-full py-3 text-sm font-semibold text-white bg-[#CC0000] hover:bg-[#AA0000] rounded-lg transition-colors"
                            >
                                Preencher avaliação agora →
                            </button>
                        )}
                        <button
                            onClick={() => router.push(`/alunos/${alunoSalvo.id}`)}
                            className="w-full py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Ver perfil do aluno
                        </button>
                        <button
                            onClick={() => router.push('/alunos')}
                            className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Voltar para lista de alunos
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ─── Etapa 2: Dados ──────────────────────────────────────────────────────────
    return (
        <div className="max-w-2xl space-y-5">
            <button onClick={() => setEtapa('situacao')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Voltar
            </button>

            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${situacao === 'matriculado' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {situacao === 'matriculado' ? <UserCheck className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Dados do aluno</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {situacao === 'matriculado' ? 'Será ativado imediatamente após o cadastro.' : 'Ficará inativo até passar na avaliação.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSalvar} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nome completo <span className="text-red-500">*</span>
                    </label>
                    <input name="nome" value={form.nome} onChange={handleChange} placeholder="Ex: Carlos Eduardo Mendes" required className={fieldClass} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        E-mail <span className="text-red-500">*</span>
                    </label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="carlos@email.com" required className={fieldClass} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone (WhatsApp)</label>
                        <input
                            name="telefone" value={form.telefone}
                            onChange={e => setForm(p => ({ ...p, telefone: formatarTelefone(e.target.value) }))}
                            placeholder="(41) 99999-0000" className={fieldClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de nascimento</label>
                        <input type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} className={fieldClass} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">CPF</label>
                    <input
                        name="cpf" value={form.cpf}
                        onChange={e => setForm(p => ({ ...p, cpf: formatarCPF(e.target.value) }))}
                        placeholder="000.000.000-00" className={fieldClass}
                    />
                </div>

                {/* Campo extra se for avaliação */}
                {situacao === 'avaliacao' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                        <div>
                            <p className="text-sm font-semibold text-blue-800">📋 Agendamento de avaliação</p>
                            <p className="text-xs text-blue-600 mt-0.5">O aluno terá acesso ao app somente após a avaliação e aprovação.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1.5">Data da avaliação</label>
                            <input
                                type="date"
                                name="data_avaliacao"
                                value={form.data_avaliacao}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3.5 py-2.5 text-sm border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Observações internas</label>
                    <textarea
                        name="observacoes" value={form.observacoes} onChange={handleChange}
                        placeholder="Notas sobre o aluno que só o professor verá..."
                        rows={2} className={`${fieldClass} resize-none`}
                    />
                </div>

                <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setEtapa('situacao')} className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        Voltar
                    </button>
                    <button type="submit" disabled={salvando} className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#CC0000] hover:bg-[#AA0000] disabled:opacity-60 rounded-lg transition-colors">
                        {salvando ? 'Cadastrando...' : 'Cadastrar aluno'}
                    </button>
                </div>
            </form>
        </div>
    )
}
