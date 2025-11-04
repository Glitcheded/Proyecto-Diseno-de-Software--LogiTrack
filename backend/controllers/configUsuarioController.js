import { obtenerConfiguracionPorUsuario, actualizarConfiguracionUsuario,
    actualizarUsuario } from '../models/configUsuarioModel.js'

import { supabase } from "../supabaseClient.js";

// Controlador para obtener las configuraciones actuales del usuario (los toggles)
export async function obtenerConfiguracionUsuarioHandler(req, res) {
  try {
    const idUsuario = req.idUsuario; //Obtiene el ID del token

    const configuraciones = await obtenerConfiguracionPorUsuario(idUsuario);

    if (!configuraciones || configuraciones.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron configuraciones para este usuario.' });
    }

    res.status(200).json(configuraciones);
  } catch (error) {
    console.error('❌ Error al obtener configuraciones:', error.message);
    res.status(500).json({ error: error.message });
  }
}

// Controlador para actualizar cambios a configuraciones (los toggles) 
export async function actualizarConfiguracionHandler(req, res) {
  try {
    const idUsuario = req.idUsuario; //Obtiene el ID del token
    const camposActualizados = req.body;

    if (Object.keys(camposActualizados).length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
    }

    if ('idConfiguracionUsuario' in camposActualizados || 'idUsuario' in camposActualizados 
    || 'contrasena' in camposActualizados || 'activado' in camposActualizados) {
        return res.status(403).json({ error: 'Los campos "idConfiguracionUsuario" y "idUsuario" no pueden ser modificados.'})
    }

    const resultado = await actualizarConfiguracionUsuario(idUsuario, camposActualizados);

    if (!resultado || resultado.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró configuración para actualizar.' });
    }

    res.status(200).json(resultado);
  } catch (error) {
    console.error('❌ Error al actualizar configuración:', error.message);
    res.status(500).json({ error: error.message });
  }
}

// Controlador para actualizar cambios de usuario (nombre, correo, etc)
export async function actualizarUsuarioHandler(req, res) {
  try {
    const idUsuario = req.idUsuario; //Obtiene el ID del token
    const camposActualizados = req.body;

    if (Object.keys(camposActualizados).length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
    }

    if ('email' in camposActualizados || 'idUsuario' in camposActualizados 
        || 'contrasena' in camposActualizados || 'activado' in camposActualizados) {
      return res.status(403).json({ error: 'Los campos "email", "idUsuario","contrasena" y "activado" no pueden ser modificados.' });
    }

    const resultado = await actualizarUsuario(idUsuario, camposActualizados);

    if (!resultado || resultado.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró información para actualizar.' });
    }

    res.status(200).json(resultado);
  } catch (error) {
    console.error('❌ Error al actualizar información:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    console.log("📩 [getUserByEmail] Request received with email:", email);

    if (!email) {
      console.warn("⚠️ No email parameter provided");
      return res.status(400).json({ error: "Se requiere un email" });
    }

    console.log("🔍 Querying Supabase for user...");
    const { data, error } = await supabase
      .from("Usuario")
      .select("idUsuario, nombre, apellido, email")
      .eq("email", email)
      .single();

    if (error) {
      console.error("❌ Supabase error while fetching user:", error.message);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      console.warn("⚠️ No user found for email:", email);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    console.log("✅ User found:", data);
    res.status(200).json(data);

  } catch (err) {
    console.error("🔥 [getUserByEmail] Unexpected error:", err.message);
    res.status(500).json({ error: err.message });
  }
};