import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-500">
            <div className="p-4 rounded-2xl bg-gray-50 text-gray-400 mb-4 border border-gray-100 shadow-sm">
                <Icon className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 font-medium max-w-xs">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-5 px-4 py-2 bg-[#CC0000] text-white text-sm font-semibold rounded-lg hover:bg-[#AA0000] focus:ring-2 focus:ring-[#CC0000]/20 transition-all duration-200 shadow-sm hover:shadow"
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}
