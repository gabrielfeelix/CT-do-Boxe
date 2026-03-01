const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Seeding Database...');

    // 1. Criar Planos Base (se não tiverem)
    const { data: planosBase } = await supabase.from('planos').select('id');
    let planos = [];
    if (!planosBase || planosBase.length === 0) {
        const defaultPlanos = [
            { nome: 'Boxe Fitness Mensal', valor_mensal: 150, tipo: 'mensal', max_aulas_semana: 3, ativo: true },
            { nome: 'Competidor Semestral', valor_mensal: 120, tipo: 'semestral', max_aulas_semana: 6, ativo: true },
            { nome: 'Avulso (Personal)', valor_mensal: 80, tipo: 'anual', max_aulas_semana: 1, ativo: true }
        ];
        const { data: insertedPlanos, error } = await supabase.from('planos').insert(defaultPlanos).select();
        if (error) console.error('Erro ao Inserir Planos', error);
        planos = insertedPlanos;
    } else {
        // try to fetch
        const { data: fetchPlanos } = await supabase.from('planos').select('*');
        planos = fetchPlanos;
    }

    // 2. Criar Alunos Mock
    const { data: verifyAlunos } = await supabase.from('alunos').select('*').limit(5);
    let alunos = verifyAlunos;

    if (!alunos || alunos.length === 0) {
        const names = ['Carlos Silva', 'Marina Ribeiro', 'João Gomes', 'Ana Lima', 'Pedro Santos'];
        const bulkAlunos = names.map(n => ({
            nome: n,
            email: n.toLowerCase().replace(' ', '') + '@teste.com',
            telefone: '11999999999',
            status: 'ativo'
        }));
        const { data: added, error: errAlunos } = await supabase.from('alunos').insert(bulkAlunos).select();
        if (errAlunos) console.error('Erros no Aluno', errAlunos);
        alunos = added;
    }

    console.log(`Temos ${alunos.length} alunos e ${planos.length} planos para o mock financeiro.`);

    // 3. Cadastrar contratos e pagamentos se eles nao rodaram
    const { data: verContratos } = await supabase.from('contratos').select('id').limit(1);
    if ((!verContratos || verContratos.length === 0) && alunos && alunos.length > 0 && planos && planos.length > 0) {
        let now = new Date();
        for (let i = 0; i < 3; i++) {
            const a = alunos[i];
            const p = planos[i % planos.length];

            const dtFim = new Date();
            dtFim.setMonth(dtFim.getMonth() + (p.tipo === 'anual' ? 12 : p.tipo === 'semestral' ? 6 : 1));

            const { data: c, error: errC } = await supabase.from('contratos').insert({
                aluno_id: a.id,
                plano_id: p.id,
                valor: p.valor_mensal,
                dia_vencimento: 10,
                status: 'ativo',
                data_inicio: now.toISOString().split('T')[0],
                data_fim: dtFim.toISOString().split('T')[0]
            }).select().single();

            if (errC) console.error('Err', errC);
            else {
                // Create a Fake Payment
                await supabase.from('pagamentos').insert({
                    contrato_id: c.id,
                    aluno_id: a.id,
                    valor: p.valor_mensal,
                    data_vencimento: now.toISOString().split('T')[0],
                    data_pagamento: now.toISOString().split('T')[0],
                    status: 'pago',
                    metodo: 'PIX'
                });
            }
        }
    }

    // Atrasados
    // Create an overdue payment
    if (alunos && alunos.length > 3 && planos && planos.length > 0) {
        const p = planos[0];
        const datav = new Date();
        datav.setDate(datav.getDate() - 15);
        const a = alunos[3];

        const { data: c2 } = await supabase.from('contratos').insert({
            aluno_id: a.id,
            plano_id: p.id,
            valor: p.valor_mensal,
            dia_vencimento: datav.getDate(),
            status: 'ativo',
            data_inicio: datav.toISOString().split('T')[0],
            data_fim: new Date(datav.getTime() + 1000 * 3600 * 24 * 30).toISOString().split('T')[0]
        }).select().single();

        if (c2) {
            await supabase.from('pagamentos').insert({
                contrato_id: c2.id,
                aluno_id: a.id,
                valor: p.valor_mensal,
                data_vencimento: datav.toISOString().split('T')[0],
                status: 'atrasado',
            });
        }
    }

    console.log('Seeding concluído.');
}

main();
