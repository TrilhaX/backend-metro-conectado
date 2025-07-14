const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Simulação de banco de dados em memória
const usuarios = [];

app.get('/users', (req, res) => {
    res.send('Servidor funcionando!');
});

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

app.get('/users/all', (req, res) => {
    res.json(usuarios);
});

// Endpoint para atualizar dados de usuário pelo id
app.post('/users/update/:id', (req, res) => {
    const userId = req.params.id;
    const { nome, email, telefone, plano, fotoPerfil, fotoFundo } = req.body;

    const usuarioIndex = usuarios.findIndex(u => u.id === userId);
    if (usuarioIndex === -1) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Atualiza somente os campos que vieram na requisição
    if (nome) usuarios[usuarioIndex].nome = nome;
    if (email) usuarios[usuarioIndex].email = email;
    if (telefone) usuarios[usuarioIndex].telefone = telefone;
    if (plano) usuarios[usuarioIndex].plano = plano;
    if (fotoPerfil) usuarios[usuarioIndex].fotoPerfil = fotoPerfil;
    if (fotoFundo) usuarios[usuarioIndex].fotoFundo = fotoFundo;

    res.json({ mensagem: 'Usuário atualizado com sucesso', usuario: usuarios[usuarioIndex] });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});