// Script para corrigir perguntas com dataHora null
// Execução: node scripts/fix-perguntas-datahora.js

import prisma from '../src/lib/prisma.js';

async function corrigirPerguntasComDataNull() {
    try {
        console.log('🔍 Buscando perguntas com dataHora null...');

        // Conectar diretamente ao MongoDB para buscar documentos com dataHora null
        const db = prisma.$queryRawUnsafe;

        // Atualizar todas as perguntas com dataHora null para a data atual
        const resultado = await prisma.$runCommandRaw({
            update: 'perguntas',
            updates: [
                {
                    q: { dataHora: null },
                    u: { $set: { dataHora: new Date() } },
                    multi: true
                }
            ]
        });

        console.log('✅ Perguntas corrigidas:', resultado);

        // Verificar se ainda existem perguntas com problemas
        const perguntasProblematicas = await prisma.$runCommandRaw({
            count: 'perguntas',
            query: { dataHora: null }
        });

        console.log('📊 Perguntas restantes com dataHora null:', perguntasProblematicas.n);

        if (perguntasProblematicas.n === 0) {
            console.log('✨ Todas as perguntas foram corrigidas!');
        }

    } catch (error) {
        console.error('❌ Erro ao corrigir perguntas:', error);
    } finally {
        await prisma.$disconnect();
    }
}

corrigirPerguntasComDataNull();
