import express from 'express';
import { crearChat } from '../controllers/chatController.js';

const router = express.Router();

router.post('/crearChat', crearChat);

export default router;
