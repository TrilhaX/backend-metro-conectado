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
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));
const usuarios = [];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nomeUnico = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        cb(null, nomeUnico);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }
});

app.get('/users', (req, res) => {
    res.send('Servidor funcionando!');
});

app.post('/users/register', (req, res) => {
    const { id, nome, email, senha, telefone, plano } = req.body;
    if (!id || !nome || !email || !senha || !telefone || !plano) {
        return res.status(400).json({ erro: 'Todos os dados são obrigatórios' });
    }
    const usuarioExistente = usuarios.find(user => user.email === email);
    if (usuarioExistente) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    usuarios.push({ id, nome, email, senha, telefone, plano });
    res.status(201).json({ mensagem: 'Usuário registrado com sucesso' });
});

app.get('/users/all', (req, res) => {
    res.json(usuarios);
});

app.post('/users/update/:id', upload.single('imagem'), (req, res) => {
    const userId = req.params.id;
    const usuario = usuarios.find(u => u.id === userId);

    if (!usuario) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const tipo = req.body.tipo; // 'fotoPerfil' ou 'fotoFundo'
    if (!req.file || (tipo !== 'fotoPerfil' && tipo !== 'fotoFundo')) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ erro: 'Dados inválidos' });
    }

    if (usuario[tipo]) {
        const caminhoAntigo = path.join(__dirname, usuario[tipo]);
        if (fs.existsSync(caminhoAntigo)) {
            fs.unlinkSync(caminhoAntigo);
        }
    }

    usuario[tipo] = `/uploads/${req.file.filename}`;
    res.json({ mensagem: 'Imagem atualizada com sucesso', usuario });
});

app.listen(port, () => {
    res.status(200)
});
