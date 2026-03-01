/**
 * Paleta de cores do CT de Boxe
 * Tema claro — branco como base, vermelho como cor de acento
 */

export const Colors = {
    // Cor principal (acento)
    primary: '#DC2626',       // Vermelho principal
    primaryDark: '#B91C1C',   // Vermelho escuro (hover/pressed)
    primaryLight: '#FEE2E2',  // Vermelho claro (backgrounds sutis)

    // Neutros
    white: '#FFFFFF',
    background: '#FAFAFA',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Textos
    textPrimary: '#1F2937',   // Títulos e texto principal
    textSecondary: '#6B7280', // Texto secundário / descrições
    textMuted: '#9CA3AF',     // Texto desabilitado / placeholders

    // Status
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#2563EB',

    // Tab Bar
    tabActive: '#DC2626',
    tabInactive: '#9CA3AF',
} as const;

export type ColorKey = keyof typeof Colors;
