'use client'

import { Bell, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { GlobalSearch } from './GlobalSearch'

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/alunos': 'Alunos',
    '/candidatos': 'Candidatos',
    '/contratos': 'Contratos',
    '/financeiro': 'Financeiro',
    '/financeiro/fluxo-de-caixa': 'Fluxo de Caixa',
    '/financeiro/inadimplencia': 'Inadimplência',
    '/financeiro/relatorios': 'Relatórios',
    '/aulas': 'Aulas',
    '/aulas/series': 'Series de Aulas',
    '/presenca': 'Presença',
    '/feed': 'Feed',
    '/stories': 'Stories',
    '/avaliacoes': 'Avaliações',
    '/timer': 'Timer de Rounds',
    '/relatorios': 'Relatórios',
    '/notificacoes': 'Notificações',
    '/configuracoes': 'Configurações',
    '/configuracoes/planos': 'Planos',
    '/configuracoes/perfil': 'Perfil',
}

export function Header() {
    const pathname = usePathname()

    // Encontra o título mais específico para a rota atual
    const title =
        pageTitles[pathname] ??
        Object.entries(pageTitles)
            .filter(([route]) => pathname.startsWith(route) && route !== '/dashboard')
            .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ??
        'Painel'

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
            {/* Título da página */}
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

            {/* Ações */}
            <div className="flex items-center gap-3">
                <GlobalSearch />

                {/* Notificações */}
                <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 cursor-pointer">
                    <Bell className="h-4.5 w-4.5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#CC0000]" />
                </button>

                {/* Avatar do admin */}
                <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity ml-2">
                    <div className="h-8 w-8 rounded-full bg-[#CC0000] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        AR
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-gray-900 leading-none">Argel Riboli</p>
                        <p className="text-xs text-gray-400 mt-0.5">Professor</p>
                    </div>
                </div>
            </div>
        </header>
    )
}
