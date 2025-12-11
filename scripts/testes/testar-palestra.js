import 'dotenv/config';
import prisma from '../../src/lib/prisma.js';

async function testarPalestra() {
    const palestraId = '692c50381a3973d085ddd448';

    try {
        console.log(`🔍 Testando palestraId: ${palestraId}\n`);

        // Verificar se a palestra existe
        const palestra = await prisma.palestra.findUnique({
            where: { id: palestraId }
        });

        if (!palestra) {
            console.log('❌ Palestra NÃO encontrada!');
            console.log('Esse ID não existe no banco de dados.\n');
            return;
        }

        console.log(`✅ Palestra encontrada: "${palestra.titulo}"\n`);

        // Buscar perguntas dessa palestra
        const perguntas = await prisma.pergunta.findMany({
            where: { palestraId }
        });

        console.log(`📊 Total de perguntas: ${perguntas.length}`);

        if (perguntas.length > 0) {
            // Breakdown por status
            const aprovadas = perguntas.filter(p => p.status === 'aprovada').length;
            const pendentes = perguntas.filter(p => p.status === 'pendente').length;
            const rejeitadas = perguntas.filter(p => p.status === 'rejeitada').length;

            console.log(`  ✅ Aprovadas: ${aprovadas}`);
            console.log(`  ⏳ Pendentes: ${pendentes}`);
            console.log(`  ❌ Rejeitadas: ${rejeitadas}\n`);

            // Tentar buscar com include (como o service faz)
            console.log('🔧 Testando query completa (com includes)...');
            try {
                const perguntasCompletas = await prisma.pergunta.findMany({
                    where: {
                        palestraId,
                        status: 'aprovada'
                    },
                    include: {
                        participante: {
                            select: { nome: true, id: true }
                        },
                        palestra: {
                            select: { titulo: true }
                        },
                        votos: {
                            select: { participanteId: true }
                        }
                    }
                });

                console.log(`✅ Query completa funcionou! ${perguntasCompletas.length} aprovadas`);

                if (perguntasCompletas.length > 0) {
                    console.log('\nPrimeira pergunta:');
                    const p = perguntasCompletas[0];
                    console.log(`  - Texto: ${p.texto.substring(0, 50)}...`);
                    console.log(`  - Participante: ${p.participante.nome}`);
                    console.log(`  - Status: ${p.status}`);
                }
            } catch (error) {
                console.log('❌ ERRO na query completa:', error.message);
                console.log('\nProblema:', error.message);
            }
        } else {
            console.log('\n💡 Não há perguntas para esta palestra.');
            console.log('Crie algumas perguntas pelo app primeiro!');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testarPalestra();
