import express from 'express';
import { obtenerConfiguracionUsuarioHandler, actualizarConfiguracionHandler,
    actualizarUsuarioHandler, getUserByEmail
 } from '../controllers/configUsuarioController.js';

const router = express.Router();

router.get('/getConfiguraciones', obtenerConfiguracionUsuarioHandler);
router.patch('/updateConfiguraciones', actualizarConfiguracionHandler);
router.patch('/updateUsuario', actualizarUsuarioHandler);
router.get("/email/:email", getUserByEmail);

export default router;