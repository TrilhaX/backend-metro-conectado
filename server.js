const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 4000;

// Configurações do Multer para arquivos em memória (limitando para segurança)
const upload = multer({
    limits: { fileSize: 2 * 1024 * 1024 } // Limite: 2MB
});

app.use(cors());
app.use(express.json());

// Simulação de banco de dados em memória
const usuarios = [];

// Verificação inicial
app.get('/users', (req, res) => {
    res.send('Servidor funcionando!');
});

// Registro de novo usuário
app.post('/users/register', (req, res) => {
    const { id, nome, email, senha, telefone, plano } = req.body;

    console.log('JSON recebido:', req.body);

    if (!id || !nome || !email || !senha || !telefone || !plano) {
        return res.status(400).json({ erro: 'Todos os dados são obrigatórios' });
    }

    const usuarioExistente = usuarios.find(user => user.email === email);
    if (usuarioExistente) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    usuarios.push({ id, nome, email, senha, telefone, plano });

    console.log(`Novo usuário cadastrado: ${nome} - ${email}`);

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso' });
});

// Retorna todos os usuários
app.get('/users/all', (req, res) => {
    res.json(usuarios);
});

// Atualização de imagem (perfil ou fundo)
app.post('/users/update/:id', upload.any(), (req, res) => {
    const userId = req.params.id;
    const usuarioIndex = usuarios.findIndex(u => u.id === userId);

    if (usuarioIndex === -1) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const usuario = usuarios[usuarioIndex];
    const file = req.files?.[0];

    if (!file) {
        return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
    }

    const field = file.fieldname; // Deve ser 'fotoPerfil' ou 'fotoFundo'
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    if (field === 'fotoPerfil' || field === 'fotoFundo') {
        usuario[field] = base64;
        console.log(`Imagem atualizada: ${field} para usuário ${usuario.nome}`);
        return res.json({ mensagem: 'Imagem atualizada com sucesso', usuario });
    } else {
        return res.status(400).json({ erro: 'Campo inválido para imagem' });
    }
});

app.listen(port, () => {
    console.log(`✅ Servidor rodando em http://localhost:${port}`);
});
