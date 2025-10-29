import express from 'express';
import { getMisProyectos, getProyectosAnteriores } from '../controllers/projectController.js';
import { checkAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas de proyectos

// GET /api/projects/mis-proyectos
router.get('/mis-proyectos', checkAuth, getMisProyectos);

// GET /api/projects/anteriores
router.get('/anteriores', checkAuth, getProyectosAnteriores);

// Aquí va el resto del CRUD

export default router;