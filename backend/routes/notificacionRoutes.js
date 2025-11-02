import express from 'express';
import { getNotificaciones, crearNotificacionChat } from '../controllers/notificacionController.js';

const router = express.Router();

router.get('/notificaciones/:correo', getNotificaciones);
router.post('/notificaciones/chat', crearNotificacionChat);


export default router;
