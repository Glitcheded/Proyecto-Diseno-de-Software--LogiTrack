import express from 'express';
import { getMisTareas } from '../controllers/taskController.js';
import { checkAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
//Protejemos todas las rutas de tareas
router.use(checkAuth);

// Rutas de tareas 

// GET /api/tasks/mis-tareas
router.get('/mis-tareas', getMisTareas);

export default router;