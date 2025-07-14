const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const usuarios = [];
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}


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
    storage: storage,
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

    const tipo = req.body.tipo;
    if (!req.file || (tipo !== 'fotoPerfil' && tipo !== 'fotoFundo')) {
        return res.status(400).json({ erro: 'Dados inválidos' });
    }
    if (usuario[tipo] && fs.existsSync(usuario[tipo].replace('http://https://backend-metro-conectado.onrender.com/', ''))) {
        fs.unlinkSync(usuario[tipo].replace('http://https://backend-metro-conectado.onrender.com/', ''));
    }
    usuario[tipo] = `https://backend-metro-conectado.onrender.com/uploads/${req.file.filename}`;
    res.json({ mensagem: 'Imagem atualizada com sucesso', usuario });
});

app.listen(port, () => {
    res.status(200)
});
