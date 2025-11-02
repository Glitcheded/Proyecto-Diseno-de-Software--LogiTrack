import express from 'express';
import { getNotificaciones, crearNotificacionChat, 
    crearNotificacionProyecto, crearNotificacionTarea } from '../controllers/notificacionController.js';

const router = express.Router();

router.get('/notificaciones/:correo', getNotificaciones);
router.post('/notificaciones/chat', crearNotificacionChat);
router.post('/notificaciones/proyecto', crearNotificacionProyecto);
router.post('/notificaciones/tarea', crearNotificacionTarea);


export default router;
