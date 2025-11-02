import express from 'express';
import { obtenerConfiguracionUsuarioHandler, actualizarConfiguracionHandler } from '../controllers/configUsuarioController.js';

const router = express.Router();

router.get('/getConfiguraciones', obtenerConfiguracionUsuarioHandler);
router.patch('/updateConfiguraciones', actualizarConfiguracionHandler);


export default router;