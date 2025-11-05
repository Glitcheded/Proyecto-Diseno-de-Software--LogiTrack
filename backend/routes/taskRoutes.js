import express from 'express';
import { 
    getMisTareas, crearTarea,
    getTareaPorId, actualizarTarea,
    eliminarTarea, asignarUsuarioATarea,
    agregarComentario, getMiembrosProyecto,
    removerMiembroTarea, getTareasPorProyecto
} from '../controllers/taskController.js';
import { checkAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protegemos todas las rutas de tareas (para hacer cambios hay que estar logueado)
router.use(checkAuth);

// Rutas de tareas

// GET /api/tasks/mis-tareas
router.get('/mis-tareas', getMisTareas);

// POST /api/tasks
router.post('/', crearTarea);

// GET /api/tasks/:id
router.get('/:id', getTareaPorId);

// PUT /api/tasks/:id
router.put('/:id', actualizarTarea);

// DELETE /api/tasks/:id
router.delete('/:id', eliminarTarea);

// POST /api/tasks/:id/assign
router.post('/:id/assign', asignarUsuarioATarea);

// POST /api/tasks/:id/comment 
router.post('/:id/comment', agregarComentario);

// GET /api/tasks/:id/members
router.get('/:id/members', getMiembrosProyecto);

// DELETE /api/tasks/:idTarea/members/:idUsuario
router.delete('/:idTarea/members/:idUsuario', removerMiembroTarea);

// GET /api/tasks/proyecto/:idProyecto
router.get("/proyecto/:idProyecto", getTareasPorProyecto);

export default router;