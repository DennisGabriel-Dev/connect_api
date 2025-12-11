// Script para converter dataHora de String para Date no MongoDB
// O problema: campo armazenado como "2025-12-11T03:22:55.516Z" (string)
// A solução: converter para ISODate("2025-12-11T03:22:55.516Z")

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function corrigirDataHoraPerguntas() {
    const client = new MongoClient(process.env.DATABASE_URL);

    try {
        await client.connect();
        console.log('✅ Conectado ao MongoDB');

        const db = client.db();
        const perguntasCollection = db.collection('perguntas');

        // Buscar todas as perguntas onde dataHora é string
        const perguntasComStringData = await perguntasCollection.find({
            dataHora: { $type: 'string' }
        }).toArray();

        console.log(`📊 Encontradas ${perguntasComStringData.length} perguntas com dataHora como string`);

        if (perguntasComStringData.length === 0) {
            console.log('✨ Nenhuma pergunta precisa ser corrigida!');
            return;
        }

        // Converter cada uma
        let corrigidas = 0;
        for (const pergunta of perguntasComStringData) {
            try {
                const dataComoObjeto = new Date(pergunta.dataHora);

                await perguntasCollection.updateOne(
                    { _id: pergunta._id },
                    { $set: { dataHora: dataComoObjeto } }
                );

                corrigidas++;
                console.log(`✅ Corrigida: ${pergunta._id} - ${pergunta.dataHora} → ${dataComoObjeto.toISOString()}`);
            } catch (error) {
                console.error(`❌ Erro ao corrigir ${pergunta._id}:`, error.message);
            }
        }

        console.log(`\n🎉 Total corrigidas: ${corrigidas} de ${perguntasComStringData.length}`);

        // Verificar se ainda restam strings
        const restantes = await perguntasCollection.countDocuments({
            dataHora: { $type: 'string' }
        });

        if (restantes === 0) {
            console.log('✨ Todas as perguntas foram corrigidas com sucesso!');
        } else {
            console.log(`⚠️  Ainda restam ${restantes} perguntas com problema`);
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await client.close();
        console.log('🔌 Conexão fechada');
    }
}

corrigirDataHoraPerguntas();
