'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { toast } from 'sonner'

type Secao = 'antropometrico' | 'medidas' | 'condicionamento' | 'tecnica' | 'resultado'

const SECOES: { id: Secao; label: string; emoji: string }[] = [
    { id: 'antropometrico', label: 'Dados físicos', emoji: '⚖️' },
    { id: 'medidas', label: 'Medidas', emoji: '📏' },
    { id: 'condicionamento', label: 'Condicionamento', emoji: '🏃' },
    { id: 'tecnica', label: 'Técnica', emoji: '🥊' },
    { id: 'resultado', label: 'Resultado', emoji: '📋' },
]

function calcularIMC(peso: string, altura: string): string {
    const p = parseFloat(peso)
    const a = parseFloat(altura) / 100
    if (!p || !a) return ''
    return (p / (a * a)).toFixed(1)
}

function notaMedia(valores: (string | undefined)[]): string {
    const nums = valores.map(v => parseFloat(v ?? '')).filter(n => !isNaN(n))
    if (!nums.length) return ''
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
}

interface AvalForm {
    data_avaliacao: string
    // Antropométrico
    peso_kg: string; altura_cm: string; bf_percentual: string; massa_muscular_kg: string
    // Medidas
    med_peito: string; med_cintura: string; med_quadril: string
    med_braco_d: string; med_braco_e: string; med_coxa_d: string; med_coxa_e: string
    // Condicionamento
    test_flexao_30s: string; test_burpee_1min: string; test_cooper_metros: string; test_pular_corda_min: string
    // Técnica (0–5)
    tec_postura: string; tec_jab: string; tec_direto: string; tec_gancho: string
    tec_uppercut: string; tec_defesa: string; tec_footwork: string
    // Resultado
    resultado: string; observacoes: string; proximos_passos: string
}

const EMPTY_FORM: AvalForm = {
    data_avaliacao: new Date().toISOString().split('T')[0],
    peso_kg: '', altura_cm: '', bf_percentual: '', massa_muscular_kg: '',
    med_peito: '', med_cintura: '', med_quadril: '',
    med_braco_d: '', med_braco_e: '', med_coxa_d: '', med_coxa_e: '',
    test_flexao_30s: '', test_burpee_1min: '', test_cooper_metros: '', test_pular_corda_min: '',
    tec_postura: '', tec_jab: '', tec_direto: '', tec_gancho: '',
    tec_uppercut: '', tec_defesa: '', tec_footwork: '',
    resultado: '', observacoes: '', proximos_passos: '',
}

export default function NovaAvaliacaoPage() {
    const { alunoId } = useParams<{ alunoId: string }>()
    const searchParams = useSearchParams()
    const avaliacaoId = searchParams.get('avaliacao_id')
    const router = useRouter()
    const supabase = createClient()

    const [aluno, setAluno] = useState<{ id: string, nome: string } | null>(null)
    const [secao, setSecao] = useState<Secao>('antropometrico')
    const [form, setForm] = useState<AvalForm>(EMPTY_FORM)
    const [salvando, setSalvando] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function init() {
            const { data } = await supabase.from('alunos').select('*').eq('id', alunoId).single()
            setAluno(data)
            setLoading(false)
        }
        if (alunoId) init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alunoId])

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    }

    function StarRating({ campo }: { campo: keyof AvalForm }) {
        const valor = parseInt(form[campo] as string) || 0
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, [campo]: n === valor ? '' : n.toString() }))}
                        className={`h-9 w-9 rounded-lg text-sm font-bold transition-all ${n <= valor
                            ? 'bg-[#CC0000] text-white'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                    >
                        {n}
                    </button>
                ))}
                {valor > 0 && <span className="ml-2 text-xs text-gray-400 self-center">{valor}/5</span>}
            </div>
        )
    }

    async function handleSalvar() {
        if (!form.resultado) { toast.error('Selecione o resultado da avaliação.'); return }
        setSalvando(true)

        const notaTecnica = notaMedia([
            form.tec_postura, form.tec_jab, form.tec_direto, form.tec_gancho,
            form.tec_uppercut, form.tec_defesa, form.tec_footwork,
        ])

        const imc = calcularIMC(form.peso_kg, form.altura_cm)

        const payload = {
            aluno_id: alunoId,
            tipo: 'entrada',
            status: 'concluida',
            data_avaliacao: form.data_avaliacao,
            avaliador: 'Argel Riboli',
            // Antropométrico
            peso_kg: form.peso_kg ? parseFloat(form.peso_kg) : null,
            altura_cm: form.altura_cm ? parseFloat(form.altura_cm) : null,
            imc: imc ? parseFloat(imc) : null,
            bf_percentual: form.bf_percentual ? parseFloat(form.bf_percentual) : null,
            massa_muscular_kg: form.massa_muscular_kg ? parseFloat(form.massa_muscular_kg) : null,
            // Medidas
            med_peito: form.med_peito ? parseFloat(form.med_peito) : null,
            med_cintura: form.med_cintura ? parseFloat(form.med_cintura) : null,
            med_quadril: form.med_quadril ? parseFloat(form.med_quadril) : null,
            med_braco_d: form.med_braco_d ? parseFloat(form.med_braco_d) : null,
            med_braco_e: form.med_braco_e ? parseFloat(form.med_braco_e) : null,
            med_coxa_d: form.med_coxa_d ? parseFloat(form.med_coxa_d) : null,
            med_coxa_e: form.med_coxa_e ? parseFloat(form.med_coxa_e) : null,
            // Condicionamento
            test_flexao_30s: form.test_flexao_30s ? parseInt(form.test_flexao_30s) : null,
            test_burpee_1min: form.test_burpee_1min ? parseInt(form.test_burpee_1min) : null,
            test_cooper_metros: form.test_cooper_metros ? parseInt(form.test_cooper_metros) : null,
            test_pular_corda_min: form.test_pular_corda_min ? parseFloat(form.test_pular_corda_min) : null,
            // Técnica
            tec_postura: form.tec_postura ? parseInt(form.tec_postura) : null,
            tec_jab: form.tec_jab ? parseInt(form.tec_jab) : null,
            tec_direto: form.tec_direto ? parseInt(form.tec_direto) : null,
            tec_gancho: form.tec_gancho ? parseInt(form.tec_gancho) : null,
            tec_uppercut: form.tec_uppercut ? parseInt(form.tec_uppercut) : null,
            tec_defesa: form.tec_defesa ? parseInt(form.tec_defesa) : null,
            tec_footwork: form.tec_footwork ? parseInt(form.tec_footwork) : null,
            nota_tecnica_geral: notaTecnica ? parseFloat(notaTecnica) : null,
            // Resultado
            resultado: form.resultado,
            observacoes: form.observacoes || null,
            proximos_passos: form.proximos_passos || null,
        }

        // Upsert: se havia avaliacao_id agendada, atualiza; senão insere nova
        let error
        if (avaliacaoId) {
            ({ error } = await supabase.from('avaliacoes').update(payload).eq('id', avaliacaoId))
        } else {
            ({ error } = await supabase.from('avaliacoes').insert(payload))
        }

        if (error) { toast.error('Erro ao salvar avaliação.'); setSalvando(false); return }

        // Se aprovado, ativa o aluno
        if (form.resultado === 'aprovado' || form.resultado === 'aprovado_condicional') {
            await supabase.from('alunos').update({ status: 'ativo' }).eq('id', alunoId)
            toast.success('✅ Avaliação salva e aluno ativado!')
        } else if (form.resultado === 'reprovado') {
            toast.success('Avaliação salva. Aluno permanece inativo.')
        } else {
            toast.success('Avaliação salva.')
        }

        router.push(`/alunos/${alunoId}`)
        setSalvando(false)
    }

    const fieldNum = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-colors text-right"
    const label = "block text-xs font-medium text-gray-500 mb-1"

    if (loading) return <LoadingSpinner label="Carregando..." />

    return (
        <div className="max-w-2xl space-y-5">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Voltar
            </button>

            <div>
                <h2 className="text-xl font-bold text-gray-900">Avaliação física</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                    {aluno?.nome} · {form.data_avaliacao}
                </p>
            </div>

            {/* Navegação entre seções */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                {SECOES.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setSecao(s.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-1 justify-center
              ${secao === s.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <span>{s.emoji}</span> {s.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
                {/* ── SEÇÃO: Dados físicos ──────────────────────────────────────── */}
                {secao === 'antropometrico' && (
                    <>
                        <div>
                            <label className={label}>Data da avaliação</label>
                            <input type="date" name="data_avaliacao" value={form.data_avaliacao} onChange={handleChange}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-colors" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={label}>Peso (kg)</label>
                                <input type="number" name="peso_kg" value={form.peso_kg} onChange={handleChange} placeholder="82.5" step="0.1" className={fieldNum} />
                            </div>
                            <div>
                                <label className={label}>Altura (cm)</label>
                                <input type="number" name="altura_cm" value={form.altura_cm} onChange={handleChange} placeholder="178.0" step="0.1" className={fieldNum} />
                            </div>
                            <div>
                                <label className={label}>IMC (calculado)</label>
                                <input type="text" value={calcularIMC(form.peso_kg, form.altura_cm) || '—'} readOnly
                                    className={`${fieldNum} bg-gray-50 text-gray-500`} />
                            </div>
                            <div>
                                <label className={label}>Gordura corporal (%)</label>
                                <input type="number" name="bf_percentual" value={form.bf_percentual} onChange={handleChange} placeholder="18.5" step="0.1" className={fieldNum} />
                            </div>
                            <div>
                                <label className={label}>Massa muscular (kg)</label>
                                <input type="number" name="massa_muscular_kg" value={form.massa_muscular_kg} onChange={handleChange} placeholder="65.0" step="0.1" className={fieldNum} />
                            </div>
                        </div>
                    </>
                )}

                {/* ── SEÇÃO: Medidas ───────────────────────────────────────────── */}
                {secao === 'medidas' && (
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { name: 'med_peito', label: 'Peito (cm)' },
                            { name: 'med_cintura', label: 'Cintura (cm)' },
                            { name: 'med_quadril', label: 'Quadril (cm)' },
                            { name: 'med_braco_d', label: 'Braço D (cm)' },
                            { name: 'med_braco_e', label: 'Braço E (cm)' },
                            { name: 'med_coxa_d', label: 'Coxa D (cm)' },
                            { name: 'med_coxa_e', label: 'Coxa E (cm)' },
                        ].map(c => (
                            <div key={c.name}>
                                <label className={label}>{c.label}</label>
                                <input type="number" name={c.name} value={(form as unknown as Record<string, string>)[c.name] as string} onChange={handleChange}
                                    placeholder="—" step="0.1" className={fieldNum} />
                            </div>
                        ))}
                    </div>
                )}

                {/* ── SEÇÃO: Condicionamento ───────────────────────────────────── */}
                {secao === 'condicionamento' && (
                    <div className="space-y-4">
                        <p className="text-xs text-gray-400">Resultados dos testes físicos. Deixe em branco os testes não realizados.</p>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { name: 'test_flexao_30s', label: 'Flexões em 30s (reps)', placeholder: '25' },
                                { name: 'test_burpee_1min', label: 'Burpees em 1min (reps)', placeholder: '18' },
                                { name: 'test_cooper_metros', label: 'Cooper 12min (metros)', placeholder: '2400' },
                                { name: 'test_pular_corda_min', label: 'Corda sem parar (min)', placeholder: '3.5' },
                            ].map(c => (
                                <div key={c.name}>
                                    <label className={label}>{c.label}</label>
                                    <input type="number" name={c.name} value={(form as unknown as Record<string, string>)[c.name] as string} onChange={handleChange}
                                        placeholder={c.placeholder} step="0.1" className={fieldNum} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── SEÇÃO: Técnica ───────────────────────────────────────────── */}
                {secao === 'tecnica' && (
                    <div className="space-y-4">
                        <p className="text-xs text-gray-400">Avalie cada aspecto técnico de 1 (péssimo) a 5 (excelente). Toque nos números para pontuar.</p>

                        {[
                            { campo: 'tec_postura', label: 'Postura / guarda' },
                            { campo: 'tec_jab', label: 'Jab' },
                            { campo: 'tec_direto', label: 'Direto' },
                            { campo: 'tec_gancho', label: 'Gancho' },
                            { campo: 'tec_uppercut', label: 'Uppercut' },
                            { campo: 'tec_defesa', label: 'Defesa / esquiva' },
                            { campo: 'tec_footwork', label: 'Footwork' },
                        ].map(({ campo, label: lbl }) => (
                            <div key={campo} className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700 w-40 shrink-0">{lbl}</label>
                                <StarRating campo={campo as keyof AvalForm} />
                            </div>
                        ))}

                        {/* Média automática */}
                        {(() => {
                            const media = notaMedia([form.tec_postura, form.tec_jab, form.tec_direto, form.tec_gancho, form.tec_uppercut, form.tec_defesa, form.tec_footwork])
                            return media ? (
                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Nota técnica geral</span>
                                    <span className="text-2xl font-bold text-[#CC0000]">{media}<span className="text-sm text-gray-400">/5</span></span>
                                </div>
                            ) : null
                        })()}
                    </div>
                )}

                {/* ── SEÇÃO: Resultado ─────────────────────────────────────────── */}
                {secao === 'resultado' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Resultado da avaliação <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {[
                                    { value: 'aprovado', label: '✅ Aprovado', desc: 'Acesso liberado imediatamente', cor: 'border-green-500 bg-green-50 text-green-800' },
                                    { value: 'aprovado_condicional', label: '⚠️ Condicional', desc: 'Aprovado com ressalvas', cor: 'border-yellow-500 bg-yellow-50 text-yellow-800' },
                                    { value: 'reprovado', label: '❌ Reprovado', desc: 'Não atende aos critérios', cor: 'border-red-500 bg-red-50 text-red-800' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, resultado: opt.value }))}
                                        className={`p-4 rounded-xl border-2 text-left transition-all
                      ${form.resultado === opt.value ? opt.cor + ' border-2' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <p className="text-sm font-bold">{opt.label}</p>
                                        <p className="text-xs mt-0.5 opacity-70">{opt.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Observações</label>
                            <textarea
                                name="observacoes" value={form.observacoes} onChange={handleChange}
                                placeholder="Pontos fortes, limitações, comportamento durante a avaliação..."
                                rows={3} className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Próximos passos</label>
                            <textarea
                                name="proximos_passos" value={form.proximos_passos} onChange={handleChange}
                                placeholder="O que o aluno deve focar nas primeiras semanas..."
                                rows={2} className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-colors"
                            />
                        </div>

                        {/* Resumo rápido antes de salvar */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resumo antes de salvar</p>
                            {[
                                { label: 'Aluno', value: aluno?.nome ?? '—' },
                                { label: 'Data', value: form.data_avaliacao },
                                { label: 'Peso', value: form.peso_kg ? `${form.peso_kg} kg` : '—' },
                                { label: 'IMC', value: calcularIMC(form.peso_kg, form.altura_cm) || '—' },
                                { label: 'Nota técnica', value: notaMedia([form.tec_postura, form.tec_jab, form.tec_direto, form.tec_gancho, form.tec_uppercut, form.tec_defesa, form.tec_footwork]) ? `${notaMedia([form.tec_postura, form.tec_jab, form.tec_direto, form.tec_gancho, form.tec_uppercut, form.tec_defesa, form.tec_footwork])}/5` : '—' },
                                { label: 'Resultado', value: form.resultado || '⚠️ não selecionado' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between text-xs">
                                    <span className="text-gray-400">{item.label}</span>
                                    <span className="font-semibold text-gray-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botões de navegação entre seções */}
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                    {SECOES.findIndex(s => s.id === secao) > 0 && (
                        <button
                            type="button"
                            onClick={() => setSecao(SECOES[SECOES.findIndex(s => s.id === secao) - 1].id)}
                            className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            ← Anterior
                        </button>
                    )}

                    {secao !== 'resultado' ? (
                        <button
                            type="button"
                            onClick={() => setSecao(SECOES[SECOES.findIndex(s => s.id === secao) + 1].id)}
                            className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#CC0000] hover:bg-[#AA0000] rounded-lg transition-colors"
                        >
                            Próximo →
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSalvar}
                            disabled={salvando || !form.resultado}
                            className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#CC0000] hover:bg-[#AA0000] disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {salvando ? 'Salvando...' : 'Salvar avaliação'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
