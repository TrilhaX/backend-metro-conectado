const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000 

app.use(cors());
app.use(express.json());
const usuarios = [];

app.get('/users', (req, res) => {
    res.send('Servidor funcionando!');
});

app.post('/users/register', (req, res) => {
    const { id, nome, email, senha, telefone, plano } = req.body;

    console.log('JSON recebido:', req.body);

    // Verificação básica se nao tem nada faltando
    if (!id || !nome || !email || !senha || !telefone || !plano) {
        return res.status(400).json({ erro: 'Todos os dados são obrigatórios' });
    }

    // Verifica se o email já foi cadastrado no bd
    const usuarioExistente = usuarios.find(user => user.email === email);
    if (usuarioExistente) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    // Armazena o usuário completo, com ID e plano
    usuarios.push({ id, nome, email, senha, telefone, plano });

    console.log(`Novo usuário cadastrado: ${nome} - ${email}`);

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso' });
});

// chamada de todos os usuarios com info completa
app.get('/users/all', (req, res) => {
    res.json(usuarios);
});

// abrindo o bd
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
