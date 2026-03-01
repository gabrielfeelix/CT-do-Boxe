interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    label?: string
}

const sizes = {
    sm: 'h-4 w-4 border-2 border-r-transparent',
    md: 'h-6 w-6 border-2 border-r-transparent',
    lg: 'h-10 w-10 border-3 border-r-transparent',
}

export function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative flex items-center justify-center">
                <div className={`absolute ${sizes[size]} rounded-full border-gray-100`} />
                <div
                    className={`${sizes[size]} animate-spin rounded-full border-[#CC0000] z-10`}
                />
            </div>
            {label && <p className="text-sm font-semibold text-gray-500 tracking-wide">{label}</p>}
        </div>
    )
}
