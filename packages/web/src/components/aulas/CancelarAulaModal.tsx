'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface CancelarAulaModalProps {
    open: boolean
    aulaTitulo?: string
    isRecorrente?: boolean
    loading?: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (payload: { motivo: string; notificarAlunos: boolean; scope: 'single' | 'future' }) => Promise<void>
}

export function CancelarAulaModal({
    open,
    aulaTitulo,
    isRecorrente = false,
    loading = false,
    onOpenChange,
    onConfirm,
}: CancelarAulaModalProps) {
    const [motivo, setMotivo] = useState('')
    const [notificarAlunos, setNotificarAlunos] = useState(true)
    const [scope, setScope] = useState<'single' | 'future'>('single')

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) {
            setMotivo('')
            setNotificarAlunos(true)
            setScope('single')
        }
        onOpenChange(nextOpen)
    }

    async function handleConfirm() {
        await onConfirm({ motivo, notificarAlunos, scope })
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>Cancelar aula</DialogTitle>
                    <DialogDescription>
                        A aula <strong>{aulaTitulo ?? ''}</strong> será marcada como cancelada. Esta ação afeta a rotina do
                        dia e o histórico de presenças.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {isRecorrente && (
                        <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                            <p className="text-sm font-semibold text-gray-700">Escopo do cancelamento</p>
                            <label className="flex items-start gap-2">
                                <input
                                    type="radio"
                                    name="cancel-scope"
                                    checked={scope === 'single'}
                                    onChange={() => setScope('single')}
                                    className="mt-1 h-4 w-4 border-gray-300 text-[#CC0000] focus:ring-[#CC0000]/30"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Cancelar só esta aula.
                                </span>
                            </label>
                            <label className="flex items-start gap-2">
                                <input
                                    type="radio"
                                    name="cancel-scope"
                                    checked={scope === 'future'}
                                    onChange={() => setScope('future')}
                                    className="mt-1 h-4 w-4 border-gray-300 text-[#CC0000] focus:ring-[#CC0000]/30"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Cancelar esta e todas as futuras da série.
                                </span>
                            </label>
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Motivo (opcional)</label>
                        <textarea
                            value={motivo}
                            onChange={(event) => setMotivo(event.target.value)}
                            rows={3}
                            placeholder="Ex.: professor indisponível no horário."
                            className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus:border-[#CC0000] focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
                        />
                    </div>

                    <label className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <input
                            type="checkbox"
                            checked={notificarAlunos}
                            onChange={(event) => setNotificarAlunos(event.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#CC0000] focus:ring-[#CC0000]/30"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Notificar alunos com vaga nessa aula sobre o cancelamento.
                        </span>
                    </label>
                </div>

                <DialogFooter>
                    <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        onClick={() => handleOpenChange(false)}
                        disabled={loading}
                    >
                        Voltar
                    </button>
                    <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Cancelando...' : 'Confirmar cancelamento'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
