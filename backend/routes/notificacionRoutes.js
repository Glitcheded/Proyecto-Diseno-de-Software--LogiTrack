import express from 'express';
import { getNotificaciones, crearNotificacionChat, 
    crearNotificacionProyecto } from '../controllers/notificacionController.js';

const router = express.Router();

router.get('/notificaciones/:correo', getNotificaciones);
router.post('/notificaciones/chat', crearNotificacionChat);
router.post('/notificaciones/proyecto', crearNotificacionProyecto);


export default router;
