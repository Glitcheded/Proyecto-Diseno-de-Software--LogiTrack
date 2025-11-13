import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes...
import chatRoutes from './routes/chatRoutes.js';
import notificacionRoutes from './routes/notificacionRoutes.js';
import configUsuarioRoutes from './routes/configUsuarioRoutes.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// ✅ Allow both local and deployed frontends
const allowedOrigins = [
  'http://localhost:5173',
  'https://logitrack-zeta.vercel.app', // your actual deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('❌ CORS blocked:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Test route
app.get('/api', (req, res) => {
  res.send('✅ API de LogiTrack funcionando correctamente');
});

// Mount your routes
app.use('/api/chat', chatRoutes);
app.use('/api/notificacion', notificacionRoutes);
app.use('/api/config', configUsuarioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);

app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});
