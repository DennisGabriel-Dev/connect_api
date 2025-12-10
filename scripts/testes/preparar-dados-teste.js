import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function resetarEPreparar() {
    try {
        const palestraId = '693736a2346686b58c2c69e8';

        // Reset: marcar todas como pendentes
        await prisma.pergunta.updateMany({
            where: { palestraId },
            data: { status: 'pendente' }
        });
        console.log('Resetadas para pendente\n');

        // Buscar todas
        const perguntas = await prisma.pergunta.findMany({
            where: { palestraId },
            orderBy: { dataHora: 'desc' }
        });

        // Aprovar 4
        for (let i = 0; i < 4; i++) {
            await prisma.pergunta.update({
                where: { id: perguntas[i].id },
                data: { status: 'aprovada' }
            });
        }
        console.log('✅ 4 aprovadas');

        // Rejeitar 2
        for (let i = 4; i < 6; i++) {
            await prisma.pergunta.update({
                where: { id: perguntas[i].id },
                data: { status: 'rejeitada' }
            });
        }
        console.log('❌ 2 rejeitadas');
        console.log('⏳ Restantes pendentes\n');

        // Contar
        const counts = await Promise.all([
            prisma.pergunta.count({ where: { palestraId, status: 'aprovada' } }),
            prisma.pergunta.count({ where: { palestraId, status: 'pendente' } }),
            prisma.pergunta.count({ where: { palestraId, status: 'rejeitada' } })
        ]);

        console.log('RESULTADO FINAL:');
        console.log(`✅ Aprovadas: ${counts[0]}`);
        console.log(`⏳ Pendentes: ${counts[1]}`);
        console.log(`❌ Rejeitadas: ${counts[2]}`);

    } finally {
        await prisma.$disconnect();
    }
}

resetarEPreparar();
