import express from 'express';
import { getNotificaciones } from '../controllers/notificacionController.js';

const router = express.Router();

router.get('/notificaciones/:correo', getNotificaciones);

export default router;
