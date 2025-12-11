import 'dotenv/config';
import prisma from '../../src/lib/prisma.js';

async function diagnostico() {
    try {
        console.log('🔍 Diagnóstico do Banco de Dados\n');

        // Contar perguntas
        const totalPerguntas = await prisma.pergunta.count();
        console.log(`📊 Total de perguntas: ${totalPerguntas}`);

        if (totalPerguntas === 0) {
            console.log('\n❌ PROBLEMA: Banco de dados sem perguntas!');
            console.log('\n💡 SOLUÇÕES:');
            console.log('1. Execute: node scripts/testes/preparar-dados-teste.js');
            console.log('2. Ou crie perguntas manualmente pelo app');
            console.log('3. Ou volte para o banco anterior no .env\n');
        } else {
            // Mostrar breakdown por status
            const aprovadas = await prisma.pergunta.count({ where: { status: 'aprovada' } });
            const pendentes = await prisma.pergunta.count({ where: { status: 'pendente' } });
            const rejeitadas = await prisma.pergunta.count({ where: { status: 'rejeitada' } });

            console.log(`\n✅ Aprovadas: ${aprovadas}`);
            console.log(`⏳ Pendentes: ${pendentes}`);
            console.log(`❌ Rejeitadas: ${rejeitadas}`);
        }

        // Contar palestras
        const totalPalestras = await prisma.palestra.count();
        console.log(`\n🎤 Total de palestras/atividades: ${totalPalestras}`);

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

diagnostico();
