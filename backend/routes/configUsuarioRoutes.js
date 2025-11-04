import express from 'express';
import { obtenerConfiguracionUsuarioHandler, actualizarConfiguracionHandler,
    actualizarUsuarioHandler, getUserByEmail
 } from '../controllers/configUsuarioController.js';
import { checkAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/getConfiguraciones', checkAuth, obtenerConfiguracionUsuarioHandler);
router.patch('/updateConfiguraciones', checkAuth, actualizarConfiguracionHandler);
router.patch('/updateUsuario', checkAuth, actualizarUsuarioHandler);
router.get("/email/:email", getUserByEmail);

export default router;