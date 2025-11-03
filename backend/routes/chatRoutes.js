import express from 'express';
import { crearChatPrivadoHandler, obtenerChats } from '../controllers/chatController.js';

const router = express.Router();

router.get('/:correo', obtenerChats);
router.post('/crearChatPrivado', crearChatPrivadoHandler);

export default router;