import express from 'express';
import { getMisTareas } from '../controllers/taskController.js';
import { checkAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// rutas de tareas 
// Usa el middleware para proteger la ruta y obtener el idUsuario GET /api/tasks/mis-tareas
router.get('/mis-tareas', checkAuth, getMisTareas);

// Aquí va el resto del CRUD

export default router;