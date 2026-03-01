interface AvatarInitialsProps {
    nome: string
    fotoUrl?: string | null
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

function getInitials(nome: string): string {
    return nome
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
}

// Gera uma cor determinística baseada no nome
function getColor(nome: string): string {
    const colors = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500',
        'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
        'bg-blue-500', 'bg-violet-500', 'bg-pink-500',
    ]
    const index = nome.charCodeAt(0) % colors.length
    return colors[index]
}

const sizes = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-11 w-11 text-base',
    xl: 'h-16 w-16 text-xl',
}

export function AvatarInitials({ nome, fotoUrl, size = 'md' }: AvatarInitialsProps) {
    if (fotoUrl) {
        return (
            <img
                src={fotoUrl}
                alt={nome}
                className={`${sizes[size]} rounded-full object-cover shrink-0 shadow-sm border border-black/5`}
            />
        )
    }

    return (
        <div
            className={`
        ${sizes[size]} ${getColor(nome)}
        rounded-full flex items-center justify-center
        text-white font-bold shrink-0 shadow-sm
      `}
        >
            {getInitials(nome)}
        </div>
    )
}
