import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'success' | 'warning' | 'primary'
    icon?: React.ReactNode
    isLoading?: boolean
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'primary',
    icon,
    isLoading = false
}: ConfirmModalProps) {
    if (!isOpen) return null

    // Variants for styling
    const variants = {
        danger: {
            bg: 'bg-red-50 text-red-600',
            button: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
            icon: <AlertTriangle className="h-6 w-6 text-red-600" />
        },
        warning: {
            bg: 'bg-amber-50 text-amber-600',
            button: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
            icon: <AlertTriangle className="h-6 w-6 text-amber-600" />
        },
        success: {
            bg: 'bg-green-50 text-green-600',
            button: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
            icon: <CheckCircle2 className="h-6 w-6 text-green-600" />
        },
        primary: {
            bg: 'bg-blue-50 text-blue-600',
            button: 'bg-[#CC0000] hover:bg-[#AA0000] text-white focus:ring-[#CC0000]',
            icon: <AlertTriangle className="h-6 w-6 text-[#CC0000]" />
        }
    }

    const currentVariant = variants[variant]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={!isLoading ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Modal Panel */}
            <div className="relative bg-white rounded-xl shadow-2xl sm:max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">

                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        {/* Status Icon */}
                        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${currentVariant.bg}`}>
                            {icon || currentVariant.icon}
                        </div>

                        {/* Content */}
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                                    {title}
                                </h3>
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 disabled:opacity-50"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Footer */}
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 flex items-center gap-2 ${currentVariant.button}`}
                    >
                        {isLoading && <LoadingSpinner size="sm" />}
                        {confirmText}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    )
}
