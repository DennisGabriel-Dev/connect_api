import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config'; 

const prisma = new PrismaClient();

const EVEN3_TOKEN = process.env.EVEN3_TOKEN; 

async function syncDados() {
  console.log("Iniciando sincronização com Even3...");

  if (!EVEN3_TOKEN) {
    console.error("ERRO: A variável EVEN3_TOKEN não está definida no arquivo .env");
    return;
  }

  try {
    // 1. Buscar e Salvar Participantes (para o Login)
    console.log("Buscando participantes...");
    const respParticipantes = await axios.get('https://www.even3.com.br/api/v1/attendees', {
      headers: { 'Authorization-Token': EVEN3_TOKEN }
    });

    const listaParticipantes = respParticipantes.data.data || [];

    for (const p of listaParticipantes) {
      await prisma.participante.upsert({
        where: { even3Id: p.id_attendees },
        update: { nome: p.name, email: p.email, foto: p.photo },
        create: {
          even3Id: p.id_attendees,
          nome: p.name,
          email: p.email,
          foto: p.photo
        }
      });
    }
    console.log(`${listaParticipantes.length} participantes sincronizados.`);

    // 2. Buscar e Salvar Palestras
    console.log("Buscando palestras...");
    const respSessoes = await axios.get('https://www.even3.com.br/api/v1/session', {
      headers: { 'Authorization-Token': EVEN3_TOKEN }
    });

    const listaSessoes = respSessoes.data.data || [];

    for (const s of listaSessoes) {
      // Mapeia os palestrantes
      const speakersMapped = s.speakers ? s.speakers.map(sp => ({
        even3Id: sp.id_speaker,
        nome: sp.name,
        foto: sp.photo,
        bio: sp.resume
      })) : [];

      await prisma.palestra.upsert({
        where: { even3Id: s.id_session },
        update: {
          titulo: s.title,
          descricao: s.description,
          tipo: s.type, 
          local: s.venue,
          palestrantes: speakersMapped
        },
        create: {
          even3Id: s.id_session,
          titulo: s.title,
          descricao: s.description,
          tipo: s.type,
          local: s.venue,
          palestrantes: speakersMapped
        }
      });
    }
    console.log(` ${listaSessoes.length} palestras sincronizadas.`);

  } catch (error) {
    console.error(" Erro na sincronização:", error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

syncDados();