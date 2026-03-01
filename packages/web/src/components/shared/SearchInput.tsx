'use client'

import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface SearchInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    debounceMs?: number
}

export function SearchInput({
    value,
    onChange,
    placeholder = 'Buscar...',
    debounceMs = 300,
}: SearchInputProps) {
    const [internal, setInternal] = useState(value)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        setInternal(value)
    }, [value])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const v = e.target.value
        setInternal(v)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => onChange(v), debounceMs)
    }

    function handleClear() {
        setInternal('')
        onChange('')
    }

    return (
        <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors pointer-events-none" />
            <input
                type="text"
                value={internal}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-white shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-all hover:border-gray-300"
            />
            {internal && (
                <button
                    onClick={handleClear}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-1 rounded-md transition-colors"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    )
}
