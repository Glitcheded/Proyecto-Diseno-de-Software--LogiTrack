import { getNotificacionesPorUsuario, insertarNotificacionChat, 
    insertarNotificacionProyecto, insertarNotificacionTarea } from '../models/notificacionModel.js';

// Controlador para obtener notificaciones
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

// Controlador para crear notificaciones de chat
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

// Controlador para crear notificaciones de proyectos
export async function crearNotificacionProyecto(req, res) {
  try {
    const { idProyecto, descripcion } = req.body;

    if (!idProyecto || !descripcion) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
    }

    const resultado = await insertarNotificacionProyecto(idProyecto, descripcion);
    res.status(200).json({ resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Controlador para crear notificaciones de tareas
export async function crearNotificacionTarea(req, res) {
  try {
    const { idTarea, descripcion } = req.body;

    if (!idTarea || !descripcion) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
    }

    const resultado = await insertarNotificacionTarea(idTarea, descripcion);
    res.status(200).json({ resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}