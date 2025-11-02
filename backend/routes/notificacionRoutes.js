import express from 'express';
import { obtenerCategoriasHandler, getNotificaciones, crearNotificacionChat, 
    crearNotificacionProyecto, crearNotificacionTarea,
    crearNotificacionSistema, getNotificacionesPorCategoria,
    borrarNotificacionesHandler} from '../controllers/notificacionController.js';

const router = express.Router();

router.get('/categorias', obtenerCategoriasHandler);
router.get('/notificaciones/categoria', getNotificacionesPorCategoria);
router.get('/notificaciones/:correo', getNotificaciones);
router.post('/notificaciones/chat', crearNotificacionChat);
router.post('/notificaciones/proyecto', crearNotificacionProyecto);
router.post('/notificaciones/tarea', crearNotificacionTarea);
router.post('/notificaciones/sistema', crearNotificacionSistema);
router.delete('/borrarNotificaciones', borrarNotificacionesHandler);

export default router;
