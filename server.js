const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para entender JSON
app.use(express.json());

app.get('/users', (req, res) => {
    res.send('Servidor funcionando!');
});

app.post('/users/register', (req, res) => {
    const { nome, email, senha, telefone } = req.body;

    // Mostrar o JSON recebido no console
    console.log('JSON recebido:', req.body);

    if (!nome || !email || !senha || !telefone) {
        return res.status(400).json({ erro: 'Todos os dados são obrigatórios' });
    }

    console.log(`Novo usuário: ${nome} - ${email}, ${telefone}, ${senha}`);

    
    res.status(201).json({
        mensagem: 'Usuário criado com sucesso',
        usuario: { nome, email }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});