import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'CT Boxe — Painel de Gestão',
    description: 'Sistema de gestão do CT de Boxe — Equipe Argel Riboli',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                {children}
                <Toaster richColors position="top-right" />
            </body>
        </html>
    )
}
