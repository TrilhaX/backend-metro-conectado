import express from 'express';
import userRoutes from './routes/auth.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', userRoutes);

app.listen(5051, () => {
    console.log('Servidor rodando na porta 5051');
});
