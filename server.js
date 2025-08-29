import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'https://seu-frontend-deploy.com'],
    methods: ['GET','POST','PUT','DELETE'],
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API rodando!');
});

const PORT = process.env.PORT || 5051;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));