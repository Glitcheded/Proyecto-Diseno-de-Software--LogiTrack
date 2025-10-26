import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes.js';


// Importar futuras rutas
// import authRoutes from './routes/auth.js';
// import taskRoutes from './routes/tasks.js';
// import projectRoutes from './routes/projects.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // El frontend corre en 5173, el backend en 3001

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Permite a Express entender JSON en el body

// Rutas de tu API
app.get('/api', (req, res) => {
  res.send('API de LogiTrack funciona');
});

//Rutas para chat
app.use('/api/chat', chatRoutes);

// Conectar las rutas
// app.use('/api/auth', authRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/projects', projectRoutes);


app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});