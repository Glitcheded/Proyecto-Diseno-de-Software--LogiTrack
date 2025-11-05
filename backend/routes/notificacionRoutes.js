import express from 'express';
import { obtenerCategoriasHandler, getNotificaciones, crearNotificacionChat, 
    crearNotificacionProyecto, crearNotificacionTarea,
    crearNotificacionSistema, getNotificacionesPorCategoria,
    borrarNotificacionesHandler, desactivarNotificacion} from '../controllers/notificacionController.js';

const router = express.Router();

router.get('/categorias', obtenerCategoriasHandler);
router.get('/notificaciones/categoria', getNotificacionesPorCategoria);

//GET /api/notificacion/notificaciones/:correo
router.get('/notificaciones/:correo', getNotificaciones);
router.post('/notificaciones/chat', crearNotificacionChat);
router.post('/notificaciones/proyecto', crearNotificacionProyecto);
router.post('/notificaciones/tarea', crearNotificacionTarea);
router.post('/notificaciones/sistema', crearNotificacionSistema);
router.delete('/borrarNotificaciones', borrarNotificacionesHandler);

// PUT /api/notificacion/desactivar/:id
router.put('/desactivar/:id', desactivarNotificacion);

export default router;
