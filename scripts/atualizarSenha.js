import 'dotenv/config';
import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcryptjs';

async function atualizarSenha() {
  try {
    const email = 'cruzdavi001@gmail.com'; // ⬅️ ALTERE AQUI
    const novaSenha = '123456'; // ⬅️ ALTERE AQUI

    console.log(`Buscando usuário com email: ${email}...`);

    // Verifica se o usuário existe
    const usuario = await prisma.participante.findUnique({
      where: { email: email }
    });

    if (!usuario) {
      console.error(`Usuário com email ${email} não encontrado!`);
      process.exit(1);
    }

    console.log(`Usuário encontrado: ${usuario.nome}`);
    console.log(`Email: ${usuario.email}`);

    // Hash da nova senha
    console.log(`\nGerando hash da senha...`);
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualiza a senha
    const usuarioAtualizado = await prisma.participante.update({
      where: { email: email },
      data: { senha: senhaHash }
    });

    console.log(`\nSenha atualizada com sucesso!`);
    console.log(`   Nome: ${usuarioAtualizado.nome}`);
    console.log(`   Email: ${usuarioAtualizado.email}`);
    console.log(`\nNão esqueça de fazer login com a nova senha!`);

  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

atualizarSenha();
