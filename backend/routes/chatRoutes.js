import express from 'express';
import { crearChatPrivadoHandler, obtenerChats, crearMensaje, listarMensajesPorChat } from '../controllers/chatController.js';

const router = express.Router();

router.get('/:correo', obtenerChats);
router.post('/crearChatPrivado', crearChatPrivadoHandler);
router.post('/enviarMsj', crearMensaje);
router.get("/msj/:idChat", listarMensajesPorChat);

export default router;