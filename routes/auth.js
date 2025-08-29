import express from 'express';
import { getAllUsers, getUserById, updatePerfilUser, register, login } from '../auth/authController.js';

const router = express.Router();

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updatePerfilUser);
router.post('/register', register);
router.post('/login', login);

export default router;
