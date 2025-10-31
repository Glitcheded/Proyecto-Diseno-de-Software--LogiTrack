// backend/routes/projects.js
import express from 'express';
import {getMisProyectos, getProyectosAnteriores, crearProyecto, getProyectoPorId, actualizarProyecto, eliminarProyecto, asignarUsuarioAProyecto} from '../controllers/projectController.js';
import { checkAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
// Protegemos todas las rutas de proyectos
router.use(checkAuth);

// Rutas de proyectos

// GET /api/projects/mis-proyectos
router.get('/mis-proyectos', getMisProyectos);

// GET /api/projects/anteriores
router.get('/anteriores', getProyectosAnteriores);

// POST /api/projects
router.post('/', crearProyecto);

// GET /api/projects/:id 
router.get('/:id', getProyectoPorId);

// PUT /api/projects/:id 
router.put('/:id', actualizarProyecto);

// DELETE /api/projects/:id
router.delete('/:id', eliminarProyecto);

// POST /api/projects/:id/assign
router.post('/:id/assign', asignarUsuarioAProyecto);

export default router;