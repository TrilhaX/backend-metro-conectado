import express from 'express'
import { getAllUsers, getUserById, updatePerfilUser, register, login } from '../auth/authController.js';
const router = express.Router()

// Rotas de autenticação e usuários
router.get('/', getAllUsers)
router.get('/:id', getUserById)
router.put('/:id', updatePerfilUser);
router.post('/register', register)
router.post('/login', login)

export default router