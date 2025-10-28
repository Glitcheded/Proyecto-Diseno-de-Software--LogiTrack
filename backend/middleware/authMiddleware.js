import { supabase } from '../supabaseClient.js';

export const checkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No autorizado: Sin token' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'No autorizado: Token inválido' });
    }

    // Traducir email a idUsuario
    const { data: usuarioLocal, error: localError } = await supabase
      .from('Usuario')
      .select('idUsuario')
      .eq('email', user.email)
      .single();

    if (localError || !usuarioLocal) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Adjunta el ID al objeto 'req' para que los siguientes controladores lo puedan usar.
    req.idUsuario = usuarioLocal.idUsuario;

    next(); // Pasa al siguiente controlador

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};