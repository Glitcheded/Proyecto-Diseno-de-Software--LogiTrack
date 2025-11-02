import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import chatRoutes from './routes/chatRoutes.js';
import notificacionRoutes from './routes/notificacionRoutes.js';
import configUsuarioRoutes from './routes/configUsuarioRoutes.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // El frontend corre en 5173, el backend en 3001

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Permite a Express entender JSON en el body

// Rutas de API
app.get('/api', (req, res) => {
  res.send('API de LogiTrack funciona');
});

// Conectar las rutas
app.use('/api/chat', chatRoutes);
app.use('/api/notificacion', notificacionRoutes);
app.use('/api/config', configUsuarioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);

app.get('/api/test-rpc', async (req, res) => {
  const { data, error } = await supabase.rpc('getnotificacionesporcategoria', {
    in_id_usuario: 2,
    in_id_categoria: 1,
  });

  console.log('RPC:', { data, error });
  res.json({ data, error });
});



app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});