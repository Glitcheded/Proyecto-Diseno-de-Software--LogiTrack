import { supabase } from '../supabaseClient.js';

export const checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.log('[auth] No token received in Authorization header');
      return res.status(401).json({ error: 'No autorizado: Sin token' });
    }

    console.log('[auth] Token recibido (long):', token.length);

    // Intenta validar token con Supabase Auth
    const { data: getUserData, error: authError } = await supabase.auth.getUser(token);
    const user = getUserData?.user;

    console.log('[auth] supabase.auth.getUser result:', { authError: authError ? authError.message : null, userEmail: user?.email, userId: user?.id });

    if (authError || !user) {
      return res.status(401).json({ error: 'No autorizado: Token inválido o expirado' });
    }

        // authMiddleware.js (fragmento)
    const { data: usuarios, error: localError } = await supabase
      .from('Usuario')
      .select('idUsuario, email, nombre, apellido')
      .eq('email', user.email); // SIN .single()

    console.log('[auth] resultado usuarios:', { localError: localError?.message, usuarios });

    if (localError) {
      // Si hay un error inesperado
      return res.status(500).json({ error: localError.message });
    }

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si vienen varias filas, logueamos y usamos la primera (o mejor: forzar limpieza en DB)
    if (usuarios.length > 1) {
      console.warn('[auth] Atención: múltiples usuarios con el mismo email. Usando el primero. Recomendado limpiar DB');
    }

    const usuarioLocal = usuarios[0];
    req.idUsuario = usuarioLocal.idUsuario;
    next();


  } catch (error) {
    console.error('[auth] Error interno:', error);
    res.status(500).json({ error: error.message });
  }
};
