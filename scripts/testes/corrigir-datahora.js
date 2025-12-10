import 'dotenv/config';
import prisma from '../../src/lib/prisma.js';

async function corrigirDataHoraNula() {
    try {
        console.log('🔧 Corrigindo perguntas com dataHora NULL...\n');

        // Usar query direta do MongoDB para encontrar documentos com dataHora null
        const perguntasComProblema = await prisma.$runCommandRaw({
            find: 'perguntas',
            filter: { dataHora: null }
        });

        const count = perguntasComProblema.cursor.firstBatch.length;

        console.log(`Encontradas ${count} perguntas com dataHora NULL`);

        if (count > 0) {
            console.log('\nAtualizando...');

            // Atualizar todas as perguntas com dataHora null para a data atual
            const resultado = await prisma.$runCommandRaw({
                update: 'perguntas',
                updates: [{
                    q: { dataHora: null },
                    u: { $set: { dataHora: new Date() } },
                    multi: true
                }]
            });

            console.log(`\n✅ ${resultado.nModified || count} perguntas atualizadas!`);
            console.log('\nAgora tente abrir o Prisma Studio novamente.');
        } else {
            console.log('\n✅ Nenhuma pergunta com problema encontrada!');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error('\nTentando método alternativo...\n');

        // Método alternativo: pegar todas e filtrar manualmente
        try {
            const todasPerguntas = await prisma.pergunta.findMany({
                select: { id: true, dataHora: true }
            });

            const semData = todasPerguntas.filter(p => !p.dataHora);
            console.log(`Perguntas sem data: ${semData.length}`);

            if (semData.length > 0) {
                for (const p of semData) {
                    await prisma.pergunta.update({
                        where: { id: p.id },
                        data: { dataHora: new Date() }
                    });
                }
                console.log(`✅ ${semData.length} perguntas corrigidas!`);
            }
        } catch (err2) {
            console.error('❌ Método alternativo também falhou:', err2.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

corrigirDataHoraNula();
