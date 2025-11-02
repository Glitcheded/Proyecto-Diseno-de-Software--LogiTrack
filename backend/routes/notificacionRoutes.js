import express from 'express';
import { getNotificaciones, crearNotificacionChat, 
    crearNotificacionProyecto, crearNotificacionTarea,
    crearNotificacionSistema, getNotificacionesPorCategoria } from '../controllers/notificacionController.js';

const router = express.Router();

router.get('/notificaciones/categoria', getNotificacionesPorCategoria);
router.get('/notificaciones/:correo', getNotificaciones);
router.post('/notificaciones/chat', crearNotificacionChat);
router.post('/notificaciones/proyecto', crearNotificacionProyecto);
router.post('/notificaciones/tarea', crearNotificacionTarea);
router.post('/notificaciones/sistema', crearNotificacionSistema);



export default router;
