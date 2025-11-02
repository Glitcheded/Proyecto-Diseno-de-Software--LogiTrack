import { obtenerConfiguracionPorUsuario } from '../models/configUsuarioModel.js'

// Controlador para obtener las configuraciones actuales del usuario (los toggles)
export async function obtenerConfiguracionUsuarioHandler(req, res) {
  try {
    const { usuario } = req.query;

    if (!usuario) {
      return res.status(400).json({ error: 'Falta el parámetro usuario.' });
    }

    const idUsuario = Number(usuario);
    if (isNaN(idUsuario)) {
      return res.status(400).json({ error: 'El parámetro usuario debe ser un número válido.' });
    }

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

