import express from 'express';
import { getMisProyectos, getProyectosAnteriores } from '../controllers/projectController.js';
import { checkAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/mis-proyectos', checkAuth, getMisProyectos);
router.get('/anteriores', checkAuth, getProyectosAnteriores);

export default router;