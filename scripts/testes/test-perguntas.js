import 'dotenv/config';
import prisma from './src/lib/prisma.js';

async function testar() {
    try {
        console.log('Buscando perguntas da Palestra 3...');

        // Buscar todas as perguntas
        const todasPerguntas = await prisma.pergunta.findMany({
            where: { palestraId: '693736a2346686b58c2c69e8' },
            select: {
                id: true,
                texto: true,
                status: true
            }
        });

        console.log(`\nTotal de perguntas: ${todasPerguntas.length}`);
        console.log('\nStatus das perguntas:');
        todasPerguntas.forEach((p, idx) => {
            const texto = p.texto.substring(0, 30);
            console.log(`${idx + 1}. ${p.status || 'NULL'} | ${texto}...`);
        });

        // Buscar apenas aprovadas
        const aprovadas = await prisma.pergunta.findMany({
            where: {
                palestraId: '693736a2346686b58c2c69e8',
                status: 'aprovada'
            },
            select: {
                id: true,
                texto: true,
                status: true
            }
        });

        console.log(`\n✅ Perguntas APROVADAS: ${aprovadas.length}`);
        aprovadas.forEach((p, idx) => {
            const texto = p.texto.substring(0, 30);
            console.log(`  ${idx + 1}. ${texto}...`);
        });

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testar();
