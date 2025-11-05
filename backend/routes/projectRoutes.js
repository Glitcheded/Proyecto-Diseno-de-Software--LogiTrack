import express from 'express';
import {
    getMisProyectos, getProyectosAnteriores, 
    crearProyecto, getProyectoPorId, 
    actualizarProyecto, eliminarProyecto, 
    asignarUsuarioAProyecto, getMisProyectosDatos, 
    getTareasPorNombre, getMiembrosProyecto, 
    removerMiembroProyecto, entradasBitacoraPorProyectoYFecha, 
    actualizarEntradaBitacora, addEntradaBitacora
} from '../controllers/projectController.js';
import { checkAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
// Protegemos todas las rutas de proyectos
router.use(checkAuth);

// Rutas de proyectos

// GET /api/projects/datos-proyectos 
router.get('/datos-proyectos', getMisProyectosDatos);

// GET /api/projects/mis-proyectos
router.get('/mis-proyectos', getMisProyectos);

// GET /api/projects/anteriores
router.get('/anteriores', getProyectosAnteriores);

// POST /api/projects
router.post('/', crearProyecto);

// GET /api/projects/:id 
router.get('/:id', getProyectoPorId);

// GET /api/projects/por-nombre/:nombreProyecto
router.get('/por-nombre/:nombreProyecto', getTareasPorNombre);

// PUT /api/projects/:id 
router.put('/:id', actualizarProyecto);

// DELETE /api/projects/:id
router.delete('/:id', eliminarProyecto);

// POST /api/projects/:id/assign
router.post('/:id/assign', asignarUsuarioAProyecto);

// GET /api/projects/:id/members
router.get('/:id/members', getMiembrosProyecto);

// DELETE /api/projects/:idProyecto/members/:idUsuario
router.delete('/:idProyecto/members/:idUsuario', removerMiembroProyecto);

// GET /api/projects/:id/:date/entries
router.get('/:id/:date/entries', entradasBitacoraPorProyectoYFecha)

// GET /api/projects/entrada/:id
router.put('/entrada/:id', actualizarEntradaBitacora);

// POST /api/projects/:idProyecto/:fecha
router.post("/:idProyecto/:fecha", addEntradaBitacora);

export default router;