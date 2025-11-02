import express from 'express';
import { signUp, logIn, logOut, getUserInfo } from '../controllers/authController.js';
import { checkAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signUp); // POST /api/auth/signup
router.post('/login', logIn); // POST /api/auth/login
router.post('/logout', logOut); // POST /api/auth/logout
router.get('/me', checkAuth, getUserInfo); // GET /api/auth/me

export default router;