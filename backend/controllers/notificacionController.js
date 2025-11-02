import { getNotificacionesPorUsuario, insertarNotificacionChat } from '../models/notificacionModel.js';

export async function getNotificaciones(req, res) {
  try {
    const correo = req.params.correo;
    const notificaciones = await getNotificacionesPorUsuario(correo);

    if (!notificaciones || notificaciones.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron notificaciones.' });
    }

    res.status(200).json(notificaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function crearNotificacionChat(req, res) {
  try {
    const { correo, idChat, descripcion } = req.body;

    if (!correo || !idChat || !descripcion) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
    }

    const resultado = await insertarNotificacionChat(correo, idChat, descripcion);
    res.status(200).json({ resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
