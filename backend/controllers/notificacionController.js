import { getTodasLasCategorias, getNotificacionesPorUsuario, insertarNotificacionChat, 
    insertarNotificacionProyecto, insertarNotificacionTarea,
    insertarNotificacionSistema, getNotificacionesRecientesPorCategoria,
    borrarNotificacionesPorId, desactivarNotificacionPorId } from '../models/notificacionModel.js';

// Controlador para obtener las categorias
export async function obtenerCategoriasHandler(req, res) {
  try {
    const categorias = await getTodasLasCategorias();

    if (!categorias || categorias.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron categorías.' });
    }

    res.status(200).json(categorias);
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error.message);
    res.status(500).json({ error: error.message });
  }
}


// Controlador para obtener notificaciones por categoria
export async function getNotificacionesPorCategoria(req, res) {
  try {
    const { usuario, categoria } = req.query;
    console.log('🔍 Parámetros recibidos:', req.query);

    if (!usuario || !categoria) {
      return res.status(400).json({ error: 'Faltan parámetros: usuario y categoria.' });
    }

    const idUsuario = Number(usuario);
    const idCategoria = Number(categoria);

    const notificaciones = await getNotificacionesRecientesPorCategoria(idUsuario, idCategoria);
    
    if (!notificaciones || notificaciones.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron notificaciones.' });
    }

    res.status(200).json(notificaciones);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ error: error.message });
  }
}

// Controlador para obtener notificaciones
export async function getNotificaciones(req, res) {
  try {
    const correo = req.params.correo;
    const notificaciones = await getNotificacionesPorUsuario(correo);

    if (!notificaciones || notificaciones.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron notificaciones.' });
    }

    const formatted = formatNotificaciones(notificaciones);

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ error: error.message });
  }
}

function formatNotificaciones(notificaciones) {
  return notificaciones.map((n) => {
    let date = "Sin fecha";
    let time = "Sin hora";

    if (n.fechahora) {
      const fechaStr = n.fechahora.replace(" ", "T");
      const fecha = new Date(fechaStr);

      if (!isNaN(fecha)) {
        date = fecha.toISOString().split("T")[0];
        time = fecha.toTimeString().slice(0, 5);
      } else {
        console.warn("Fecha inválida:", n.fechahora);
      }
    }

    return {
      id: n.idnotificacion,
      message: n.descripcion,
      date,
      time,
    };
  });
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

// Controlador para crear notificaciones de sistema
export async function crearNotificacionSistema(req, res) {
  try {
    const { correo, descripcion } = req.body;

    if (!correo || !descripcion) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
    }

    const resultado = await insertarNotificacionSistema(correo, descripcion);
    res.status(200).json({ resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Controlador para borrar notificaciones
export async function borrarNotificacionesHandler(req, res) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Debes proporcionar uno o más IDs en un array.' });
    }

    const idsNumericos = ids.map(Number).filter(id => !isNaN(id));

    if (idsNumericos.length === 0) {
      return res.status(400).json({ error: 'Los IDs deben ser números válidos.' });
    }

    const resultado = await borrarNotificacionesPorId(idsNumericos);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('❌ Error al borrar notificaciones:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function desactivarNotificacion(req, res) {
  try {
    const idNotificacion = req.params.id;

    const data = await desactivarNotificacionPorId(idNotificacion);

    if (!data || data.length === 0) {
      return res.status(404).json({ mensaje: 'Notificación no encontrada.' });
    }

    res.status(200).json({ mensaje: 'Notificación desactivada correctamente.' });
  } catch (error) {
    console.error('Error al desactivar notificación:', error.message);
    res.status(500).json({ error: error.message });
  }
}