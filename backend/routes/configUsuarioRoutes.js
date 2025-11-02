import express from 'express';
import { obtenerConfiguracionUsuarioHandler, actualizarConfiguracionHandler,
    actualizarUsuarioHandler
 } from '../controllers/configUsuarioController.js';

const router = express.Router();

router.get('/getConfiguraciones', obtenerConfiguracionUsuarioHandler);
router.patch('/updateConfiguraciones', actualizarConfiguracionHandler);
router.patch('/updateUsuario', actualizarUsuarioHandler);


export default router;