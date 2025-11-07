import express from 'express';
import { crearChatPrivadoHandler, obtenerChats, crearMensaje, listarMensajesPorChat,
    crearChatGrupal, eliminarChatController
 } from '../controllers/chatController.js';

const router = express.Router();

router.get('/:correo', obtenerChats);
router.post('/crearChatPrivado', crearChatPrivadoHandler);
router.post('/crearChatGrupal', crearChatGrupal);
router.delete('/eliminarChat/:idChat', eliminarChatController);
router.post('/enviarMsj', crearMensaje);
router.get("/msj/:idChat", listarMensajesPorChat);

export default router;