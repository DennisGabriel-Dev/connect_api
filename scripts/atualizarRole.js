import 'dotenv/config';
import prisma from '../src/lib/prisma.js';

async function atualizarRole() {
  try {
    const email = 'igorsonic56@gmail.com';
    const novoRole = 'admin'; // ou 'user'

    console.log(`Buscando usuário com email: ${email}...`);

    // Verifica se o usuário existe
    const usuario = await prisma.participante.findUnique({
      where: { email: email }
    });

    if (!usuario) {
      console.error(`❌ Usuário com email ${email} não encontrado!`);
      process.exit(1);
    }

    console.log(`✅ Usuário encontrado: ${usuario.nome}`);
    console.log(`   Role atual: ${usuario.role || 'não definido'}`);

    // Atualiza o role
    const usuarioAtualizado = await prisma.participante.update({
      where: { email: email },
      data: { role: novoRole }
    });

    console.log(`\n✅ Role atualizado com sucesso!`);
    console.log(`   Novo role: ${usuarioAtualizado.role}`);
    console.log(`   Email: ${usuarioAtualizado.email}`);
    console.log(`   Nome: ${usuarioAtualizado.nome}`);

  } catch (error) {
    console.error('❌ Erro ao atualizar role:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

atualizarRole();

