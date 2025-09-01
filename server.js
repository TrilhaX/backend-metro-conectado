const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });
const usuarios = [];

app.post('/auth/register', async (req, res) => {
  const { nome, email, senha, telefone } = req.body;
  
  if (!nome || !email || !senha || !telefone) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  if (usuarios.some(u => u.email === email)) {
    return res.status(409).json({ message: 'Email já cadastrado' });
  }

  try {
    const hashedPassword = await bcrypt.hash(senha, 10);
    const novoUsuario = {
      id: uuidv4(),
      nome,
      email,
      telefone,
      plano: 'basico',
      senha: hashedPassword
    };
    
    usuarios.push(novoUsuario);
    console.log('Novo usuário registrado:', novoUsuario);

    const usuarioRetorno = {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      telefone: novoUsuario.telefone,
      plano: novoUsuario.plano
    };
    
    return res.status(201).json({ message: 'Usuário registrado com sucesso', user: usuarioRetorno });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  const usuario = usuarios.find(u => u.email === email);
  if (!usuario) {
    return res.status(400).json({ message: 'Email ou senha incorretos' });
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
  if (!senhaCorreta) {
    return res.status(400).json({ message: 'Email ou senha incorretos' });
  }

  const usuarioLogado = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    plano: usuario.plano,
    fotoPerfil: usuario.fotoPerfil || null,
    fotoFundo: usuario.fotoFundo || null
  };

  return res.json(usuarioLogado);
});

app.get('/users/all', (_req, res) => res.json(usuarios.map(u => {
  const { senha, ...resto } = u;
  return resto;
})));

app.get('/users/:id', (req, res) => {
  const usuario = usuarios.find(u => u.id === req.params.id);
  if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });
  
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const userCopy = { ...usuario };
  delete userCopy.senha;
  
  if (userCopy.fotoPerfil) userCopy.fotoPerfil = `${baseUrl}${userCopy.fotoPerfil}`;
  if (userCopy.fotoFundo) userCopy.fotoFundo = `${baseUrl}${userCopy.fotoFundo}`;
  
  return res.json(userCopy);
});

app.post('/users/update/:id', upload.single('imagem'), (req, res) => {
  const userId = req.params.id;
  const usuario = usuarios.find(u => u.id === userId);
  if (!usuario) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }
  const tipo = req.body.tipo;
  if (!req.file || !['fotoPerfil', 'fotoFundo'].includes(tipo)) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: 'Dados inválidos' });
  }
  if (usuario[tipo]) {
    const oldPath = path.join(uploadDir, path.basename(usuario[tipo]));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  usuario[tipo] = `/uploads/${req.file.filename}`;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const usuarioRetorno = {
    ...usuario,
    fotoPerfil: usuario.fotoPerfil ? `${baseUrl}${usuario.fotoPerfil}` : null,
    fotoFundo: usuario.fotoFundo ? `${baseUrl}${usuario.fotoFundo}` : null
  };
  return res.json({ message: 'Imagem atualizada com sucesso', usuario: usuarioRetorno });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
