import express from 'express';
import { obtenerConfiguracionUsuarioHandler } from '../controllers/configUsuarioController.js';

const router = express.Router();

router.get('/configuraciones', obtenerConfiguracionUsuarioHandler);

export default router;