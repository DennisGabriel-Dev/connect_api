import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function converterDataHoraParaDate() {
    const MONGO_URL = process.env.DATABASE_URL;

    if (!MONGO_URL) {
        console.error('❌ DATABASE_URL não encontrado no .env');
        return;
    }

    const client = new MongoClient(MONGO_URL);

    try {
        await client.connect();
        console.log('✅ Conectado ao MongoDB\n');

        const db = client.db();
        const collection = db.collection('perguntas');

        // Buscar perguntas com dataHora como string
        const perguntasComStringDate = await collection.find({
            dataHora: { $type: 'string' }
        }).toArray();

        console.log(`Encontradas ${perguntasComStringDate.length} perguntas com dataHora como string\n`);

        if (perguntasComStringDate.length > 0) {
            let atualizadas = 0;

            for (const pergunta of perguntasComStringDate) {
                // Converter string ISO para Date
                const dataObj = new Date(pergunta.dataHora);

                await collection.updateOne(
                    { _id: pergunta._id },
                    { $set: { dataHora: dataObj } }
                );

                atualizadas++;
                console.log(`✅ ${atualizadas}/${perguntasComStringDate.length} - Convertida: ${pergunta.texto.substring(0, 40)}...`);
            }

            console.log(`\n🎉 Total atualizado: ${atualizadas} perguntas`);
            console.log('\n✅ Agora o Prisma Studio e a API devem funcionar!');
        } else {
            console.log('✅ Nenhuma pergunta com problema encontrada!');
        }

        // Verificar se ainda há problemas
        const comNull = await collection.countDocuments({ dataHora: null });
        const comString = await collection.countDocuments({ dataHora: { $type: 'string' } });

        console.log('\n📊 Status final:');
        console.log(`  - Perguntas com dataHora null: ${comNull}`);
        console.log(`  - Perguntas com dataHora string: ${comString}`);

        if (comNull === 0 && comString === 0) {
            console.log('\n✅ Tudo OK! Banco de dados corrigido.');
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await client.close();
    }
}

converterDataHoraParaDate();
