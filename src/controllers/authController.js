import prisma from '../lib/prisma.js'; 
import bcrypt from 'bcryptjs';
import { buscarParticipanteEven3PorEmail } from '../services/syncEven3.js';

// Rota de Cadastro de Senha 
export const cadastrarSenha = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    // 1. Verifica se o usuário existe na base (veio do Even3)
    let usuario = await prisma.participante.findUnique({
      where: { email: email }
    });

    // Se não existe localmente, tenta buscar no Even3 e sincronizar
    if (!usuario) {
      console.log(`Participante ${email} não encontrado localmente. Buscando no Even3...`);
      usuario = await buscarParticipanteEven3PorEmail(email);
      
      if (!usuario) {
        return res.status(401).json({ error: "Este e-mail não está inscrito no evento." });
      }
      
      console.log(`Participante ${email} sincronizado do Even3`);
    }

    // 2. Verifica se ele já tem senha (já fez o cadastro antes)
    if (usuario.senha) {
      return res.status(400).json({ error: "Usuário já possui senha cadastrada. Faça login." });
    }

    // 3. Criptografa a senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash(senha, salt);

    // 4. Atualiza o usuário com a nova senha
    await prisma.participante.update({
      where: { email: email },
      data: { senha: hashSenha }
    });

    return res.status(201).json({ message: "Senha cadastrada com sucesso! Agora você pode logar." });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao cadastrar senha." });
  }
};

//Rota de Login
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    // 1. Busca usuário
    let usuario = await prisma.participante.findUnique({
      where: { email: email }
    });

    // Se não existe localmente, tenta buscar no Even3 e sincronizar
    if (!usuario) {
      console.log(`Participante ${email} não encontrado localmente. Buscando no Even3...`);
      usuario = await buscarParticipanteEven3PorEmail(email);
      
      if (!usuario) {
        return res.status(401).json({ error: "Usuário não encontrado." });
      }
      
      console.log(`Participante ${email} sincronizado do Even3`);
    }

    // 2. Se não tem senha cadastrada
    if (!usuario.senha) {
      return res.status(403).json({ 
        error: "Primeiro acesso detectado.", 
        code: "FIRST_ACCESS" // O Frontend usa esse código para enviar o usuário para a tela de criar senha
      });
    }

    // 3. Compara a senha digitada com a criptografada no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    // 4. Sucesso! (Remove a senha do objeto de retorno por segurança)
    const { senha: _, ...dadosUsuario } = usuario;

    // role sempre existirá
    const role = dadosUsuario.role || 'user';

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      usuario: {
        id: dadosUsuario.id,
        even3Id: dadosUsuario.even3Id,
        nome: dadosUsuario.nome,
        email: dadosUsuario.email,
        role,                      
        isAdmin: role === 'admin', // campo derivado para facilitar no front
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro no servidor." });
  }
};