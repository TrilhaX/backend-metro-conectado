const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
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

app.post('/users/register', (req, res) => {
  const { id, nome, email, senha, telefone, plano } = req.body;
  if (!id || !nome || !email || !senha || !telefone || !plano) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }
  if (usuarios.some(u => u.email === email)) {
    return res.status(400).json({ erro: 'Email já cadastrado' });
  }
  usuarios.push({ id, nome, email, senha, telefone, plano });
  return res.status(201).json({ mensagem: 'Usuário registrado com sucesso' });
});

app.get('/users/all', (_req, res) => res.json(usuarios));

app.get('/users/:id', (req, res) => {
  const usuario = usuarios.find(u => u.id === req.params.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  // Adiciona URLs completas para imagens, se existirem
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const userCopy = { ...usuario };
  ['fotoPerfil', 'fotoFundo'].forEach(key => {
    if (userCopy[key]) userCopy[key] = `${baseUrl}${userCopy[key]}`;
  });
  return res.json(userCopy);
});

app.post('/users/update/:id', upload.single('imagem'), (req, res) => {
  const userId = req.params.id;
  const usuario = usuarios.find(u => u.id === userId);
  if (!usuario) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }
  const tipo = req.body.tipo;
  if (!req.file || !['fotoPerfil', 'fotoFundo'].includes(tipo)) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ erro: 'Dados inválidos' });
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
  return res.json({ mensagem: 'Imagem atualizada com sucesso', usuario: usuarioRetorno });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
