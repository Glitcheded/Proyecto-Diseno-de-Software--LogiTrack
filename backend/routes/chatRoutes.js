import express from 'express';
import { crearChatPrivadoHandler } from '../controllers/chatController.js';

const router = express.Router();

router.post('/crearChatPrivado', crearChatPrivadoHandler);

export default router;