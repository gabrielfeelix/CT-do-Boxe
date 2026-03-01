'use client'

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

export interface ReceitaSerieItem {
    mes: string
    receita: number
    meta: number
}

interface ReceitaChartProps {
    data: ReceitaSerieItem[]
}

function formatCurrency(value: number) {
    return `R$ ${(value / 1000).toFixed(0)}k`
}

export function ReceitaChart({ data }: ReceitaChartProps) {
    const hasData = data.some((item) => item.receita > 0 || item.meta > 0)

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Receita Mensal</h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">Últimos 6 meses</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#CC0000] shadow-sm" />
                        Recebido
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-gray-300 shadow-sm" />
                        Previsto
                    </span>
                </div>
            </div>

            {!hasData ? (
                <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
                    Sem movimentacao financeira nos ultimos 6 meses.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradientReceita" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#CC0000" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#CC0000" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis
                            dataKey="mes"
                            tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={12}
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={12}
                        />
                        <Tooltip
                            formatter={(value: number | string | undefined, name: string | undefined) => [
                                `R$ ${Number(value ?? 0).toLocaleString('pt-BR')}`,
                                name === 'meta' ? 'Previsto' : 'Recebido',
                            ]}
                            labelStyle={{ fontSize: 12, fontWeight: 600, color: '#111827' }}
                            contentStyle={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: 12,
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                padding: '8px 12px'
                            }}
                            cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="meta"
                            stroke="#9ca3af"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            fill="none"
                        />
                        <Area
                            type="monotone"
                            dataKey="receita"
                            stroke="#CC0000"
                            strokeWidth={3}
                            fill="url(#gradientReceita)"
                            activeDot={{ r: 6, fill: '#CC0000', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
