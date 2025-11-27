import prisma from '../lib/prisma.js'; 
import bcrypt from 'bcryptjs';

// Rota de Cadastro de Senha 
export const cadastrarSenha = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    // 1. Verifica se o usuário existe na base (veio do Even3)
    const usuario = await prisma.participante.findUnique({
      where: { email: email }
    });

    if (!usuario) {
      return res.status(401).json({ error: "Este e-mail não está inscrito no evento." });
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
    const usuario = await prisma.participante.findUnique({
      where: { email: email }
    });

    // 2. Se não existe ou não tem senha cadastrada
    if (!usuario) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

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

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      usuario: dadosUsuario
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro no servidor." });
  }
};