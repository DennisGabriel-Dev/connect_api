import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const EVEN3_TOKEN = process.env.EVEN3_TOKEN;

async function syncDados() {
  console.log("Sincronizando");

  if (!EVEN3_TOKEN) {
    console.error("ERRO: Token não encontrado no .env");
    return;
  }

  try {
    // 1. Participantes
    console.log("Buscando participantes...");
    const respParticipantes = await axios.get('https://www.even3.com.br/api/v1/attendees', {
      headers: { 'Authorization-Token': EVEN3_TOKEN }
    });
    
    for (const p of respParticipantes.data.data || []) {
      await prisma.participante.upsert({
        where: { even3Id: p.id_attendees },
        update: { nome: p.name, email: p.email, foto: p.photo },
        create: { even3Id: p.id_attendees, nome: p.name, email: p.email, foto: p.photo }
      });
    }
    console.log(`Participantes sincronizados.`);

    // 2. Palestras
    console.log("Buscando palestras...");
    const respSessoes = await axios.get('https://www.even3.com.br/api/v1/session', {
      headers: { 'Authorization-Token': EVEN3_TOKEN }
    });
    
    for (const s of respSessoes.data.data || []) {
      
      const horariosMapped = s.times ? s.times.map(t => {

        // O campo 'date' vem como "2025-12-26T00:00:00".
        const dataApenas = t.date ? t.date.split('T')[0] : null; 
        
        let inicioIso = null;
        let fimIso = null;

        if (dataApenas && t.start_time) {
          inicioIso = `${dataApenas}T${t.start_time}:00`;
        }
        
        if (dataApenas && t.end_time) {
          fimIso = `${dataApenas}T${t.end_time}:00`;
        }

        return {
          id_time: t.id_time,
          date_start: inicioIso, 
          date_end: fimIso
        };
      }) : [];

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
          horarios: horariosMapped,
          palestrantes: speakersMapped
        },
        create: {
          even3Id: s.id_session,
          titulo: s.title,
          descricao: s.description,
          tipo: s.type,
          local: s.venue,
          horarios: horariosMapped,
          palestrantes: speakersMapped
        }
      });
    }
    console.log(`Palestras sincronizadas.`);

  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncDados();