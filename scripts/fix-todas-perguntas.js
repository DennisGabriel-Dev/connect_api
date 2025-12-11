// Script DEFINITIVO para corrigir TODOS os problemas de dataHora
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function corrigirTodasAsPerguntas() {
    const client = new MongoClient(process.env.DATABASE_URL);

    try {
        await client.connect();
        console.log('✅ Conectado ao MongoDB\n');

        const db = client.db();
        const perguntasCollection = db.collection('perguntas');

        // 1. Buscar TODAS as perguntas
        const todasPerguntas = await perguntasCollection.find({}).toArray();
        console.log(`📊 Total de perguntas no banco: ${todasPerguntas.length}\n`);

        let corrigidas = 0;
        let erros = 0;

        for (const pergunta of todasPerguntas) {
            try {
                const updates = {};
                let precisaAtualizar = false;

                // Verificar e corrigir dataHora
                if (!pergunta.dataHora) {
                    // Se não tem dataHora, usar data atual
                    updates.dataHora = new Date();
                    precisaAtualizar = true;
                    console.log(`⚠️  ${pergunta._id}: dataHora estava NULL → usando data atual`);
                } else if (typeof pergunta.dataHora === 'string') {
                    // Se é string, converter para Date
                    updates.dataHora = new Date(pergunta.dataHora);
                    precisaAtualizar = true;
                    console.log(`🔄 ${pergunta._id}: dataHora era STRING → convertido para Date`);
                }

                // Verificar e corrigir status (se não tiver, usar 'pendente')
                if (!pergunta.status) {
                    updates.status = 'pendente';
                    precisaAtualizar = true;
                    console.log(`⚠️  ${pergunta._id}: status estava NULL → definido como 'pendente'`);
                }

                // Aplicar correções se necessário
                if (precisaAtualizar) {
                    await perguntasCollection.updateOne(
                        { _id: pergunta._id },
                        { $set: updates }
                    );
                    corrigidas++;
                }

            } catch (error) {
                console.error(`❌ Erro ao corrigir ${pergunta._id}:`, error.message);
                erros++;
            }
        }

        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`✅ Perguntas corrigidas: ${corrigidas}`);
        console.log(`❌ Erros: ${erros}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

        // Verificação final
        const comProblemas = await perguntasCollection.countDocuments({
            $or: [
                { dataHora: null },
                { dataHora: { $type: 'string' } },
                { status: null }
            ]
        });

        if (comProblemas === 0) {
            console.log('🎉 SUCESSO! Todas as perguntas estão corretas!');
        } else {
            console.log(`⚠️  Ainda existem ${comProblemas} perguntas com problemas`);
        }

    } catch (error) {
        console.error('❌ Erro fatal:', error);
    } finally {
        await client.close();
        console.log('\n🔌 Conexão fechada');
    }
}

corrigirTodasAsPerguntas();
