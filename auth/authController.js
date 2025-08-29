import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import fs from 'fs';
import path from 'path';

dotenv.config();
const saltRounds = 10;

// Pegar todos os usuários
export const getAllUsers = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, nome, email, telefone, plano_id FROM usuarios');
        return res.status(200).json(rows);
    } catch (err) {
        return res.status(500).json({ mensagem: `Erro no servidor, ${err}` });
    }
};

// Pegar usuário por ID
export const getUserById = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });

        const usuario = rows[0];
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        ['fotoPerfil', 'fotoFundo'].forEach(key => {
            if (usuario[key]) usuario[key] = `${baseUrl}${usuario[key]}`;
        });
        return res.json(usuario);
    } catch (err) {
        return res.status(500).json({ mensagem: 'Erro no servidor' });
    }
};

// Atualizar foto de perfil ou fundo
export const updatePerfilUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userId]);
        if (rows.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        const usuario = rows[0];
        const tipo = req.body.tipo;

        if (!req.file || !['fotoPerfil', 'fotoFundo'].includes(tipo)) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ erro: 'Dados inválidos' });
        }

        if (usuario[tipo]) {
            const oldPath = path.join('uploads', path.basename(usuario[tipo]));
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        const novoCaminho = `/uploads/${req.file.filename}`;
        await pool.query(`UPDATE usuarios SET ${tipo} = $1 WHERE id = $2`, [novoCaminho, userId]);

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        usuario[tipo] = `${baseUrl}${novoCaminho}`;

        return res.json({ mensagem: 'Imagem atualizada com sucesso', usuario });
    } catch (err) {
        return res.status(500).json({ mensagem: 'Erro no servidor' });
    }
};

// Registrar novo usuário
// Registrar novo usuário
export const register = async (req, res) => {
    const { nome, email, senha, telefone } = req.body;
    const plano_id = '11111111-1111-1111-1111-111111111111';

    try {
        if (!nome || !email || !senha || !telefone) {
            return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ erro: 'Email inválido' });
        }
        if (!validator.isMobilePhone(telefone, 'pt-BR')) {
            return res.status(400).json({ erro: 'Telefone inválido' });
        }

        const { rows } = await pool.query('SELECT email FROM usuarios WHERE email = $1', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ erro: 'Email já cadastrado' });
        }

        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(senha, saltRounds);
        await pool.query(
            'INSERT INTO usuarios (id, nome, email, senha, telefone, plano_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [id, nome, email, hashedPassword, telefone, plano_id]
        );

        return res.status(201).json({ mensagem: 'Usuário registrado com sucesso', id });
    } catch (err) {
        return res.status(500).json({ mensagem: `Erro no servidor, ${err}` });
    }
};

// Login de usuário
export const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        if (!email || !senha) {
            return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
        }

        const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }

        const usuario = rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.json({ mensagem: 'Login bem-sucedido', token });
    } catch (err) {
        return res.status(500).json({ mensagem: 'Erro no servidor' });
    }
};