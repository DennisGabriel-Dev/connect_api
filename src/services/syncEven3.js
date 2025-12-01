import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const EVEN3_TOKEN = process.env.EVEN3_TOKEN;

async function syncDados() {
  console.log("Sincronizando...");

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
        // CORREÇÃO: Removido 'foto: p.photo'
        update: { nome: p.name, email: p.email },
        create: { even3Id: p.id_attendees, nome: p.name, email: p.email }
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
        // CORREÇÃO: Removido 'foto: sp.photo'
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

// Funções para presença em tempo real

// Buscar participante no Even3 por email
export async function buscarParticipanteEven3PorEmail(email) {
  try {
    // Busca todos os participantes no Even3
    console.log(`Buscando participante com email ${email} no Even3...`);
    const response = await axios.get('https://www.even3.com.br/api/v1/attendees', {
      headers: { 'Authorization-Token': EVEN3_TOKEN }
    });

    // Procura o participante pelo email
    const participanteEven3 = response.data.data?.find(
      p => p.email?.toLowerCase() === email?.toLowerCase()
    );

    if (!participanteEven3) {
      console.log(`Participante com email ${email} não encontrado no Even3`);
      return null;
    }

    // Usa upsert em vez de create para evitar erro de duplicação (race condition)
    const participante = await prisma.participante.upsert({
      where: { even3Id: participanteEven3.id_attendees },
      update: {
        nome: participanteEven3.name,
        email: participanteEven3.email,
      },
      create: {
        even3Id: participanteEven3.id_attendees,
        nome: participanteEven3.name,
        email: participanteEven3.email,
      }
    });

    console.log(`Participante ${email} sincronizado do Even3`);
    return participante;

  } catch (error) {
    console.error('Erro ao buscar participante no Even3:', error.message);
    return null;
  }
}

// Registrar presença no Even3 (AMBOS os check-ins)
export async function registrarPresencaEven3(even3AttendeesId, even3SessionId, tipo = 'atividade') {
  try {
    // PASSO 1: Credenciar no evento geral
    console.log(`Credenciando participante ${even3AttendeesId} no evento geral...`);
    await credenciarEventoGeral(even3AttendeesId);
    
    const response = await axios.post(
      'https://www.even3.com.br/api/v1/checkin/sessions',
      {
        id_attendees: even3AttendeesId,
        id_session: even3SessionId
      },
      {
        headers: { 
          'Authorization-Token': EVEN3_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Check-in na atividade registrado com sucesso');
    return { sucesso: true };

  } catch (error) {
    if (error.response) {
      // Erro de resposta do servidor (4xx, 5xx)
      console.error('Erro Even3 — status:', error.response.status, 'detalhes:', error.response.data);
    } else if (error.request) {
      // Requisição enviada, mas sem resposta (rede, timeout, CORS, etc.)
      console.error('Erro de rede/timeout ao tentar conectar Even3:', error.request);
    } else {
      // Erro inesperado na configuração da requisição
      console.error('Erro inesperado:', error.message);
    }
  }
}

// Credenciar no evento geral
async function credenciarEventoGeral(even3AttendeesId) {
  try {
    const response = await axios.post(
      'https://www.even3.com.br/api/v1/checkin/attendees',
      {
        id_attendees: even3AttendeesId
      },
      {
        headers: { 
          'Authorization-Token': EVEN3_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Participante credenciado no evento geral');
    return true;
  } catch (error) {
    if (error.response) {
      // Erro de resposta do servidor (4xx, 5xx)
      console.error('Erro Even3 — status:', error.response.status, 'detalhes:', error.response.data);
    } else if (error.request) {
      // Requisição enviada, mas sem resposta (rede, timeout, CORS, etc.)
      console.error('Erro de rede/timeout ao tentar conectar Even3:', error.request);
    } else {
      // Erro inesperado na configuração da requisição
      console.error('Erro inesperado:', error.message);
    }
  }
}

syncDados();